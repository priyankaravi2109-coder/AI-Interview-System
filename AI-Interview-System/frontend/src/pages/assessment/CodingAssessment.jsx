
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import codingService from "../../services/codingService";

function CodingAssessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * Technical assessment normally follows
         * the interview.
         */
        const interviewId =
          localStorage.getItem("ai_interview_active") ||
          localStorage.getItem("interviewId");

        if (!interviewId) {
          throw new Error(
            "Active interview could not be found."
          );
        }

        const data =
          await codingService.getAssessment(
            interviewId
          );

        const loadedAssessment =
          data?.assessment ||
          data?.data ||
          data;

        if (!loadedAssessment) {
          throw new Error(
            "Technical assessment was not found."
          );
        }

        setAssessment(loadedAssessment);

        /*
         * Get first question.
         */
        let firstQuestion =
          data?.question ||
          data?.data?.question ||
          loadedAssessment?.questions?.[0];

        if (!firstQuestion) {
          const assessmentId =
            loadedAssessment?._id ||
            loadedAssessment?.id ||
            loadedAssessment?.assessmentId;

          if (assessmentId) {
            const questionData =
              await codingService.getQuestion(
                assessmentId,
                1
              );

            firstQuestion =
              questionData?.question ||
              questionData?.data?.question ||
              questionData?.data ||
              questionData;
          }
        }

        if (!firstQuestion) {
          throw new Error(
            "No technical assessment question was returned."
          );
        }

        setQuestion(firstQuestion);
      } catch (error) {
        console.error(
          "Unable to load coding assessment:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the technical assessment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, []);

  const getQuestionType = () => {
    const type =
      question?.type ||
      question?.questionType ||
      question?.category ||
      "coding";

    return String(type).toLowerCase();
  };

  const isMCQ =
    getQuestionType().includes("mcq") ||
    getQuestionType().includes("multiple");

  const isSQL =
    getQuestionType().includes("sql");

  const isDebugging =
    getQuestionType().includes("debug");

  const handleSubmit = async () => {
    if (!question || !assessment || submitting) {
      return;
    }

    if (
      isMCQ &&
      !selectedOption
    ) {
      setErrorMessage(
        "Please select an option before submitting."
      );
      return;
    }

    if (
      !isMCQ &&
      !answer.trim()
    ) {
      setErrorMessage(
        "Please enter your answer before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const assessmentId =
        assessment?._id ||
        assessment?.id ||
        assessment?.assessmentId;

      const questionId =
        question?._id ||
        question?.id ||
        question?.questionId;

      /*
       * MCQ answer.
       */
      if (isMCQ) {
        await codingService.submitAnswer(
          assessmentId,
          questionId,
          {
            answer: selectedOption,
            questionType: "MCQ",
          }
        );
      } else {
        /*
         * Coding / SQL / Debugging answer.
         */
        await codingService.submitCode(
          assessmentId,
          questionId,
          {
            code: answer,
            language:
              question?.language ||
              (isSQL ? "SQL" : "javascript"),
            questionType:
              isSQL
                ? "SQL"
                : isDebugging
                ? "Debugging"
                : "Coding",
          }
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Technical assessment submission failed:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit the answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteAssessment = async () => {
    try {
      setSubmitting(true);
      setErrorMessage("");

      const assessmentId =
        assessment?._id ||
        assessment?.id ||
        assessment?.assessmentId;

      await codingService.completeAssessment(
        assessmentId
      );

      navigate(
        "/interview/behavioral-assessment"
      );
    } catch (error) {
      console.error(
        "Unable to complete technical assessment:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete the technical assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const questionText =
    question?.text ||
    question?.question ||
    question?.prompt ||
    "Technical assessment question";

  const options =
    question?.options ||
    question?.choices ||
    [];

  const questionNumber =
    question?.number ||
    question?.questionNumber ||
    1;

  const totalQuestions =
    assessment?.totalQuestions ||
    assessment?.questionCount ||
    assessment?.questions?.length ||
    1;

  const progress =
    (questionNumber / totalQuestions) * 100;

  return (
    <div className="verification-page">

      <div className="verification-card">

        {/* Header */}

        <div className="verification-icon">
          💻
        </div>

        <h1>
          Technical Assessment
        </h1>

        <p>
          This assessment evaluates technical
          knowledge, coding ability, SQL,
          debugging and problem-solving skills.
        </p>


        {/* Loading */}

        {loading && (
          <div className="verification-notice">

            <strong>
              Loading Technical Assessment
            </strong>

            <p>
              Please wait while the assessment
              is retrieved from the backend.
            </p>

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
                  Type:{" "}
                  {isMCQ
                    ? "Multiple Choice"
                    : isSQL
                    ? "SQL"
                    : isDebugging
                    ? "Debugging"
                    : "Coding"}
                </li>

                {question?.difficulty && (
                  <li>
                    Difficulty:{" "}
                    {question.difficulty}
                  </li>
                )}

              </ul>

            </div>


            {/* Progress */}

            <div className="interview-progress">

              <div className="progress-label">

                <span>
                  Technical Assessment
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
                  {isMCQ
                    ? "MCQ"
                    : isSQL
                    ? "SQL"
                    : isDebugging
                    ? "Debugging"
                    : "Coding"}
                </span>

                {question?.difficulty && (
                  <span>
                    {question.difficulty}
                  </span>
                )}

              </div>

              <h2>
                {questionText}
              </h2>

            </div>


            {/* MCQ */}

            {isMCQ && (
              <div className="answer-input">

                <label>
                  Select your answer
                </label>

                {options.map(
                  (option, index) => {

                    const value =
                      typeof option ===
                      "string"
                        ? option
                        : option?.value ||
                          option?.text ||
                          option?.label ||
                          "";

                    return (
                      <label
                        key={index}
                        style={{
                          display: "block",
                          marginBottom: "12px",
                          cursor: "pointer",
                        }}
                      >

                        <input
                          type="radio"
                          name="technical-option"
                          value={value}
                          checked={
                            selectedOption ===
                            value
                          }
                          onChange={(event) => {
                            setSelectedOption(
                              event.target.value
                            );
                            setErrorMessage("");
                          }}
                          disabled={
                            submitted ||
                            submitting
                          }
                        />

                        {" "}

                        {value}

                      </label>
                    );
                  }
                )}

              </div>
            )}


            {/* Coding / SQL / Debugging */}

            {!isMCQ && (
              <div className="answer-input">

                <label htmlFor="technical-answer">

                  {isSQL
                    ? "SQL Query"
                    : isDebugging
                    ? "Corrected Code / Explanation"
                    : "Your Code"}

                </label>

                <textarea
                  id="technical-answer"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(
                      event.target.value
                    );
                    setErrorMessage("");
                  }}
                  placeholder={
                    isSQL
                      ? "Write your SQL query here..."
                      : "Write your solution here..."
                  }
                  rows={12}
                  disabled={
                    submitted ||
                    submitting
                  }
                  style={{
                    fontFamily:
                      "monospace",
                  }}
                />

              </div>
            )}


            {/* Submitted */}

            {submitted && (
              <div className="verification-success">

                <strong>
                  Technical answer submitted
                  successfully.
                </strong>

                <p>
                  Your answer has been sent to the
                  backend for evaluation.
                </p>

              </div>
            )}


            {/* Submit */}

            {!submitted && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
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
                  handleCompleteAssessment
                }
                disabled={submitting}
              >
                {submitting
                  ? "Completing..."
                  : "Complete Technical Assessment"}
              </button>
            )}


            {/* Evaluation Notice */}

            <div className="verification-notice">

              <strong>
                Technical Evaluation
              </strong>

              <p>
                Technical answers may be evaluated
                for correctness, code quality,
                practical knowledge, problem-solving,
                edge cases and test cases.
              </p>

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default CodingAssessment;

