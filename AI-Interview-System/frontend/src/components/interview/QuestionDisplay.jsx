function QuestionDisplay({
  question,
  questionNumber = 1,
  totalQuestions = 1,
}) {
  const questionText =
    question?.text ||
    "Your interview question will appear here.";

  const category =
    question?.category ||
    "Interview Question";

  const difficulty =
    question?.difficulty ||
    "Not specified";

  return (
    <div className="question-display">

      <div className="question-header">

        <span>
          Question {questionNumber} of {totalQuestions}
        </span>

        <span className="question-difficulty">
          Difficulty: {difficulty}
        </span>

      </div>

      <div className="question-content">

        <h2>
          {questionText}
        </h2>

      </div>

      <div className="question-category">

        <strong>Category:</strong>{" "}
        {category}

      </div>

    </div>
  );
}

export default QuestionDisplay;