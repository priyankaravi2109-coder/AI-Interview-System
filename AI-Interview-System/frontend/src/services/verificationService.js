import api from "./api";

const verificationService = {
  // Start the verification process
  startVerification: async (interviewId) => {
    const response = await api.post(
      `/verification/start`,
      {
        interviewId,
      }
    );

    return response.data;
  },

  // Verify the candidate's live face
  verifyFace: async (interviewId, imageData) => {
    const response = await api.post(
      `/verification/face`,
      {
        interviewId,
        image: imageData,
      }
    );

    return response.data;
  },

  // Record a verification event
  recordEvent: async (interviewId, eventData) => {
    const response = await api.post(
      `/verification/events`,
      {
        interviewId,
        ...eventData,
      }
    );

    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (interviewId) => {
    const response = await api.get(
      `/verification/${interviewId}/status`
    );

    return response.data;
  },

  // Get verification events for an interview
  getVerificationEvents: async (interviewId) => {
    const response = await api.get(
      `/verification/${interviewId}/events`
    );

    return response.data;
  },

  // Retry face verification
  retryVerification: async (interviewId) => {
    const response = await api.post(
      `/verification/${interviewId}/retry`
    );

    return response.data;
  },
};

export default verificationService;