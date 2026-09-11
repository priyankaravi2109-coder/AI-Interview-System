import { useNavigate } from "react-router-dom";

function CandidateVerification() {
  const navigate = useNavigate();

  const handleStartVerification = () => {
    navigate("/interview/camera-permission");
  };

  return (
    <div className="verification-page">
      <div className="verification-card">

        <div className="verification-icon">
          ✓
        </div>

        <h1>Candidate Verification</h1>

        <p>
          Before starting your AI interview, your identity must
          be verified using your registered profile photo and
          live camera verification.
        </p>

        <div className="verification-info">
          <h3>Verification Process</h3>

          <ul>
            <li>
              Camera permission will be requested.
            </li>

            <li>
              Your live camera image will be checked against
              your registered profile photo.
            </li>

            <li>
              Only the verification result is required to
              continue with the interview.
            </li>

            <li>
              If verification fails, you may retry the process.
            </li>
          </ul>
        </div>

        <div className="verification-notice">
          <strong>Privacy Notice</strong>

          <p>
            Camera access is used only for identity verification
            and interview integrity checks. Please provide camera
            permission before continuing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartVerification}
        >
          Continue to Camera Permission
        </button>

      </div>
    </div>
  );
}

export default CandidateVerification;