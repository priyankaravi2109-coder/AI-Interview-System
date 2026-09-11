const express = require("express");

const {
    getInterviewReport
} = require("../controllers/report.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Get complete interview report
router.get(
    "/interviews/:interviewId",
    authenticateToken,
    getInterviewReport
);

module.exports = router;