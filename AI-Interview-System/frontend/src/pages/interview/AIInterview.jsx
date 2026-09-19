import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useInterview } from "../../context/InterviewContext";

import interviewService from "../../services/interviewService";
import questionService from "../../services/questionService";
import evaluationService from "../../services/evaluationService";

import QuestionDisplay from "../../components/interview/QuestionDisplay";
import AnswerInput from "../../components/interview/AnswerInput";
import InterviewTimer from "../../components/interview/InterviewTimer";
import InterviewProgress from "../../components/interview/InterviewProgress";
import InterviewSection from "../../components/interview/InterviewSection";
import FollowUpIndicator from "../../components/interview/FollowUpIndicator";

function AIInterview() {
  const navigate = useNavigate();

  const {
    currentQuestion,
    interviewStarted,
    isFollowUp,
    startInterview,
    addQuestion,
    addAnswer,
    updateLastAnswer,
    getLastAnswer,
    moveToNextQuestion,
    setFollowUpQuestion,
    completeInterview,
  } = useInterview();

  const [interviewId, setInterviewId] = useState(null);
  const [question, setQuestion] = useState(null);

  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [evaluationMessage, setEvaluationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [totalQuestions, setTotalQuestions] = useState(20);
  const [interviewDuration, setInterviewDuration] = useState(30);

  /*
   * Load the candidate's active interview.
   */
  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoadingQuestion(true);
        setErrorMessage("");

        const data = await interviewService.getMyInterviews();

        const interviews = Array.isArray(data)
          ? data
          : data?.interviews || data?.data || [];

        if (!interviews.length) {
          setErrorMessage("No scheduled interview was found.");
          setLoadingQuestion(false);
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
          activeInterview._id ||
          activeInterview.id ||
          activeInterview.interviewId;

        if (!id) {
          setErrorMessage("Interview information is incomplete.");
          setLoadingQuestion(false);
          return;
        }

        setInterviewId(id);

        const configuredQuestionCount =
          activeInterview.questionCount ||
          activeInterview.configuration?.questionCount ||
          activeInterview.config?.questionCount ||
          20;

        const configuredDuration =
          activeInterview.duration ||
          activeInterview.durationMinutes ||
          activeInterview.configuration?.duration ||
          activeInterview.config?.duration ||
          30;

        setTotalQuestions(configuredQuestionCount);
        setInterviewDuration(configuredDuration);

        if (!interviewStarted) {
          startInterview({
            interviewId: id,
            totalQuestions: configuredQuestionCount,
            duration: configuredDuration,
            configuration:
              activeInterview.configuration ||
              activeInterview.config ||
              {},
          });
        }

        await interviewService.startInterview(id);

        const questionData =
          await questionService.getNextQuestion(id);

        const generatedQuestion =
          questionData?.question ||
          questionData?.data?.question ||
          questionData?.data ||
          questionData;

        if (!generatedQuestion) {
          throw new Error(
            "No question was returned by the backend."
          );
        }

        setQuestion(generatedQuestion);
        addQuestion(generatedQuestion);
      } catch (error) {
        console.error("Unable to load interview:", error);

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the interview."
        );
      } finally {
        setLoadingQuestion(false);
      }
    };

    loadInterview();

    // Run only when the interview page is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Determine the current assessment section.
   */
  const getCurrentSection = () => {
    if (currentQuestion <= 12) {
      return "Technical Assessment";
    }

    if (currentQuestion <= 16) {
      return "Behavioral Assessment";
    }

    if (currentQuestion <= 18) {
      return "Scenario Assessment";
    }

    return "Communication Assessment";
  };

  /*
   * Submit candidate answer.
   *
   * Flow:
   * 1. Save answer through interview service.
   * 2. Evaluate answer through AI evaluation service.
   * 3. Store answerId returned by backend.
   * 4. Decide whether follow-up is required.
   */
  const handleAnswerSubmit = async (answer) => {
    if (
      !answer ||
      !answer.trim() ||
      submitting ||
      !interviewId ||
      !question
    ) {
      return;
    }

    setSubmitting(true);
    setEvaluationMessage("");
    setErrorMessage("");

    try {
      const cleanedAnswer = answer.trim();

      setSubmittedAnswer(cleanedAnswer);

      const questionId =
        question._id ||
        question.id ||
        question.questionId;

      /*
       * Save candidate answer in backend.
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
            category: question.category,
            difficulty: question.difficulty,
          }
        );

      /*
       * Extract answer ID returned by backend.
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
       * Store answer in InterviewContext.
       */
      addAnswer({
        answerId,
        interviewId,
        questionId,
        questionNumber: currentQuestion,
        question:
          question.text ||
          question.question ||
          question.prompt ||
          "",
        answer: cleanedAnswer,
        category: question.category,
        difficulty: question.difficulty,
      });

      /*
       * Ask backend AI service to evaluate the answer.
       */
      const evaluation =
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
            category: question.category,
            difficulty: question.difficulty,
          }
        );

      /*
       * Save evaluation information with the
       * latest answer.
       */
      updateLastAnswer({
        answerId,
        evaluation,
      });

      /*
       * Follow-up is generated only for a
       * normal/main question.
       *
       * We allow one follow-up for each
       * main question.
       */
      const followUpRequired =
        !isFollowUp &&
        (
          evaluation?.followUpRequired === true ||
          evaluation?.data?.followUpRequired === true ||
          evaluation?.evaluation?.followUpRequired === true
        );

      setFollowUpQuestion(followUpRequired);

      setEvaluationMessage(
        followUpRequired
          ? "Answer evaluated. A follow-up question is required."
          : "Answer evaluated successfully."
      );
    } catch (error) {
      console.error(
        "Answer submission failed:",
        error
      );

      setSubmittedAnswer("");

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to evaluate your answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Move to follow-up or next main question.
   */
  const handleNextQuestion = async () => {
    if (!interviewId) {
      return;
    }

    setSubmittedAnswer("");
    setEvaluationMessage("");
    setErrorMessage("");
    setLoadingQuestion(true);

    try {
      /*
       * If current answer requires a follow-up,
       * generate the follow-up question.
       */
      if (isFollowUp) {
        const lastAnswer = getLastAnswer();

        const answerId =
          lastAnswer?.answerId ||
          lastAnswer?._id ||
          lastAnswer?.id;

        if (!answerId) {
          throw new Error(
            "Answer information is missing. Unable to generate follow-up."
          );
        }

        const followUpData =
          await questionService.generateFollowUp(
            interviewId,
            answerId
          );

        const followUpQuestion =
          followUpData?.question ||
          followUpData?.data?.question ||
          followUpData?.data ||
          followUpData;

        if (!followUpQuestion) {
          throw new Error(
            "The backend did not return a follow-up question."
          );
        }

        setQuestion(followUpQuestion);
        addQuestion(followUpQuestion);

        /*
         * Keep the same main question number.
         * Follow-up is supplementary and should
         * not consume another configured question.
         */
        setFollowUpQuestion(true);

        return;
      }

      /*
       * If all main questions are completed,
       * complete the AI interview.
       */
      if (currentQuestion >= totalQuestions) {
        await interviewService.completeInterview(
          interviewId
        );

        completeInterview();

        navigate(
          "/interview/technical-assessment"
        );

        return;
      }

      /*
       * Request next main question.
       */
      const nextQuestionData =
        await questionService.getNextQuestion(
          interviewId
        );

      const nextQuestion =
        nextQuestionData?.question ||
        nextQuestionData?.data?.question ||
        nextQuestionData?.data ||
        nextQuestionData;

      if (!nextQuestion) {
        throw new Error(
          "The backend did not return the next question."
        );
      }

      setQuestion(nextQuestion);

      addQuestion(nextQuestion);

      setFollowUpQuestion(false);

      moveToNextQuestion();
    } catch (error) {
      console.error(
        "Unable to load next question:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load the next question."
      );
    } finally {
      setLoadingQuestion(false);
    }
  };

  /*
   * Handle interview timeout.
   */
  const handleTimeUp = async () => {
    try {
      if (interviewId) {
        await interviewService.completeInterview(
          interviewId
        );
      }
    } catch (error) {
      console.error(
        "Unable to complete timed-out interview:",
        error
      );
    }

    completeInterview();

    navigate("/interview/complete");
  };

  const currentSection = getCurrentSection();

  return (
    <div className="interview-page">

      {/* =========================
          INTERVIEW HEADER
      ========================= */}

      <header className="interview-header">

        <div>
          <h1>AI Interview</h1>

          <p>
            AI-Powered Interview &amp; Assessment
          </p>
        </div>

        <InterviewTimer
          duration={interviewDuration}
          onTimeUp={handleTimeUp}
        />

      </header>


      <main className="interview-content">

        {/* =========================
            INTERVIEW SIDEBAR
        ========================= */}

        <aside className="interview-sidebar">

          <h3>Interview Sections</h3>

          <InterviewSection
            title="Technical Assessment"
            description="Technical knowledge and practical skills"
            active={
              currentSection ===
              "Technical Assessment"
            }
          />

          <InterviewSection
            title="Behavioral Assessment"
            description="Behavior and workplace situations"
            active={
              currentSection ===
              "Behavioral Assessment"
            }
          />

          <InterviewSection
            title="Scenario Assessment"
            description="Problem-solving and real-world scenarios"
            active={
              currentSection ===
              "Scenario Assessment"
            }
          />

          <InterviewSection
            title="Communication Assessment"
            description="Communication and explanation skills"
            active={
              currentSection ===
              "Communication Assessment"
            }
          />

        </aside>


        {/* =========================
            INTERVIEW MAIN
        ========================= */}

        <section className="interview-main">

          <InterviewProgress
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
          />

          <FollowUpIndicator
            isFollowUp={isFollowUp}
          />


          {/* Loading */}

          {loadingQuestion && (
            <div className="verification-success">
              Generating your AI interview question...
            </div>
          )}


          {/* Error */}

          {errorMessage && (
            <div className="verification-error">
              {errorMessage}
            </div>
          )}


          {/* Question */}

          {!loadingQuestion && question && (
            <QuestionDisplay
              question={question}
              questionNumber={currentQuestion}
              totalQuestions={totalQuestions}
            />
          )}


          {/* Answer */}

          {!loadingQuestion && question && (
            <AnswerInput
              onSubmit={handleAnswerSubmit}
              disabled={
                submitting ||
                !!submittedAnswer
              }
            />
          )}


          {/* Evaluation */}

          {evaluationMessage && (
            <div className="verification-success">
              {evaluationMessage}
            </div>
          )}


          {/* Next */}

          {submittedAnswer &&
            !submitting &&
            !loadingQuestion && (
              <button
                type="button"
                className="interview-next-button"
                onClick={handleNextQuestion}
              >
                {isFollowUp
                  ? "Get Follow-up Question"
                  : currentQuestion >= totalQuestions
                  ? "Continue to Technical Assessment"
                  : "Next Question"}
              </button>
            )}

        </section>

      </main>

    </div>
  );
}

export default AIInterview;