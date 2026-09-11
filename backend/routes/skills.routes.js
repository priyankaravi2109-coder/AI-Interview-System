const express = require("express");

const {
    getCandidateSkills,
    addCandidateSkill,
    updateCandidateSkill,
    deleteCandidateSkill
} = require("../controllers/skills.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Get candidate skills
router.get("/", authenticateToken, getCandidateSkills);

// Add candidate skill
router.post("/", authenticateToken, addCandidateSkill);

// Update skill proficiency
router.put("/:skillId", authenticateToken, updateCandidateSkill);

// Delete candidate skill
router.delete("/:skillId", authenticateToken, deleteCandidateSkill);

module.exports = router;