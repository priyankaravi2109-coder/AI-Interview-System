import api from "./api";

const candidateService = {
  getProfile: async () => {
    const response = await api.get("/candidates/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put(
      "/candidates/profile",
      profileData
    );

    return response.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();

    formData.append("resume", file);

    const response = await api.post(
      "/candidates/profile/resume",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};

export default candidateService;