const express = require("express");

const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    addJobRequirement,
    deleteJobRequirement
} = require("../controllers/job.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Get all jobs
router.get("/", authenticateToken, getAllJobs);

// Get one job with requirements
router.get("/:jobId", authenticateToken, getJobById);

// Create job
router.post("/", authenticateToken, createJob);

// Update job
router.put("/:jobId", authenticateToken, updateJob);

// Delete job
router.delete("/:jobId", authenticateToken, deleteJob);

// Add requirement
router.post("/:jobId/requirements", authenticateToken, addJobRequirement);

// Delete requirement
router.delete("/requirements/:requirementId", authenticateToken, deleteJobRequirement);

module.exports = router;