import { useNavigate } from "react-router-dom";

export default function InterviewInstructions() {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate("/interview/ai-interview");
  };

  return (
    <div className="verification-page">
      <div className="verification-card">

        <div className="verification-icon">
          📋
        </div>

        <h1>Interview Instructions</h1>

        <p>
          Please read the following instructions carefully
          before starting your AI-powered interview.
        </p>

        <div className="verification-info">

          <h3>Before You Start</h3>

          <ul>
            <li>
              Make sure you are in a quiet and well-lit
              environment.
            </li>

            <li>
              Keep your face clearly visible to the camera
              throughout the interview.
            </li>

            <li>
              Make sure your camera and microphone are
              working properly.
            </li>

            <li>
              Answer every question clearly and honestly.
            </li>
          </ul>

          <h3>During the Interview</h3>

          <ul>
            <li>
              Questions may cover technical skills,
              behavioral skills, scenarios, problem solving
              and communication.
            </li>

            <li>
              Questions are generated according to the
              candidate profile, role, skills, experience
              and job requirements.
            </li>

            <li>
              The AI interviewer may ask follow-up questions
              based on your previous answer.
            </li>

            <li>
              The difficulty of questions may change based
              on your interview performance.
            </li>

            <li>
              Complete the interview within the allotted
              interview duration.
            </li>

            <li>
              Avoid leaving the interview screen
              unnecessarily.
            </li>
          </ul>

          <h3>Assessment Sections</h3>

          <ul>
            <li>Technical Assessment</li>
            <li>Behavioral Assessment</li>
            <li>Communication Assessment</li>
            <li>Final AI Evaluation</li>
          </ul>

          <h3>Important</h3>

          <p>
            Your answers will be evaluated based on factors
            such as correctness, relevance, technical
            knowledge, problem solving, communication,
            confidence, depth and practical knowledge.
          </p>

          <p>
            The final AI evaluation is intended to support
            HR decision-making and should not be treated as
            an automatic hiring decision.
          </p>

        </div>

        <button
          type="button"
          onClick={handleStartInterview}
        >
          Start AI Interview
        </button>

      </div>
    </div>
  );
}