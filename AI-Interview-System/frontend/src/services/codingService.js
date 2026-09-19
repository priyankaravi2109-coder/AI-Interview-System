import api from "./api";

const codingService = {
  // Get the technical/coding assessment
  getAssessment: async (interviewId) => {
    const response = await api.get(
      `/coding-assessments/${interviewId}`
    );

    return response.data;
  },

  // Get a specific coding/technical question
  getQuestion: async (assessmentId, questionId) => {
    const response = await api.get(
      `/coding-assessments/${assessmentId}/questions/${questionId}`
    );

    return response.data;
  },

  // Submit MCQ / SQL / debugging / output-prediction answer
  submitAnswer: async (assessmentId, questionId, answerData) => {
    const response = await api.post(
      `/coding-assessments/${assessmentId}/questions/${questionId}/answer`,
      answerData
    );

    return response.data;
  },

  // Submit code for secure backend evaluation
  submitCode: async (assessmentId, questionId, codeData) => {
    const response = await api.post(
      `/coding-assessments/${assessmentId}/questions/${questionId}/code`,
      codeData
    );

    return response.data;
  },

  // Get test cases for a coding question
  getTestCases: async (assessmentId, questionId) => {
    const response = await api.get(
      `/coding-assessments/${assessmentId}/questions/${questionId}/test-cases`
    );

    return response.data;
  },

  // Complete the technical assessment
  completeAssessment: async (assessmentId) => {
    const response = await api.post(
      `/coding-assessments/${assessmentId}/complete`
    );

    return response.data;
  },

  // Get technical assessment result
  getResult: async (assessmentId) => {
    const response = await api.get(
      `/coding-assessments/${assessmentId}/result`
    );

    return response.data;
  },
};

export default codingService;