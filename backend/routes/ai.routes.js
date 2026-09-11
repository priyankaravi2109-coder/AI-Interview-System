const express = require("express");

const {
    generateQuestions
} = require("../controllers/ai.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Generate AI interview questions
router.post(
    "/interviews/:interviewId/generate",
    authenticateToken,
    generateQuestions
);

module.exports = router;