const pool = require("../config/database");

// Get logged-in candidate profile
const getCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const result = await pool.query(
            `SELECT 
                candidate_id,
                user_id,
                name,
                email,
                phone,
                resume_url,
                experience_years,
                created_at
             FROM candidates
             WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        res.status(200).json({
            candidate: result.rows[0]
        });

    } catch (error) {
        console.error("Get candidate profile error:", error);

        res.status(500).json({
            message: "Failed to fetch candidate profile"
        });
    }
};


// Update logged-in candidate profile
const updateCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const {
            name,
            phone,
            experience_years
        } = req.body;

        const result = await pool.query(
            `UPDATE candidates
             SET
                name = COALESCE($1, name),
                phone = COALESCE($2, phone),
                experience_years = COALESCE($3, experience_years)
             WHERE user_id = $4
             RETURNING
                candidate_id,
                user_id,
                name,
                email,
                phone,
                resume_url,
                experience_years,
                created_at`,
            [
                name,
                phone,
                experience_years,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        res.status(200).json({
            message: "Candidate profile updated successfully",
            candidate: result.rows[0]
        });

    } catch (error) {
        console.error("Update candidate profile error:", error);

        res.status(500).json({
            message: "Failed to update candidate profile"
        });
    }
};


module.exports = {
    getCandidateProfile,
    updateCandidateProfile
};