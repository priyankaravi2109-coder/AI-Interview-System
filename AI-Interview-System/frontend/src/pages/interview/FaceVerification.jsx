import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function FaceVerification() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  const [cameraStatus, setCameraStatus] = useState("starting");
  const [verificationStatus, setVerificationStatus] =
    useState("not_started");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMessage("");
    setCameraStatus("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setErrorMessage(
        "Camera access is not supported by this browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStatus("ready");
    } catch (error) {
      console.error("Camera error:", error);

      setCameraStatus("error");

      if (error.name === "NotAllowedError") {
        setErrorMessage(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (error.name === "NotFoundError") {
        setErrorMessage(
          "No camera was found. Please connect a camera and try again."
        );
      } else {
        setErrorMessage(
          "Unable to start the camera. Please check your camera."
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  };

  const handleVerification = () => {
    setErrorMessage("");
    setVerificationStatus("checking");

    /*
      IMPORTANT:
      The actual face comparison will be connected here
      with the backend face-verification API.

      The backend should compare:
      1. Registered candidate photo
      2. Live camera image

      We are NOT marking the candidate as verified here.
    */

    setTimeout(() => {
      setVerificationStatus("pending_backend");
    }, 1000);
  };

  const retryVerification = () => {
    setVerificationStatus("not_started");
    startCamera();
  };

  const continueToInstructions = () => {
    stopCamera();
    navigate("/interview/instructions");
  };

  return (
    <div className="verification-page">
      <div className="verification-card face-verification-card">

        <div className="verification-icon">
          👤
        </div>

        <h1>Face Verification</h1>

        <p>
          Please position your face inside the camera frame.
          Your live image will be compared with your registered
          profile photo before the interview begins.
        </p>

        <div className="camera-preview-container">
          {cameraStatus === "ready" ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
          ) : (
            <div className="camera-placeholder">
              {cameraStatus === "starting" && (
                <p>Starting camera...</p>
              )}

              {cameraStatus === "error" && (
                <p>Camera unavailable</p>
              )}
            </div>
          )}
        </div>

        {cameraStatus === "ready" && (
          <div className="face-instructions">
            <h3>Before verification</h3>

            <ul>
              <li>Keep your face clearly visible.</li>
              <li>Look directly at the camera.</li>
              <li>Make sure there is sufficient lighting.</li>
              <li>Only one person should be visible.</li>
            </ul>
          </div>
        )}

        {errorMessage && (
          <div className="verification-error">
            {errorMessage}
          </div>
        )}

        {verificationStatus === "not_started" &&
          cameraStatus === "ready" && (
            <button
              type="button"
              onClick={handleVerification}
            >
              Verify My Face
            </button>
          )}

        {verificationStatus === "checking" && (
          <div className="verification-processing">
            <h3>Verifying your face...</h3>
            <p>
              Please remain still while verification is
              being processed.
            </p>
          </div>
        )}

        {verificationStatus === "pending_backend" && (
          <>
            <div className="verification-warning">
              <strong>Backend verification required</strong>

              <p>
                The camera is working, but the actual face
                comparison service has not been connected yet.
              </p>
            </div>

            <button
              type="button"
              onClick={retryVerification}
            >
              Try Verification Again
            </button>
          </>
        )}

        {cameraStatus === "error" && (
          <button
            type="button"
            onClick={startCamera}
          >
            Try Camera Again
          </button>
        )}

        {verificationStatus === "verified" && (
          <button
            type="button"
            onClick={continueToInstructions}
          >
            Continue to Interview
          </button>
        )}

      </div>
    </div>
  );
}

export default FaceVerification;