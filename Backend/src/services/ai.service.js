const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    // helper: retry wrapper for transient AI errors
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    const callGenerateContentWithRetries = async (opts, maxAttempts = 3) => {
        let attempt = 0
        let lastErr
        while (attempt < maxAttempts) {
            try {
                const resp = await ai.models.generateContent(opts)
                return resp
            } catch (err) {
                lastErr = err
                // detect transient/unavailable errors from the GenAI client
                const isTransient = (err && ((err.error && err.error.code === 503) || err.status === "UNAVAILABLE" || (err.statusCode && err.statusCode >= 500)))
                attempt++
                if (!isTransient || attempt >= maxAttempts) break
                // exponential backoff
                const backoffMs = 500 * Math.pow(2, attempt - 1)
                await sleep(backoffMs)
            }
        }
        throw lastErr
    }

    const response = await callGenerateContentWithRetries({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })
// Safely extract text whether the SDK uses a method call or a direct property
const responseText = typeof response.text === 'function' ? response.text() : response.text;

if (!responseText) {
    throw new Error("AI service returned an empty text response");
}

try {
    return JSON.parse(responseText);
} catch (err) {
    // Fallback: Clean up Markdown code blocks if the AI accidentally included them
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(cleanJson);
    } catch (secondErr) {
        throw new Error("Failed to parse AI response JSON: " + secondErr.message);
    }
}
}

async function generatePdfFromHtml(htmlContent) {
  // Check if your app is running on live Render production
  const isProduction = process.env.NODE_ENV === 'production';

 const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm"
    }
  });

  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    // reuse retry wrapper used above
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    const callGenerateContentWithRetries = async (opts, maxAttempts = 3) => {
        let attempt = 0
        let lastErr
        while (attempt < maxAttempts) {
            try {
                const resp = await ai.models.generateContent(opts)
                return resp
            } catch (err) {
                lastErr = err
                const isTransient = (err && ((err.error && err.error.code === 503) || err.status === "UNAVAILABLE" || (err.statusCode && err.statusCode >= 500)))
                attempt++
                if (!isTransient || attempt >= maxAttempts) break
                const backoffMs = 500 * Math.pow(2, attempt - 1)
                await sleep(backoffMs)
            }
        }
        throw lastErr
    }

    const response = await callGenerateContentWithRetries({
        // model: "gemini-3-flash-preview",
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    if (!response || !response.text) {
        throw new Error("AI service returned empty response")
    }

    let jsonContent
    try {
        jsonContent = JSON.parse(response.text)
    } catch (err) {
        throw new Error("Failed to parse AI response for resume PDF: " + (err && err.message ? err.message : String(err)))
    }

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }