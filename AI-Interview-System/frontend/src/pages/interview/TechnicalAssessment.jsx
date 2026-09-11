import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import codingService from "../../services/codingService";

function TechnicalAssessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [question, setQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [assessmentId, setAssessmentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Load technical assessment.
   *
   * The backend provides:
   * - assessment configuration
   * - question type
   * - question
   * - options where applicable
   * - coding/SQL/debugging information where applicable
   */
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * The AI interview stores its interview ID here.
         */
        const savedInterview =
          localStorage.getItem("ai_interview_active");

        let interviewId = null;

        if (savedInterview) {
          try {
            const parsedInterview =
              JSON.parse(savedInterview);

            interviewId =
              parsedInterview?.interviewId ||
              parsedInterview?.id ||
              parsedInterview?._id;
          } catch (error) {
            console.error(
              "Unable to read saved interview:",
              error
            );
          }
        }

        /*
         * Fallback for projects where the interview ID
         * is stored using another key.
         */
        interviewId =
          interviewId ||
          localStorage.getItem("interviewId");

        if (!interviewId) {
          setErrorMessage(
            "Interview information was not found. Please start the interview again."
          );
          return;
        }

        const data =
          await codingService.getAssessment(
            interviewId
          );

        const loadedAssessment =
          data?.assessment ||
          data?.data?.assessment ||
          data?.data ||
          data;

        if (!loadedAssessment) {
          throw new Error(
            "Technical assessment was not returned by the backend."
          );
        }

        const id =
          loadedAssessment._id ||
          loadedAssessment.id ||
          loadedAssessment.assessmentId;

        setAssessmentId(id);
        setAssessment(loadedAssessment);

        /*
         * Backend may return the first question
         * together with the assessment.
         */
        const firstQuestion =
          loadedAssessment.question ||
          loadedAssessment.currentQuestion ||
          loadedAssessment.questions?.[0] ||
          data?.question ||
          data?.data?.question;

        if (firstQuestion) {
          setQuestion(firstQuestion);
        } else if (id) {
          /*
           * Otherwise request the first question.
           */
          const questionData =
            await codingService.getQuestion(
              id,
              1
            );

          const loadedQuestion =
            questionData?.question ||
            questionData?.data?.question ||
            questionData?.data ||
            questionData;

          if (loadedQuestion) {
            setQuestion(loadedQuestion);
          }
        }
      } catch (error) {
        console.error(
          "Unable to load technical assessment:",
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

  /*
   * Get question type.
   */
  const getQuestionType = () => {
    return (
      question?.type ||
      question?.questionType ||
      question?.assessmentType ||
      "MCQ"
    ).toUpperCase();
  };

  /*
   * Get question number.
   */
  const getQuestionNumber = () => {
    return (
      question?.number ||
      question?.questionNumber ||
      1
    );
  };

  /*
   * Get total questions.
   */
  const getTotalQuestions = () => {
    return (
      assessment?.totalQuestions ||
      assessment?.questionCount ||
      assessment?.questions?.length ||
      5
    );
  };

  /*
   * Get question text.
   */
  const getQuestionText = () => {
    return (
      question?.text ||
      question?.question ||
      question?.prompt ||
      "Technical assessment question"
    );
  };

  /*
   * Get options.
   */
  const getOptions = () => {
    return (
      question?.options ||
      question?.choices ||
      []
    );
  };

  /*
   * Submit current technical question.
   */
  const handleSubmit = async () => {
    if (!assessmentId || !question) {
      setErrorMessage(
        "Technical assessment information is missing."
      );
      return;
    }

    const type = getQuestionType();

    /*
     * MCQ requires an option.
     */
    if (
      type === "MCQ" &&
      !selectedAnswer
    ) {
      setErrorMessage(
        "Please select an answer before continuing."
      );
      return;
    }

    /*
     * Coding / SQL / debugging questions
     * require code or an answer.
     */
    if (
      type !== "MCQ" &&
      !code.trim() &&
      !selectedAnswer
    ) {
      setErrorMessage(
        "Please provide your answer before continuing."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const questionId =
        question?._id ||
        question?.id ||
        question?.questionId ||
        getQuestionNumber();

      /*
       * MCQ / normal technical answer.
       */
      if (type === "MCQ") {
        await codingService.submitAnswer(
          assessmentId,
          questionId,
          {
            answer: selectedAnswer,
            questionType: type,
          }
        );
      } else {
        /*
         * Coding / SQL / debugging answer.
         */
        await codingService.submitCode(
          assessmentId,
          questionId,
          {
            code: code.trim(),
            answer: selectedAnswer,
            language:
              question?.language ||
              question?.programmingLanguage ||
              "text",
            questionType: type,
          }
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Technical answer submission failed:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit your technical answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Complete technical assessment.
   */
  const handleContinue = async () => {
    if (!assessmentId) {
      navigate(
        "/interview/behavioral-assessment"
      );
      return;
    }

    try {
      setSubmitting(true);

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
          "Unable to complete the technical assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const questionNumber = getQuestionNumber();
  const totalQuestions = getTotalQuestions();
  const questionType = getQuestionType();
  const options = getOptions();

  const progress =
    totalQuestions > 0
      ? (questionNumber / totalQuestions) * 100
      : 0;

  return (
    <div className="verification-page">
      <div className="verification-card technical-assessment-card">

        {/* Header */}

        <div className="verification-icon">
          💻
        </div>

        <h1>Technical Assessment</h1>

        <p>
          This assessment evaluates your technical
          knowledge, practical understanding and
          problem-solving abilities.
        </p>


        {/* Loading */}

        {loading && (
          <div className="verification-success">
            Loading technical assessment...
          </div>
        )}


        {/* Error */}

        {errorMessage && (
          <div className="verification-error">
            {errorMessage}
          </div>
        )}


        {/* Assessment */}

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
                  Question Type:{" "}
                  {questionType}
                </li>

                <li>
                  Difficulty:{" "}
                  {question?.difficulty ||
                    assessment?.difficulty ||
                    "Intermediate"}
                </li>

                <li>
                  Technical areas may include
                  programming, SQL, debugging,
                  problem solving and technical
                  scenarios.
                </li>

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
                  {question?.category ||
                    "Technical"}
                </span>

                <span>
                  {question?.difficulty ||
                    assessment?.difficulty ||
                    "Intermediate"}
                </span>

              </div>

              <h2>
                {getQuestionText()}
              </h2>

            </div>


            {/* MCQ */}

            {questionType === "MCQ" && (
              <div className="assessment-options">

                {options.map((option, index) => (
                  <label
                    key={`${option}-${index}`}
                    className="assessment-option"
                  >

                    <input
                      type="radio"
                      name="technical-question"
                      value={option}
                      checked={
                        selectedAnswer === option
                      }
                      onChange={(event) => {
                        setSelectedAnswer(
                          event.target.value
                        );
                        setErrorMessage("");
                      }}
                      disabled={
                        submitted ||
                        submitting
                      }
                    />

                    <span>
                      {option}
                    </span>

                  </label>
                ))}

              </div>
            )}


            {/* Coding / SQL / Debugging */}

            {questionType !== "MCQ" && (
              <div className="assessment-code-area">

                <label>
                  Your Answer
                </label>

                <textarea
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setErrorMessage("");
                  }}
                  disabled={
                    submitted ||
                    submitting
                  }
                  placeholder={
                    questionType === "CODING"
                      ? "Write your code here..."
                      : questionType === "SQL"
                      ? "Write your SQL query here..."
                      : "Enter your answer here..."
                  }
                  rows={12}
                />

                {question?.language && (
                  <small>
                    Language:{" "}
                    {question.language}
                  </small>
                )}

              </div>
            )}


            {/* Submission Status */}

            {submitted && (
              <div className="verification-success">

                <strong>
                  Answer submitted successfully.
                </strong>

                <p>
                  Your technical answer has been
                  submitted for backend evaluation.
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


            {/* Continue */}

            {submitted && (
              <button
                type="button"
                onClick={handleContinue}
                disabled={submitting}
              >
                {submitting
                  ? "Completing..."
                  : "Continue to Behavioral Assessment"}
              </button>
            )}


            {/* Evaluation Note */}

            <div className="verification-notice">

              <strong>
                Technical Evaluation
              </strong>

              <p>
                Technical responses may be evaluated
                for correctness, practical knowledge,
                problem-solving ability and, where
                applicable, code quality, complexity,
                edge cases and test cases.
              </p>

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default TechnicalAssessment;