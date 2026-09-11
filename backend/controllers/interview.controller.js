const pool = require("../config/database");

// Create interview
const createInterview = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { job_id } = req.body;

        if (!job_id) {
            return res.status(400).json({
                message: "job_id is required"
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

        const jobResult = await pool.query(
            `SELECT job_id
             FROM jobs
             WHERE job_id = $1`,
            [job_id]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO interviews
                (candidate_id, job_id, status)
             VALUES ($1, $2, $3)
             RETURNING
                interview_id,
                candidate_id,
                job_id,
                status,
                started_at,
                completed_at,
                created_at`,
            [candidateId, job_id, "scheduled"]
        );

        res.status(201).json({
            message: "Interview created successfully",
            interview: result.rows[0]
        });

    } catch (error) {
        console.error("Create interview error:", error);

        res.status(500).json({
            message: "Failed to create interview"
        });
    }
};


// Get interview
const getInterviewById = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                i.interview_id,
                i.candidate_id,
                i.job_id,
                i.status,
                i.started_at,
                i.completed_at,
                i.created_at,
                j.title AS job_title
             FROM interviews i
             JOIN candidates c
                ON i.candidate_id = c.candidate_id
             JOIN jobs j
                ON i.job_id = j.job_id
             WHERE i.interview_id = $1
               AND c.user_id = $2`,
            [interviewId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            interview: result.rows[0]
        });

    } catch (error) {
        console.error("Get interview error:", error);

        res.status(500).json({
            message: "Failed to fetch interview"
        });
    }
};


// Update interview status
const updateInterviewStatus = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const interviewId = req.params.interviewId;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "status is required"
            });
        }

        let query;
        let values;

        if (status === "in_progress") {
            query = `
                UPDATE interviews i
                SET
                    status = $1,
                    started_at = COALESCE(i.started_at, NOW())
                FROM candidates c
                WHERE i.candidate_id = c.candidate_id
                  AND i.interview_id = $2
                  AND c.user_id = $3
                RETURNING
                    i.interview_id,
                    i.candidate_id,
                    i.job_id,
                    i.status,
                    i.started_at,
                    i.completed_at,
                    i.created_at
            `;

            values = [status, interviewId, userId];

        } else if (status === "completed") {
            query = `
                UPDATE interviews i
                SET
                    status = $1,
                    completed_at = NOW()
                FROM candidates c
                WHERE i.candidate_id = c.candidate_id
                  AND i.interview_id = $2
                  AND c.user_id = $3
                RETURNING
                    i.interview_id,
                    i.candidate_id,
                    i.job_id,
                    i.status,
                    i.started_at,
                    i.completed_at,
                    i.created_at
            `;

            values = [status, interviewId, userId];

        } else {
            query = `
                UPDATE interviews i
                SET status = $1
                FROM candidates c
                WHERE i.candidate_id = c.candidate_id
                  AND i.interview_id = $2
                  AND c.user_id = $3
                RETURNING
                    i.interview_id,
                    i.candidate_id,
                    i.job_id,
                    i.status,
                    i.started_at,
                    i.completed_at,
                    i.created_at
            `;

            values = [status, interviewId, userId];
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview status updated successfully",
            interview: result.rows[0]
        });

    } catch (error) {
        console.error("Update interview status error:", error);

        res.status(500).json({
            message: "Failed to update interview status"
        });
    }
};


// Create interview configuration
const createConfiguration = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            difficulty,
            duration_minutes,
            technical_question_count,
            behavioral_question_count,
            coding_enabled
        } = req.body;

        const interviewResult = await pool.query(
            `SELECT interview_id
             FROM interviews
             WHERE interview_id = $1`,
            [interviewId]
        );

        if (interviewResult.rows.length === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO interview_configurations
                (
                    interview_id,
                    difficulty,
                    duration_minutes,
                    technical_question_count,
                    behavioral_question_count,
                    coding_enabled
                )
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING
                configuration_id,
                interview_id,
                difficulty,
                duration_minutes,
                technical_question_count,
                behavioral_question_count,
                coding_enabled`,
            [
                interviewId,
                difficulty || "medium",
                duration_minutes || 30,
                technical_question_count || 5,
                behavioral_question_count || 3,
                coding_enabled || false
            ]
        );

        res.status(201).json({
            message: "Interview configuration created successfully",
            configuration: result.rows[0]
        });

    } catch (error) {
        console.error("Create configuration error:", error);

        res.status(500).json({
            message: "Failed to create interview configuration"
        });
    }
};


// Get interview configuration
const getConfiguration = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                configuration_id,
                interview_id,
                difficulty,
                duration_minutes,
                technical_question_count,
                behavioral_question_count,
                coding_enabled
             FROM interview_configurations
             WHERE interview_id = $1`,
            [interviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Interview configuration not found"
            });
        }

        res.status(200).json({
            configuration: result.rows[0]
        });

    } catch (error) {
        console.error("Get configuration error:", error);

        res.status(500).json({
            message: "Failed to fetch interview configuration"
        });
    }
};


// Update interview configuration
const updateConfiguration = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            difficulty,
            duration_minutes,
            technical_question_count,
            behavioral_question_count,
            coding_enabled
        } = req.body;

        const result = await pool.query(
            `UPDATE interview_configurations
             SET
                difficulty = COALESCE($1, difficulty),
                duration_minutes = COALESCE($2, duration_minutes),
                technical_question_count = COALESCE($3, technical_question_count),
                behavioral_question_count = COALESCE($4, behavioral_question_count),
                coding_enabled = COALESCE($5, coding_enabled)
             WHERE interview_id = $6
             RETURNING
                configuration_id,
                interview_id,
                difficulty,
                duration_minutes,
                technical_question_count,
                behavioral_question_count,
                coding_enabled`,
            [
                difficulty,
                duration_minutes,
                technical_question_count,
                behavioral_question_count,
                coding_enabled,
                interviewId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Interview configuration not found"
            });
        }

        res.status(200).json({
            message: "Interview configuration updated successfully",
            configuration: result.rows[0]
        });

    } catch (error) {
        console.error("Update configuration error:", error);

        res.status(500).json({
            message: "Failed to update interview configuration"
        });
    }
};


// Delete interview
const deleteInterview = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        await pool.query(
            `DELETE FROM interview_configurations
             WHERE interview_id = $1`,
            [interviewId]
        );

        const result = await pool.query(
            `DELETE FROM interviews
             WHERE interview_id = $1
             RETURNING interview_id`,
            [interviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview deleted successfully"
        });

    } catch (error) {
        console.error("Delete interview error:", error);

        res.status(500).json({
            message: "Failed to delete interview"
        });
    }
};


module.exports = {
    createInterview,
    getInterviewById,
    updateInterviewStatus,
    createConfiguration,
    getConfiguration,
    updateConfiguration,
    deleteInterview
};