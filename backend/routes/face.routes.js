const express = require("express");

const {
    createFaceVerification,
    getFaceVerification,
    createVerificationEvent,
    getVerificationEvents
} = require("../controllers/face.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Record face verification
router.post(
    "/interviews/:interviewId/verify",
    authenticateToken,
    createFaceVerification
);

// Get latest face verification
router.get(
    "/interviews/:interviewId/verify",
    authenticateToken,
    getFaceVerification
);

// Record verification event
router.post(
    "/interviews/:interviewId/events",
    authenticateToken,
    createVerificationEvent
);

// Get verification events
router.get(
    "/interviews/:interviewId/events",
    authenticateToken,
    getVerificationEvents
);

module.exports = router;