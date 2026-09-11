import api from "./api";

const questionService = {
  // Generate the first/current question for an interview
  generateQuestion: async (interviewId) => {
    const response = await api.post(
      `/questions/generate`,
      {
        interviewId,
      }
    );

    return response.data;
  },

  // Get the next question
  getNextQuestion: async (interviewId) => {
    const response = await api.get(
      `/questions/next/${interviewId}`
    );

    return response.data;
  },

  // Generate a follow-up question based on the candidate's answer
  generateFollowUp: async (interviewId, answerId) => {
    const response = await api.post(
      `/questions/follow-up`,
      {
        interviewId,
        answerId,
      }
    );

    return response.data;
  },

  // Get questions already generated for an interview
  getInterviewQuestions: async (interviewId) => {
    const response = await api.get(
      `/questions/interview/${interviewId}`
    );

    return response.data;
  },

  // Get a specific question
  getQuestionById: async (questionId) => {
    const response = await api.get(
      `/questions/${questionId}`
    );

    return response.data;
  },
};

export default questionService;