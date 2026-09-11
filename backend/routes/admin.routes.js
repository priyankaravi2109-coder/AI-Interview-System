const express = require("express");

const adminController = require("../controllers/admin.controller");
const authenticateToken = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const router = express.Router();

// Authentication
router.use(authenticateToken);

// Admin authorization
router.use(requireAdmin);

// Get all candidates
router.get("/candidates", adminController.getAllCandidates);

// Get all jobs
router.get("/jobs", adminController.getAllJobs);

// Get all interviews
router.get("/interviews", adminController.getAllInterviews);

// Get detailed interview
router.get(
    "/interviews/:interviewId",
    adminController.getAdminInterviewDetails
);

// Get all reports
router.get("/reports", adminController.getAllReports);

module.exports = router;