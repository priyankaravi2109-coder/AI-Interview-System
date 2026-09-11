const pool = require("../config/database");

// Get logged-in candidate's skills
const getCandidateSkills = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const result = await pool.query(
            `SELECT
                cs.candidate_id,
                s.skill_id,
                s.skill_name,
                cs.proficiency
             FROM candidate_skills cs
             JOIN skills s
                ON cs.skill_id = s.skill_id
             JOIN candidates c
                ON cs.candidate_id = c.candidate_id
             WHERE c.user_id = $1
             ORDER BY s.skill_name`,
            [userId]
        );

        res.status(200).json({
            skills: result.rows
        });

    } catch (error) {
        console.error("Get candidate skills error:", error);

        res.status(500).json({
            message: "Failed to fetch skills"
        });
    }
};


// Add a skill to logged-in candidate
const addCandidateSkill = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const {
            skill_id,
            proficiency
        } = req.body;

        if (!skill_id || !proficiency) {
            return res.status(400).json({
                message: "skill_id and proficiency are required"
            });
        }

        const candidateResult = await pool.query(
            `SELECT candidate_id
             FROM candidates
             WHERE user_id = $1`,
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        const candidateId = candidateResult.rows[0].candidate_id;

        const result = await pool.query(
            `INSERT INTO candidate_skills
                (candidate_id, skill_id, proficiency)
             VALUES ($1, $2, $3)
             RETURNING candidate_id, skill_id, proficiency`,
            [candidateId, skill_id, proficiency]
        );

        res.status(201).json({
            message: "Skill added successfully",
            skill: result.rows[0]
        });

    } catch (error) {
        console.error("Add candidate skill error:", error);

        res.status(500).json({
            message: "Failed to add skill"
        });
    }
};


// Update skill proficiency
const updateCandidateSkill = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const skillId = req.params.skillId;

        const { proficiency } = req.body;

        if (!proficiency) {
            return res.status(400).json({
                message: "proficiency is required"
            });
        }

        const result = await pool.query(
            `UPDATE candidate_skills cs
             SET proficiency = $1
             FROM candidates c
             WHERE cs.candidate_id = c.candidate_id
               AND c.user_id = $2
               AND cs.skill_id = $3
             RETURNING cs.candidate_id, cs.skill_id, cs.proficiency`,
            [proficiency, userId, skillId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Skill not found for this candidate"
            });
        }

        res.status(200).json({
            message: "Skill proficiency updated successfully",
            skill: result.rows[0]
        });

    } catch (error) {
        console.error("Update candidate skill error:", error);

        res.status(500).json({
            message: "Failed to update skill"
        });
    }
};


// Remove skill from logged-in candidate
const deleteCandidateSkill = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const skillId = req.params.skillId;

        const result = await pool.query(
            `DELETE FROM candidate_skills cs
             USING candidates c
             WHERE cs.candidate_id = c.candidate_id
               AND c.user_id = $1
               AND cs.skill_id = $2
             RETURNING cs.candidate_id, cs.skill_id, cs.proficiency`,
            [userId, skillId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Skill not found for this candidate"
            });
        }

        res.status(200).json({
            message: "Skill removed successfully",
            skill: result.rows[0]
        });

    } catch (error) {
        console.error("Delete candidate skill error:", error);

        res.status(500).json({
            message: "Failed to remove skill"
        });
    }
};


module.exports = {
    getCandidateSkills,
    addCandidateSkill,
    updateCandidateSkill,
    deleteCandidateSkill
};