import { useNavigate } from 'react-router'
import '../style/home.scss'
import Navbar from '../components/Navbar.jsx'

const Features = () => {
    const navigate = useNavigate()

    return (
        <div className='features-shell'>
            <Navbar showFeatures={false} showHistory={false} showHome />

            <header className='page-header'>
                <h1>Product Features</h1>
                <p>Use InterviewAI to generate a tailored interview strategy, prepare targeted answers, and review your prior interview plans.</p>
            </header>

            <section className='features-page'>
                <div className='feature-card'>
                    <div className='feature-icon'>
                        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M16 18l6-6-6-6' /><path d='M8 6v12' /><path d='M2 6h6' /><path d='M2 18h6' /></svg>
                    </div>
                    <h2>Tailored Interview Strategy</h2>
                    <p><strong>Smart Role Mapping</strong></p>
                    <p>Paste any enterprise job description alongside your professional background or self-description. Our specialized language model maps overlapping domains, evaluates architectural competencies, and provides an immediate alignment breakdown so you know exactly where you stand.</p>
                </div>
                <div className='feature-card'>
                    <div className='feature-icon'>
                        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' /><path d='M11 9h2' /><path d='M11 13h6' /></svg>
                    </div>
                    <h2>Interactive Preparation Tracks</h2>
                    <p><strong>Targeted Technical & Behavioral Q&As</strong></p>
                    <p>Get 3 to 4 hyper-focused technical questions alongside deep-dive situational behavioral questions complete with expected response details. Every question includes an explicit "Intention" metric, exposing exactly what core architectural skills an interviewer is attempting to validate.</p>
                </div>
                <div className='feature-card'>
                    <div className='feature-icon'>
                        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 11h18' /><path d='M5 7h14' /><path d='M12 11v10' /><path d='M5 15h4' /><path d='M15 15h4' /></svg>
                    </div>
                    <h2>Actionable Roadmaps</h2>
                    <p><strong>Structured 7-Day Roadmap & Skill Gaps</strong></p>
                    <p>Accelerate your preparation with an automated, step-by-step 7-day schedule tailored to patch your specific weaknesses. The platform highlights technical skill gaps, tags them by severity level (high, medium, or low), and designs sequential daily tasks to get you production-ready.</p>
                </div>
            </section>

            <section className='how-it-works'>
                <h3>How It Works</h3>
                <div className='how-steps'>
                    <div className='step-card'>
                        <span>1</span>
                        <div>
                            <h4>Paste Job & Profile</h4>
                            <p>Submit your target role and a short professional summary.</p>
                        </div>
                    </div>
                    <div className='step-card'>
                        <span>2</span>
                        <div>
                            <h4>Generate Structural Evaluation</h4>
                            <p>Receive deep-dive alignment insights, role mapping, and intention-driven questions.</p>
                        </div>
                    </div>
                    <div className='step-card'>
                        <span>3</span>
                        <div>
                            <h4>Crush Technical Rounds</h4>
                            <p>Use the 7-day roadmap and skill gap plan to prepare efficiently and confidently.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </div>
        </div>
    )
}

export default Features
