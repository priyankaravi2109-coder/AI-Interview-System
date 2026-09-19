
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import codingService from "../../services/codingService";

function MCQAssessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [question, setQuestion] = useState(null);

  const [selectedOption, setSelectedOption] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadMCQAssessment = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const interviewId =
          localStorage.getItem(
            "ai_interview_active"
          ) ||
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
            "MCQ assessment was not found."
          );
        }

        setAssessment(loadedAssessment);

        /*
         * Try to use the first question returned
         * by the backend.
         */
        let firstQuestion =
          data?.question ||
          data?.data?.question ||
          loadedAssessment?.questions?.[0];

        /*
         * If the first question was not included,
         * request it separately.
         */
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
            "No MCQ question was returned by the backend."
          );
        }

        setQuestion(firstQuestion);
      } catch (error) {
        console.error(
          "Unable to load MCQ assessment:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the MCQ assessment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMCQAssessment();
  }, []);

  const handleSubmit = async () => {
    if (
      !selectedOption ||
      !assessment ||
      !question ||
      submitting
    ) {
      if (!selectedOption) {
        setErrorMessage(
          "Please select an answer before submitting."
        );
      }

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

      await codingService.submitAnswer(
        assessmentId,
        questionId,
        {
          answer: selectedOption,
          questionType: "MCQ",
        }
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "MCQ answer submission failed:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit the MCQ answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!assessment) {
      navigate(
        "/interview/behavioral-assessment"
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

      await codingService.completeAssessment(
        assessmentId
      );

      navigate(
        "/interview/behavioral-assessment"
      );
    } catch (error) {
      console.error(
        "Unable to complete MCQ assessment:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete the MCQ assessment."
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
    assessment?.totalQuestions ||
    assessment?.questionCount ||
    assessment?.questions?.length ||
    1;

  const options =
    question?.options ||
    question?.choices ||
    [];

  const questionText =
    question?.text ||
    question?.question ||
    question?.prompt ||
    "Multiple-choice question";

  const difficulty =
    question?.difficulty ||
    "Intermediate";

  const progress =
    (questionNumber / totalQuestions) * 100;

  return (
    <div className="verification-page">

      <div className="verification-card">

        {/* Header */}

        <div className="verification-icon">
          📝
        </div>

        <h1>
          MCQ Assessment
        </h1>

        <p>
          Answer the multiple-choice questions based
          on your technical knowledge and problem-solving
          ability.
        </p>


        {/* Loading */}

        {loading && (
          <div className="verification-notice">

            <strong>
              Loading MCQ Assessment
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
                  Type: Multiple Choice
                </li>

                <li>
                  Difficulty: {difficulty}
                </li>

              </ul>

            </div>


            {/* Progress */}

            <div className="interview-progress">

              <div className="progress-label">

                <span>
                  MCQ Assessment
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
                  MCQ
                </span>

                <span>
                  {difficulty}
                </span>

              </div>

              <h2>
                {questionText}
              </h2>

            </div>


            {/* Options */}

            <div className="answer-input">

              <label>
                Select your answer
              </label>

              {options.length > 0 ? (
                options.map(
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
                          marginBottom: "14px",
                          padding: "10px",
                          cursor: submitted
                            ? "default"
                            : "pointer",
                        }}
                      >

                        <input
                          type="radio"
                          name="mcq-answer"
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
                )
              ) : (
                <p>
                  No answer options were provided
                  by the backend.
                </p>
              )}

            </div>


            {/* Submitted */}

            {submitted && (
              <div className="verification-success">

                <strong>
                  MCQ answer submitted successfully.
                </strong>

                <p>
                  Your answer has been sent to the
                  backend assessment service.
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
                  !selectedOption ||
                  options.length === 0
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
                onClick={handleComplete}
                disabled={submitting}
              >
                {submitting
                  ? "Completing..."
                  : "Complete MCQ Assessment"}
              </button>
            )}


            {/* Evaluation Notice */}

            <div className="verification-notice">

              <strong>
                MCQ Evaluation
              </strong>

              <p>
                MCQ responses can be evaluated for
                correctness as part of the technical
                assessment.
              </p>

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default MCQAssessment;

