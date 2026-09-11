function InterviewProgress({
  currentQuestion = 1,
  totalQuestions = 20,
}) {
  const progress = Math.min(
    (currentQuestion / totalQuestions) * 100,
    100
  );

  return (
    <div className="interview-progress">
      <div className="progress-header">
        <span>Interview Progress</span>

        <strong>
          {currentQuestion} / {totalQuestions}
        </strong>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default InterviewProgress;