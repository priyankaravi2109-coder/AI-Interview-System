import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CameraPermission() {
  const [cameraStatus, setCameraStatus] = useState("not_requested");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const requestCamera = async () => {
    setErrorMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("denied");
      setErrorMessage(
        "Camera access is not supported by this browser."
      );
      return;
    }

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      setCameraStatus("granted");

      // Camera is only requested on this page.
      // Stop the temporary stream after permission is confirmed.
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    } catch (error) {
      console.error("Camera permission error:", error);

      setCameraStatus("denied");

      if (error.name === "NotAllowedError") {
        setErrorMessage(
          "Camera permission was denied. Please allow camera access in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        setErrorMessage(
          "No camera was found. Please connect a camera and try again."
        );
      } else {
        setErrorMessage(
          "Unable to access the camera. Please check your camera and browser permissions."
        );
      }
    }
  };

  const continueToVerification = () => {
    navigate("/interview/face-verification");
  };

  return (
    <div className="verification-page">
      <div className="verification-card">

        <div className="verification-icon">
          📷
        </div>

        <h1>Camera Permission</h1>

        <p>
          Camera access is required for candidate face verification
          before the AI interview begins.
        </p>

        <div className="verification-info">
          <h3>Why is camera access required?</h3>

          <ul>
            <li>
              Your camera is required for identity verification.
            </li>

            <li>
              A live face image will be checked against your
              registered profile photo.
            </li>

            <li>
              Camera checks may also be used for interview
              integrity monitoring.
            </li>
          </ul>
        </div>

        {cameraStatus === "not_requested" && (
          <button
            type="button"
            onClick={requestCamera}
          >
            Allow Camera Access
          </button>
        )}

        {cameraStatus === "granted" && (
          <>
            <div className="verification-success">
              ✓ Camera permission granted successfully.
            </div>

            <button
              type="button"
              onClick={continueToVerification}
            >
              Continue to Face Verification
            </button>
          </>
        )}

        {cameraStatus === "denied" && (
          <>
            <div className="verification-error">
              {errorMessage ||
                "Camera permission was denied. Please allow camera access and try again."}
            </div>

            <button
              type="button"
              onClick={requestCamera}
            >
              Try Again
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default CameraPermission;