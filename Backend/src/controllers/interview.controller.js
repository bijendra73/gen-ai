const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
  try {
    const { selfDescription, jobDescription } = req.body;

    //Extract the first line of the job description to use as a fallback title,
    // or give it a clean default name so Mongoose never errors out.
    const title = jobDescription
      ? jobDescription.split("\n")[0].substring(0, 50)
      : "Interview Plan";

    // parse resume text only if a file was uploaded
    let resumeText = "";
    if (req.file && req.file.buffer) {
      const pdf = require("pdf-parse");

      // Clean, runtime check to see exactly where the function is hidden
      const parseFunction =
        typeof pdf === "function"
          ? pdf
          : pdf.default ||
            Object.values(pdf).find((fn) => typeof fn === "function");

      if (!parseFunction) {
        throw new Error("Could not find a valid pdf-parse execution function");
      }

      const data = await parseFunction(req.file.buffer);
      resumeText = data && data.text ? data.text : "";
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });
console.log("--- GEMINI RETURNED RAW DATA: ---", JSON.stringify(interViewReportByAi, null, 2));

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      title: title,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interViewReportByAi,
    });

    return res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (err) {
    console.error("generateInterViewReportController error:", err);

    // Propagate AI service unavailability as 503
    if (err && (err?.error?.code === 503 || err?.status === "UNAVAILABLE")) {
      return res.status(503).json({
        message: "AI service temporarily unavailable. Try again later.",
        error: err.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: err && err.message ? err.message : String(err),
    });
  }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  // Remove the negative selection strings so data safely reaches your frontend dashboard
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;

  const interviewReport =
    await interviewReportModel.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
