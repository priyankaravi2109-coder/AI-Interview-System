import api from "./api";

const interviewService = {
  // Get the candidate's assigned/scheduled interviews
  getMyInterviews: async () => {
    const response = await api.get("/interviews/my");
    return response.data;
  },

  // Get one interview by ID
  getInterviewById: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  // Start an interview
  startInterview: async (interviewId) => {
    const response = await api.post(
      `/interviews/${interviewId}/start`
    );

    return response.data;
  },

  // Get the next AI-generated question
  getNextQuestion: async (interviewId) => {
    const response = await api.get(
      `/interviews/${interviewId}/next-question`
    );

    return response.data;
  },

  // Submit a candidate answer
  submitAnswer: async (interviewId, answerData) => {
    const response = await api.post(
      `/interviews/${interviewId}/answers`,
      answerData
    );

    return response.data;
  },

  // Request a follow-up question
  getFollowUpQuestion: async (interviewId, answerId) => {
    const response = await api.post(
      `/interviews/${interviewId}/follow-up`,
      {
        answerId,
      }
    );

    return response.data;
  },

  // Complete the interview
  completeInterview: async (interviewId) => {
    const response = await api.post(
      `/interviews/${interviewId}/complete`
    );

    return response.data;
  },

  // Get interview result
  getInterviewResult: async (interviewId) => {
    const response = await api.get(
      `/interviews/${interviewId}/result`
    );

    return response.data;
  },
};

export default interviewService;