import { useEffect, useRef } from "react";

function CameraPreview({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="camera-preview">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
      />

      {!stream && (
        <div className="camera-placeholder">
          Camera preview will appear here.
        </div>
      )}
    </div>
  );
}

export default CameraPreview;