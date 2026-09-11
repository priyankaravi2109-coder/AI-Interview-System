import { useEffect, useState } from "react";

function InterviewTimer({ duration = 30, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="interview-timer">
      <span>Time Remaining</span>

      <strong>
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </strong>
    </div>
  );
}

export default InterviewTimer;