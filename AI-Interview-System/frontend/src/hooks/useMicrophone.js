
import { useCallback, useEffect, useRef, useState } from "react";

function useMicrophone() {
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] =
    useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] =
    useState(false);
  const [isRecording, setIsRecording] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supported =
      !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.MediaRecorder
      );

    setIsSupported(supported);

    return () => {
      stopMicrophone();
    };
  }, []);

  const startMicrophone = useCallback(async () => {
    setError("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setIsSupported(false);
      setError(
        "Microphone access is not supported by this browser."
      );
      return null;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

      streamRef.current = stream;

      setPermissionGranted(true);
      setIsMicrophoneActive(true);

      return stream;
    } catch (microphoneError) {
      console.error(
        "Unable to access microphone:",
        microphoneError
      );

      setPermissionGranted(false);
      setIsMicrophoneActive(false);

      if (
        microphoneError?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Microphone permission was denied. Please allow microphone access and try again."
        );
      } else if (
        microphoneError?.name ===
          "NotFoundError" ||
        microphoneError?.name ===
          "DevicesNotFoundError"
      ) {
        setError(
          "No microphone was found on this device."
        );
      } else if (
        microphoneError?.name ===
        "NotReadableError"
      ) {
        setError(
          "The microphone is already being used by another application."
        );
      } else if (
        microphoneError?.name ===
        "SecurityError"
      ) {
        setError(
          "Microphone access was blocked by browser security settings."
        );
      } else {
        setError(
          "Unable to access the microphone. Please check your browser permissions."
        );
      }

      return null;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (
        mediaRecorderRef.current.state !==
        "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    setIsMicrophoneActive(false);
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    setError("");

    if (!streamRef.current) {
      setError(
        "Microphone is not active."
      );
      return false;
    }

    if (!window.MediaRecorder) {
      setError(
        "Audio recording is not supported by this browser."
      );
      return false;
    }

    if (isRecording) {
      return false;
    }

    try {
      chunksRef.current = [];

      const recorder =
        new MediaRecorder(
          streamRef.current
        );

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onerror = (event) => {
        console.error(
          "Microphone recording error:",
          event
        );

        setError(
          "An error occurred while recording your answer."
        );

        setIsRecording(false);
      };

      recorder.start();

      setIsRecording(true);

      return true;
    } catch (recordingError) {
      console.error(
        "Unable to start recording:",
        recordingError
      );

      setError(
        "Unable to start audio recording."
      );

      return false;
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder =
        mediaRecorderRef.current;

      if (!recorder) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      if (recorder.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType =
          recorder.mimeType ||
          "audio/webm";

        const audioBlob =
          new Blob(
            chunksRef.current,
            {
              type: mimeType,
            }
          );

        chunksRef.current = [];

        mediaRecorderRef.current =
          null;

        setIsRecording(false);

        resolve(audioBlob);
      };

      recorder.stop();
    });
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    stream: streamRef.current,

    isSupported,
    permissionGranted,
    isMicrophoneActive,
    isRecording,
    error,

    startMicrophone,
    stopMicrophone,

    startRecording,
    stopRecording,

    clearError,
  };
}

export default useMicrophone;

