import api from "./api";

const reportService = {
  // Get the final interview report
  getInterviewReport: async (interviewId) => {
    const response = await api.get(
      `/reports/interview/${interviewId}`
    );

    return response.data;
  },

  // Generate the final AI report
  generateReport: async (interviewId) => {
    const response = await api.post(
      `/reports/interview/${interviewId}/generate`
    );

    return response.data;
  },

  // Get candidate's report summary
  getReportSummary: async (interviewId) => {
    const response = await api.get(
      `/reports/interview/${interviewId}/summary`
    );

    return response.data;
  },

  // Get skill-wise report data
  getSkillScores: async (interviewId) => {
    const response = await api.get(
      `/reports/interview/${interviewId}/skills`
    );

    return response.data;
  },

  // Get recommendation
  getRecommendation: async (interviewId) => {
    const response = await api.get(
      `/reports/interview/${interviewId}/recommendation`
    );

    return response.data;
  },
};

export default reportService;