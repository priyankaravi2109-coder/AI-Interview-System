const express = require("express");

const {
    getResume,
    updateResume
} = require("../controllers/resume.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Get logged-in candidate resume
router.get("/", authenticateToken, getResume);

// Update logged-in candidate resume
router.put("/", authenticateToken, updateResume);

module.exports = router;