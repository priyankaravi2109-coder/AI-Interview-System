const express = require("express");

const {
    createCodingAssessment,
    getCodingAssessment,
    submitCandidateCode,
    updateCodingResult,
    deleteCodingAssessment
} = require("../controllers/coding.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Create coding assessment
router.post(
    "/interviews/:interviewId",
    authenticateToken,
    createCodingAssessment
);

// Get coding assessment
router.get(
    "/interviews/:interviewId",
    authenticateToken,
    getCodingAssessment
);

// Submit candidate code
router.put(
    "/:codingId/code",
    authenticateToken,
    submitCandidateCode
);

// Update test result and score
router.put(
    "/:codingId/result",
    authenticateToken,
    updateCodingResult
);

// Delete coding assessment
router.delete(
    "/:codingId",
    authenticateToken,
    deleteCodingAssessment
);

module.exports = router;