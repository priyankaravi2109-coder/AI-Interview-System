
import api from "./api";

const jobService = {
  // Get all jobs
  getJobs: async () => {
    const response = await api.get("/jobs");
    return response.data;
  },

  // Get a single job
  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Create a new job
  createJob: async (jobData) => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },

  // Update an existing job
  updateJob: async (jobId, jobData) => {
    const response = await api.put(
      `/jobs/${jobId}`,
      jobData
    );

    return response.data;
  },

  // Delete a job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Get candidates/applications for a job
  getJobCandidates: async (jobId) => {
    const response = await api.get(
      `/jobs/${jobId}/candidates`
    );

    return response.data;
  },

  // Get job requirements
  getJobRequirements: async (jobId) => {
    const response = await api.get(
      `/jobs/${jobId}/requirements`
    );

    return response.data;
  },

  // Update job requirements
  updateJobRequirements: async (jobId, requirements) => {
    const response = await api.put(
      `/jobs/${jobId}/requirements`,
      requirements
    );

    return response.data;
  },
};

export default jobService;

