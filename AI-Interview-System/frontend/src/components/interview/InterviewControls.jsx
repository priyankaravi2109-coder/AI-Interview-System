function InterviewControls({
  onNext,
  onPrevious,
  onFinish,
  canGoBack = false,
  canGoNext = true,
  isLastQuestion = false,
}) {
  return (
    <div className="interview-controls">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoBack}
      >
        Previous
      </button>

      {!isLastQuestion ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next Question
        </button>
      ) : (
        <button
          type="button"
          onClick={onFinish}
          disabled={!canGoNext}
        >
          Finish Interview
        </button>
      )}
    </div>
  );
}

export default InterviewControls;