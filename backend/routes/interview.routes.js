const express = require("express");

const {
    createInterview,
    getInterviewById,
    updateInterviewStatus,
    createConfiguration,
    getConfiguration,
    updateConfiguration,
    deleteInterview
} = require("../controllers/interview.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticateToken, createInterview);

router.get("/:interviewId", authenticateToken, getInterviewById);

router.put("/:interviewId/status", authenticateToken, updateInterviewStatus);

router.post(
    "/:interviewId/configuration",
    authenticateToken,
    createConfiguration
);

router.get(
    "/:interviewId/configuration",
    authenticateToken,
    getConfiguration
);

router.put(
    "/:interviewId/configuration",
    authenticateToken,
    updateConfiguration
);

router.delete("/:interviewId", authenticateToken, deleteInterview);

module.exports = router;