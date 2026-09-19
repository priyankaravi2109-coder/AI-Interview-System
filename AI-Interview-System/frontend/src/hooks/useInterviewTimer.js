
import { useCallback, useEffect, useRef, useState } from "react";

function useInterviewTimer(initialMinutes = 30) {
  const initialSeconds = Math.max(
    0,
    Math.floor(Number(initialMinutes) * 60)
  );

  const [remainingSeconds, setRemainingSeconds] =
    useState(initialSeconds);

  const [isRunning, setIsRunning] =
    useState(false);

  const [isFinished, setIsFinished] =
    useState(false);

  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    if (isFinished) return;

    setIsRunning(true);
  }, [isFinished]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(
    (minutes = initialMinutes) => {
      const seconds = Math.max(
        0,
        Math.floor(Number(minutes) * 60)
      );

      setRemainingSeconds(seconds);
      setIsRunning(false);
      setIsFinished(false);
    },
    [initialMinutes]
  );

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning || isFinished) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          setIsRunning(false);
          setIsFinished(true);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isFinished]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const minutes = Math.floor(
    remainingSeconds / 60
  );

  const seconds = remainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  const progressPercentage =
    initialSeconds > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (remainingSeconds / initialSeconds) * 100
          )
        )
      : 0;

  const isLowTime =
    remainingSeconds > 0 &&
    remainingSeconds <= 60;

  return {
    remainingSeconds,
    minutes,
    seconds,
    formattedTime,

    progressPercentage,

    isRunning,
    isFinished,
    isLowTime,

    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
  };
}

export default useInterviewTimer;

