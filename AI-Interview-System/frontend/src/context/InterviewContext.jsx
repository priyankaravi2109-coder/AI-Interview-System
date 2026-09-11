import { createContext, useContext, useState } from "react";

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const startInterview = (interviewData = null) => {
    setInterview(interviewData);
    setCurrentQuestion(1);
    setQuestions([]);
    setAnswers([]);
    setIsFollowUp(false);
    setInterviewStarted(true);
    setInterviewCompleted(false);
  };

  const addQuestion = (question) => {
    if (!question) {
      return;
    }

    setQuestions((previous) => [
      ...previous,
      question,
    ]);
  };

  const addAnswer = (answer) => {
    if (!answer) {
      return;
    }

    setAnswers((previous) => [
      ...previous,
      answer,
    ]);
  };

  const updateLastAnswer = (updatedAnswer) => {
    if (!updatedAnswer) {
      return;
    }

    setAnswers((previous) => {
      if (previous.length === 0) {
        return previous;
      }

      const updatedAnswers = [...previous];

      updatedAnswers[updatedAnswers.length - 1] = {
        ...updatedAnswers[updatedAnswers.length - 1],
        ...updatedAnswer,
      };

      return updatedAnswers;
    });
  };

  const getLastAnswer = () => {
    if (answers.length === 0) {
      return null;
    }

    return answers[answers.length - 1];
  };

  const moveToNextQuestion = () => {
    setCurrentQuestion((previous) => previous + 1);
    setIsFollowUp(false);
  };

  const setFollowUpQuestion = (value) => {
    setIsFollowUp(value);
  };

  const completeInterview = () => {
    setInterviewCompleted(true);
  };

  const resetInterview = () => {
    setInterview(null);
    setCurrentQuestion(1);
    setQuestions([]);
    setAnswers([]);
    setIsFollowUp(false);
    setInterviewStarted(false);
    setInterviewCompleted(false);
  };

  const value = {
    interview,
    currentQuestion,
    questions,
    answers,
    isFollowUp,
    interviewStarted,
    interviewCompleted,

    startInterview,
    addQuestion,
    addAnswer,
    updateLastAnswer,
    getLastAnswer,
    moveToNextQuestion,
    setFollowUpQuestion,
    completeInterview,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error(
      "useInterview must be used inside InterviewProvider."
    );
  }

  return context;
}