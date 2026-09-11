import { useState } from "react";

function AnswerInput({ onSubmit, disabled = false }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!answer.trim()) {
      return;
    }

    if (onSubmit) {
      onSubmit(answer.trim());
    }

    setAnswer("");
  };

  return (
    <form className="answer-input" onSubmit={handleSubmit}>
      <label htmlFor="interview-answer">
        Your Answer
      </label>

      <textarea
        id="interview-answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Type your answer here..."
        rows="7"
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !answer.trim()}
      >
        Submit Answer
      </button>
    </form>
  );
}

export default AnswerInput;