const express = require("express");

const {
    getInterviewQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    submitAnswer,
    getInterviewAnswers
} = require("../controllers/questions.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Get all questions for an interview
router.get(
    "/interview/:interviewId",
    authenticateToken,
    getInterviewQuestions
);

// Get answers for an interview
router.get(
    "/interview/:interviewId/answers",
    authenticateToken,
    getInterviewAnswers
);

// Create question
router.post(
    "/interview/:interviewId",
    authenticateToken,
    createQuestion
);

// Submit answer
router.post(
    "/interview/:interviewId/question/:questionId/answer",
    authenticateToken,
    submitAnswer
);

// Get one question
router.get(
    "/:questionId",
    authenticateToken,
    getQuestionById
);

// Update question
router.put(
    "/:questionId",
    authenticateToken,
    updateQuestion
);

// Delete question
router.delete(
    "/:questionId",
    authenticateToken,
    deleteQuestion
);

module.exports = router;