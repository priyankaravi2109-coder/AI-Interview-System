
import { useCallback, useEffect, useRef, useState } from "react";

function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] =
    useState(false);
  const [isCameraActive, setIsCameraActive] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsSupported(
      !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      )
    );

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = useCallback(async () => {
    setError("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setIsSupported(false);
      setError(
        "Camera access is not supported by this browser."
      );
      return null;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      setPermissionGranted(true);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn(
            "Video playback requires user interaction:",
            playError
          );
        }
      }

      return stream;
    } catch (cameraError) {
      console.error(
        "Unable to access camera:",
        cameraError
      );

      setPermissionGranted(false);
      setIsCameraActive(false);

      if (
        cameraError?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (
        cameraError?.name ===
          "NotFoundError" ||
        cameraError?.name ===
          "DevicesNotFoundError"
      ) {
        setError(
          "No camera was found on this device."
        );
      } else if (
        cameraError?.name ===
        "NotReadableError"
      ) {
        setError(
          "The camera is already being used by another application."
        );
      } else if (
        cameraError?.name ===
        "SecurityError"
      ) {
        setError(
          "Camera access was blocked by the browser security settings."
        );
      } else {
        setError(
          "Unable to access the camera. Please check your browser permissions."
        );
      }

      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, []);

  const captureImage = useCallback(() => {
    if (
      !videoRef.current ||
      !isCameraActive
    ) {
      setError(
        "Camera is not active."
      );
      return null;
    }

    const video = videoRef.current;

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError(
        "Camera image is not ready yet. Please try again."
      );
      return null;
    }

    const canvas =
      document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Unable to capture camera image."
      );
      return null;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL(
      "image/jpeg",
      0.85
    );
  }, [isCameraActive]);

  const getVideoElement = useCallback(
    () => videoRef.current,
    []
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    videoRef,
    stream: streamRef.current,

    isSupported,
    permissionGranted,
    isCameraActive,
    error,

    startCamera,
    stopCamera,
    captureImage,
    getVideoElement,
    clearError,
  };
}

export default useCamera;

