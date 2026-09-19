import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import interviewService from "../../services/interviewService";
import evaluationService from "../../services/evaluationService";

function BehavioralAssessment() {
  const navigate = useNavigate();

  const [interviewId, setInterviewId] = useState(null);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [evaluationMessage, setEvaluationMessage] =
    useState("");

  /*
   * Load the candidate's active interview and
   * request a behavioral question from the backend.
   */
  useEffect(() => {
    const loadBehavioralQuestion = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * Get candidate interviews.
         */
        const data =
          await interviewService.getMyInterviews();

        const interviews = Array.isArray(data)
          ? data
          : data?.interviews ||
            data?.data ||
            [];

        if (!interviews.length) {
          setErrorMessage(
            "No scheduled interview was found."
          );
          return;
        }

        /*
         * Find active interview.
         */
        const activeInterview =
          interviews.find(
            (item) =>
              item.status === "scheduled" ||
              item.status === "shortlisted" ||
              item.status === "identity_verified" ||
              item.status === "in_progress"
          ) || interviews[0];

        const id =
          activeInterview?._id ||
          activeInterview?.id ||
          activeInterview?.interviewId;

        if (!id) {
          setErrorMessage(
            "Interview information is incomplete."
          );
          return;
        }

        setInterviewId(id);

        /*
         * Ask backend for the next question.
         *
         * Backend should use the interview configuration
         * and generate/select a behavioral question.
         */
        const questionData =
          await interviewService.getNextQuestion(id);

        const loadedQuestion =
          questionData?.question ||
          questionData?.data?.question ||
          questionData?.data ||
          questionData;

        if (!loadedQuestion) {
          throw new Error(
            "No behavioral question was returned by the backend."
          );
        }

        /*
         * Make sure the UI identifies this
         * question as behavioral.
         */
        setQuestion({
          ...loadedQuestion,
          category:
            loadedQuestion.category ||
            "Behavioral",
        });
      } catch (error) {
        console.error(
          "Unable to load behavioral question:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the behavioral assessment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBehavioralQuestion();
  }, []);

  /*
   * Submit behavioral answer.
   *
   * Flow:
   * 1. Save answer.
   * 2. Send answer for AI evaluation.
   * 3. Show evaluation status.
   */
  const handleSubmit = async () => {
    if (
      !answer.trim() ||
      !interviewId ||
      !question ||
      submitting
    ) {
      if (!answer.trim()) {
        setErrorMessage(
          "Please enter your answer before continuing."
        );
      }

      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setEvaluationMessage("");

    try {
      const cleanedAnswer = answer.trim();

      const questionId =
        question?._id ||
        question?.id ||
        question?.questionId;

      /*
       * Save candidate answer.
       */
      const answerResponse =
        await interviewService.submitAnswer(
          interviewId,
          {
            questionId,
            question:
              question.text ||
              question.question ||
              question.prompt ||
              "",
            answer: cleanedAnswer,
            category: "Behavioral",
            difficulty:
              question.difficulty ||
              "Intermediate",
          }
        );

      /*
       * Extract answer ID.
       */
      const answerId =
        answerResponse?.answerId ||
        answerResponse?.data?.answerId ||
        answerResponse?.answer?._id ||
        answerResponse?.data?.answer?._id ||
        answerResponse?.answer?.id ||
        answerResponse?.data?.answer?.id ||
        answerResponse?._id ||
        answerResponse?.id;

      /*
       * AI evaluation.
       */
      await evaluationService.evaluateAnswer(
        interviewId,
        {
          answerId,
          questionId,
          question:
            question.text ||
            question.question ||
            question.prompt ||
            "",
          answer: cleanedAnswer,
          category: "Behavioral",
          difficulty:
            question.difficulty ||
            "Intermediate",
        }
      );

      setSubmitted(true);

      setEvaluationMessage(
        "Behavioral answer submitted and sent for AI evaluation."
      );
    } catch (error) {
      console.error(
        "Behavioral answer submission failed:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit your behavioral answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Continue to communication assessment.
   */
  const handleContinue = () => {
    navigate(
      "/interview/communication-assessment"
    );
  };

  const questionNumber =
    question?.number ||
    question?.questionNumber ||
    1;

  const totalQuestions =
    question?.totalQuestions ||
    question?.total ||
    4;

  const category =
    question?.category ||
    "Behavioral";

  const difficulty =
    question?.difficulty ||
    "Intermediate";

  const questionText =
    question?.text ||
    question?.question ||
    question?.prompt ||
    "Behavioral assessment question";

  const progress =
    totalQuestions > 0
      ? (questionNumber / totalQuestions) * 100
      : 0;

  return (
    <div className="verification-page">
      <div className="verification-card behavioral-assessment-card">

        {/* Header */}

        <div className="verification-icon">
          🧠
        </div>

        <h1>Behavioral Assessment</h1>

        <p>
          This section evaluates your behavior,
          decision-making, teamwork, communication
          and ability to handle real-world workplace
          situations.
        </p>


        {/* Loading */}

        {loading && (
          <div className="verification-success">
            Loading behavioral assessment...
          </div>
        )}


        {/* Error */}

        {errorMessage && (
          <div className="verification-error">
            {errorMessage}
          </div>
        )}


        {!loading && question && (
          <>

            {/* Assessment Information */}

            <div className="verification-info">

              <h3>
                Assessment Information
              </h3>

              <ul>

                <li>
                  Question {questionNumber} of{" "}
                  {totalQuestions}
                </li>

                <li>
                  Category: {category}
                </li>

                <li>
                  Difficulty: {difficulty}
                </li>

                <li>
                  Questions may focus on teamwork,
                  decision-making, conflict handling,
                  adaptability and workplace situations.
                </li>

              </ul>

            </div>


            {/* Progress */}

            <div className="interview-progress">

              <div className="progress-label">

                <span>
                  Behavioral Assessment
                </span>

                <span>
                  {questionNumber} /{" "}
                  {totalQuestions}
                </span>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>


            {/* Question */}

            <div className="question-content">

              <div className="question-meta">

                <span>
                  {category}
                </span>

                <span>
                  {difficulty}
                </span>

              </div>

              <h2>
                {questionText}
              </h2>

            </div>


            {/* Answer */}

            <div className="answer-input">

              <label htmlFor="behavioral-answer">
                Your Answer
              </label>

              <textarea
                id="behavioral-answer"
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="Explain the situation, what you did, and the result..."
                rows={8}
                disabled={
                  submitted ||
                  submitting
                }
              />

            </div>


            {/* Evaluation Message */}

            {evaluationMessage && (
              <div className="verification-success">

                <strong>
                  Answer submitted successfully.
                </strong>

                <p>
                  {evaluationMessage}
                </p>

              </div>
            )}


            {/* Submit */}

            {!submitted && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !answer.trim()
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Answer"}
              </button>
            )}


            {/* Continue */}

            {submitted && (
              <button
                type="button"
                onClick={handleContinue}
              >
                Continue to Communication Assessment
              </button>
            )}


            {/* Evaluation Information */}

            <div className="verification-notice">

              <strong>
                Behavioral Evaluation
              </strong>

              <p>
                Responses may be evaluated for
                decision-making, problem-solving
                approach, teamwork, adaptability,
                communication and how effectively
                the situation was handled.
              </p>

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default BehavioralAssessment;