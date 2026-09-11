import api from "./api";

const evaluationService = {
  // Evaluate a candidate's answer
  evaluateAnswer: async (interviewId, answerData) => {
    const response = await api.post(
      `/evaluations/answer`,
      {
        interviewId,
        ...answerData,
      }
    );

    return response.data;
  },

  // Get evaluation for a particular answer
  getAnswerEvaluation: async (answerId) => {
    const response = await api.get(
      `/evaluations/answer/${answerId}`
    );

    return response.data;
  },

  // Get all evaluations for an interview
  getInterviewEvaluations: async (interviewId) => {
    const response = await api.get(
      `/evaluations/interview/${interviewId}`
    );

    return response.data;
  },

  // Get skill-wise evaluation
  getSkillEvaluation: async (interviewId) => {
    const response = await api.get(
      `/evaluations/interview/${interviewId}/skills`
    );

    return response.data;
  },

  // Get final interview score
  getFinalScore: async (interviewId) => {
    const response = await api.get(
      `/evaluations/interview/${interviewId}/score`
    );

    return response.data;
  },
};

export default evaluationService;