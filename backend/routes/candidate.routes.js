const express = require("express");

const {
    getCandidateProfile,
    updateCandidateProfile
} = require("../controllers/candidate.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Get logged-in candidate profile
router.get("/profile", authenticateToken, getCandidateProfile);

// Update logged-in candidate profile
router.put("/profile", authenticateToken, updateCandidateProfile);

module.exports = router;