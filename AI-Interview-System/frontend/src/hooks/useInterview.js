
import { useCallback, useEffect, useRef, useState } from "react";

function useInterview() {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [isFollowUp, setIsFollowUp] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /*
   * Start a new interview
   */
  const startInterview = useCallback((interviewData = null) => {
    if (!mountedRef.current) return;

    setInterview(interviewData);
    setCurrentQuestion(null);
    setQuestionNumber(1);
    setQuestions([]);
    setAnswers([]);

    setIsFollowUp(false);
    setInterviewStarted(true);
    setInterviewCompleted(false);

    setLoading(false);
    setError("");
  }, []);

  /*
   * Set the active interview
   */
  const setInterviewData = useCallback((interviewData) => {
    if (!mountedRef.current) return;

    setInterview(interviewData || null);
  }, []);

  /*
   * Add a question to the interview history
   */
  const addQuestion = useCallback((question) => {
    if (!question || !mountedRef.current) return;

    setQuestions((previousQuestions) => [
      ...previousQuestions,
      question,
    ]);

    setCurrentQuestion(question);
  }, []);

  /*
   * Replace the current question
   */
  const setActiveQuestion = useCallback((question) => {
    if (!mountedRef.current) return;

    setCurrentQuestion(question || null);
  }, []);

  /*
   * Add candidate answer
   */
  const addAnswer = useCallback((answer) => {
    if (!answer || !mountedRef.current) return;

    setAnswers((previousAnswers) => [
      ...previousAnswers,
      answer,
    ]);
  }, []);

  /*
   * Update the latest answer.
   * Useful when AI evaluation is received after
   * the answer has already been stored.
   */
  const updateLastAnswer = useCallback((updatedAnswer) => {
    if (!updatedAnswer || !mountedRef.current) return;

    setAnswers((previousAnswers) => {
      if (previousAnswers.length === 0) {
        return previousAnswers;
      }

      const updatedAnswers = [...previousAnswers];

      updatedAnswers[updatedAnswers.length - 1] = {
        ...updatedAnswers[updatedAnswers.length - 1],
        ...updatedAnswer,
      };

      return updatedAnswers;
    });
  }, []);

  /*
   * Get the latest candidate answer
   */
  const getLastAnswer = useCallback(() => {
    if (answers.length === 0) {
      return null;
    }

    return answers[answers.length - 1];
  }, [answers]);

  /*
   * Get the latest question
   */
  const getLastQuestion = useCallback(() => {
    if (questions.length === 0) {
      return null;
    }

    return questions[questions.length - 1];
  }, [questions]);

  /*
   * Move to the next main question
   */
  const moveToNextQuestion = useCallback(() => {
    if (!mountedRef.current) return;

    setQuestionNumber((previousNumber) => previousNumber + 1);
    setIsFollowUp(false);
    setCurrentQuestion(null);
    setError("");
  }, []);

  /*
   * Set whether the current question is a follow-up
   */
  const setFollowUpQuestion = useCallback((value) => {
    if (!mountedRef.current) return;

    setIsFollowUp(Boolean(value));
  }, []);

  /*
   * Mark interview as completed
   */
  const completeInterview = useCallback(() => {
    if (!mountedRef.current) return;

    setInterviewCompleted(true);
    setInterviewStarted(false);
    setIsFollowUp(false);
    setLoading(false);
  }, []);

  /*
   * Set loading state
   */
  const setInterviewLoading = useCallback((value) => {
    if (!mountedRef.current) return;

    setLoading(Boolean(value));
  }, []);

  /*
   * Set error message
   */
  const setInterviewError = useCallback((message) => {
    if (!mountedRef.current) return;

    setError(message || "");
  }, []);

  /*
   * Clear error message
   */
  const clearError = useCallback(() => {
    if (!mountedRef.current) return;

    setError("");
  }, []);

  /*
   * Reset the complete interview state
   */
  const resetInterview = useCallback(() => {
    if (!mountedRef.current) return;

    setInterview(null);
    setCurrentQuestion(null);
    setQuestionNumber(1);
    setQuestions([]);
    setAnswers([]);

    setIsFollowUp(false);
    setInterviewStarted(false);
    setInterviewCompleted(false);

    setLoading(false);
    setError("");
  }, []);

  /*
   * Get interview ID from the active interview
   */
  const getInterviewId = useCallback(() => {
    if (!interview) {
      return null;
    }

    return (
      interview.id ||
      interview._id ||
      interview.interviewId ||
      null
    );
  }, [interview]);

  /*
   * Store active interview ID locally.
   * This allows assessment/report pages to continue
   * using the same interview.
   */
  useEffect(() => {
    const interviewId = getInterviewId();

    if (!interviewId) {
      return;
    }

    localStorage.setItem(
      "ai_interview_active",
      String(interviewId)
    );

    localStorage.setItem(
      "interviewId",
      String(interviewId)
    );
  }, [getInterviewId]);

  return {
    // Interview data
    interview,
    currentQuestion,
    questionNumber,
    questions,
    answers,

    // Interview state
    isFollowUp,
    interviewStarted,
    interviewCompleted,

    // UI state
    loading,
    error,

    // Interview actions
    startInterview,
    setInterviewData,

    // Question actions
    addQuestion,
    setActiveQuestion,
    getLastQuestion,
    moveToNextQuestion,

    // Answer actions
    addAnswer,
    updateLastAnswer,
    getLastAnswer,

    // Follow-up actions
    setFollowUpQuestion,

    // Status actions
    completeInterview,
    setInterviewLoading,
    setInterviewError,
    clearError,

    // Utility
    getInterviewId,
    resetInterview,
  };
}

export default useInterview;

