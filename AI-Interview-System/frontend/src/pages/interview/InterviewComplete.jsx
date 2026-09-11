import { useNavigate } from "react-router-dom";

function InterviewComplete() {
  const navigate = useNavigate();

  const handleViewResult = () => {
    navigate("/interview/result");
  };

  return (
    <div className="verification-page">
      <div className="verification-card">

        {/* Completion Icon */}
        <div className="verification-icon">
          ✓
        </div>

        <h1>Interview Completed</h1>

        <p>
          Congratulations! You have successfully completed
          the AI-powered interview and assessment.
        </p>

        {/* Submission Status */}
        <div className="verification-success">
          <strong>Interview submitted successfully.</strong>

          <p>
            Your responses have been securely submitted for
            AI-powered evaluation.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="verification-info">
          <h3>What happens next?</h3>

          <ul
            style={{
              textAlign: "left",
              lineHeight: "1.8",
            }}
          >
            <li>
              Your technical responses will be evaluated.
            </li>

            <li>
              Your practical knowledge and problem-solving
              abilities will be assessed.
            </li>

            <li>
              Your behavioral responses will be evaluated.
            </li>

            <li>
              Your communication performance will be assessed.
            </li>

            <li>
              Skill-wise scores and an overall score will be generated.
            </li>

            <li>
              An AI-generated interview report will be prepared.
            </li>

            <li>
              The final recommendation will support HR review
              and will not be an automatic hiring decision.
            </li>
          </ul>
        </div>

        {/* Evaluation Status */}
        <div className="verification-notice">
          <strong>AI Evaluation in Progress</strong>

          <p>
            The final result and detailed report will be available
            after the backend evaluation service processes your
            interview responses.
          </p>
        </div>

        {/* Result Button */}
        <button
          type="button"
          onClick={handleViewResult}
        >
          View Interview Result
        </button>

      </div>
    </div>
  );
}

export default InterviewComplete;