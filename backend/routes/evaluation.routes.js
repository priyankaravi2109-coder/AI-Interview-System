const express = require("express");

const {
    evaluateAnswer,
    getAnswerEvaluation,
    createInterviewScore,
    getInterviewScore,
    updateInterviewScore
} = require("../controllers/evaluation.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Evaluate an answer
router.post(
    "/answers/:answerId",
    authenticateToken,
    evaluateAnswer
);

// Get evaluation for an answer
router.get(
    "/answers/:answerId",
    authenticateToken,
    getAnswerEvaluation
);

// Create interview score
router.post(
    "/interviews/:interviewId",
    authenticateToken,
    createInterviewScore
);

// Get interview score
router.get(
    "/interviews/:interviewId",
    authenticateToken,
    getInterviewScore
);

// Update interview score
router.put(
    "/interviews/:interviewId",
    authenticateToken,
    updateInterviewScore
);

module.exports = router;