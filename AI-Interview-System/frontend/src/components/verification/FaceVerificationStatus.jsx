import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraPreview from "../../components/verification/CameraPreview";

function FaceVerification() {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("ready");
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
          });

        setStream(mediaStream);
      } catch (error) {
        setStatus("camera_error");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleVerification = () => {
    setStatus("verifying");

    // Backend face verification will be connected here.
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  const continueToInstructions = () => {
    navigate("/interview/instructions");
  };

  return (
    <div className="verification-page">
      <div className="verification-card face-verification-card">
        <h1>Face Verification</h1>

        <p>
          Please position your face inside the camera frame.
          Your identity will be verified before the AI interview
          begins.
        </p>

        <CameraPreview stream={stream} />

        {status === "ready" && (
          <>
            <div className="verification-info">
              Make sure your face is clearly visible and only one
              person is present in the camera view.
            </div>

            <button
              type="button"
              onClick={handleVerification}
              disabled={!stream}
            >
              Verify My Face
            </button>
          </>
        )}

        {status === "verifying" && (
          <div className="verification-info">
            Verifying your face...
          </div>
        )}

        {status === "success" && (
          <>
            <div className="verification-success">
              Face verification successful.
            </div>

            <button
              type="button"
              onClick={continueToInstructions}
            >
              Continue to Interview Instructions
            </button>
          </>
        )}

        {status === "camera_error" && (
          <div className="verification-error">
            Unable to access the camera. Please check your browser
            camera permission and try again.
          </div>
        )}
      </div>
    </div>
  );
}

export default FaceVerification;