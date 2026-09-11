import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import interviewService from "../../services/interviewService";
import evaluationService from "../../services/evaluationService";

function CommunicationAssessment() {
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
   * Load communication question from backend.
   */
  useEffect(() => {
    const loadCommunicationQuestion = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

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
         * Request the next communication question.
         *
         * The backend should use the interview
         * configuration/category to provide the
         * appropriate question.
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
            "No communication question was returned by the backend."
          );
        }

        setQuestion({
          ...loadedQuestion,
          category:
            loadedQuestion.category ||
            "Communication",
        });
      } catch (error) {
        console.error(
          "Unable to load communication question:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the communication assessment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCommunicationQuestion();
  }, []);

  /*
   * Submit communication answer.
   *
   * Flow:
   * 1. Save answer.
   * 2. Send answer to AI evaluation.
   * 3. Allow candidate to complete interview.
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
          "Please enter your answer before completing the interview."
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
            category: "Communication",
            difficulty:
              question.difficulty ||
              "Intermediate",
          }
        );

      /*
       * Get answer ID returned by backend.
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
          category: "Communication",
          difficulty:
            question.difficulty ||
            "Intermediate",
        }
      );

      setSubmitted(true);

      setEvaluationMessage(
        "Communication answer submitted and sent for AI evaluation."
      );
    } catch (error) {
      console.error(
        "Communication answer submission failed:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit your communication answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Complete the complete interview.
   *
   * The backend marks the interview completed,
   * after which the candidate is taken to the
   * completion screen.
   */
  const handleCompleteInterview = async () => {
    if (!interviewId) {
      navigate("/interview/complete");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      await interviewService.completeInterview(
        interviewId
      );

      navigate("/interview/complete");
    } catch (error) {
      console.error(
        "Unable to complete interview:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete the interview."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const questionNumber =
    question?.number ||
    question?.questionNumber ||
    1;

  const totalQuestions =
    question?.totalQuestions ||
    question?.total ||
    2;

  const category =
    question?.category ||
    "Communication";

  const difficulty =
    question?.difficulty ||
    "Intermediate";

  const questionText =
    question?.text ||
    question?.question ||
    question?.prompt ||
    "Communication assessment question";

  const progress =
    totalQuestions > 0
      ? (questionNumber / totalQuestions) * 100
      : 0;

  return (
    <div className="verification-page">
      <div className="verification-card communication-assessment-card">

        {/* Header */}

        <div className="verification-icon">
          💬
        </div>

        <h1>
          Communication Assessment
        </h1>

        <p>
          This section evaluates how clearly and
          effectively you communicate your ideas,
          explain technical concepts and respond
          to questions.
        </p>


        {/* Loading */}

        {loading && (
          <div className="verification-success">
            Loading communication assessment...
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
                  Focus areas include clarity,
                  explanation, organization and
                  effective communication.
                </li>

              </ul>

            </div>


            {/* Progress */}

            <div className="interview-progress">

              <div className="progress-label">

                <span>
                  Communication Assessment
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

              <label htmlFor="communication-answer">
                Your Answer
              </label>

              <textarea
                id="communication-answer"
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="Explain the concept clearly and simply..."
                rows={8}
                disabled={
                  submitted ||
                  submitting
                }
              />

            </div>


            {/* Evaluation Status */}

            {evaluationMessage && (
              <div className="verification-success">

                <strong>
                  Communication answer submitted
                  successfully.
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


            {/* Complete */}

            {submitted && (
              <button
                type="button"
                onClick={
                  handleCompleteInterview
                }
                disabled={submitting}
              >
                {submitting
                  ? "Completing Interview..."
                  : "Complete Interview"}
              </button>
            )}


            {/* Evaluation Information */}

            <div className="verification-notice">

              <strong>
                Communication Evaluation
              </strong>

              <p>
                Your response may be evaluated
                for clarity, relevance, organization,
                explanation ability, communication
                effectiveness and practical
                understanding.
              </p>

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default CommunicationAssessment;