const pool = require("../config/database");

// Create/update face verification for an interview
const createFaceVerification = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            verification_status,
            confidence_score
        } = req.body;

        if (!verification_status) {
            return res.status(400).json({
                message: "verification_status is required"
            });
        }

        // Check interview exists
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
            `INSERT INTO face_verifications
                (
                    interview_id,
                    verification_status,
                    confidence_score,
                    verified_at
                )
             VALUES ($1, $2, $3, NOW())
             RETURNING
                verification_id,
                interview_id,
                verification_status,
                confidence_score,
                verified_at`,
            [
                interviewId,
                verification_status,
                confidence_score === undefined
                    ? null
                    : confidence_score
            ]
        );

        res.status(201).json({
            message: "Face verification recorded successfully",
            verification: result.rows[0]
        });

    } catch (error) {
        console.error("Create face verification error:", error);

        res.status(500).json({
            message: "Failed to record face verification"
        });
    }
};


// Get latest face verification
const getFaceVerification = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                verification_id,
                interview_id,
                verification_status,
                confidence_score,
                verified_at
             FROM face_verifications
             WHERE interview_id = $1
             ORDER BY verification_id DESC
             LIMIT 1`,
            [interviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Face verification not found"
            });
        }

        res.status(200).json({
            verification: result.rows[0]
        });

    } catch (error) {
        console.error("Get face verification error:", error);

        res.status(500).json({
            message: "Failed to fetch face verification"
        });
    }
};


// Record a face verification event
const createVerificationEvent = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            event_type,
            details
        } = req.body;

        if (!event_type) {
            return res.status(400).json({
                message: "event_type is required"
            });
        }

        // Check interview exists
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
            `INSERT INTO verification_events
                (
                    interview_id,
                    event_type,
                    event_time,
                    details
                )
             VALUES ($1, $2, NOW(), $3)
             RETURNING
                event_id,
                interview_id,
                event_type,
                event_time,
                details`,
            [
                interviewId,
                event_type,
                details || null
            ]
        );

        res.status(201).json({
            message: "Verification event recorded successfully",
            event: result.rows[0]
        });

    } catch (error) {
        console.error("Create verification event error:", error);

        res.status(500).json({
            message: "Failed to record verification event"
        });
    }
};


// Get verification events for an interview
const getVerificationEvents = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                event_id,
                interview_id,
                event_type,
                event_time,
                details
             FROM verification_events
             WHERE interview_id = $1
             ORDER BY event_time, event_id`,
            [interviewId]
        );

        res.status(200).json({
            events: result.rows
        });

    } catch (error) {
        console.error("Get verification events error:", error);

        res.status(500).json({
            message: "Failed to fetch verification events"
        });
    }
};


module.exports = {
    createFaceVerification,
    getFaceVerification,
    createVerificationEvent,
    getVerificationEvents
};