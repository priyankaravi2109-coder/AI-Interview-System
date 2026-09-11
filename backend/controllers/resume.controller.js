const pool = require("../config/database");

// Get logged-in candidate resume
const getResume = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const result = await pool.query(
            `SELECT candidate_id, user_id, resume_url
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
            resume: result.rows[0]
        });

    } catch (error) {
        console.error("Get resume error:", error);

        res.status(500).json({
            message: "Failed to fetch resume"
        });
    }
};


// Update logged-in candidate resume
const updateResume = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const { resume_url } = req.body;

        if (!resume_url) {
            return res.status(400).json({
                message: "resume_url is required"
            });
        }

        const result = await pool.query(
            `UPDATE candidates
             SET resume_url = $1
             WHERE user_id = $2
             RETURNING candidate_id, user_id, resume_url`,
            [resume_url, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        res.status(200).json({
            message: "Resume updated successfully",
            resume: result.rows[0]
        });

    } catch (error) {
        console.error("Update resume error:", error);

        res.status(500).json({
            message: "Failed to update resume"
        });
    }
};


module.exports = {
    getResume,
    updateResume
};