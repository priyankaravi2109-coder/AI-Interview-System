import api from "./api";

const dashboardService = {
  // Get Admin dashboard statistics
  getAdminDashboard: async () => {
    const response = await api.get("/dashboard/admin");
    return response.data;
  },

  // Get candidate dashboard information
  getCandidateDashboard: async () => {
    const response = await api.get("/dashboard/candidate");
    return response.data;
  },

  // Get candidate status statistics
  getCandidateStatusStats: async () => {
    const response = await api.get("/dashboard/candidate-status");
    return response.data;
  },

  // Get interview statistics
  getInterviewStats: async () => {
    const response = await api.get("/dashboard/interview-stats");
    return response.data;
  },

  // Get skill performance data
  getSkillPerformance: async () => {
    const response = await api.get("/dashboard/skill-performance");
    return response.data;
  },

  // Get verification statistics
  getVerificationStats: async () => {
    const response = await api.get("/dashboard/verification-stats");
    return response.data;
  },
};

export default dashboardService;