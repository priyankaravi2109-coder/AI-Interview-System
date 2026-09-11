const pool = require("../config/database");

// Create a coding assessment
const createCodingAssessment = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            question,
            language
        } = req.body;

        if (!question || !language) {
            return res.status(400).json({
                message: "question and language are required"
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
            `INSERT INTO coding_assessments
                (
                    interview_id,
                    question,
                    language
                )
             VALUES ($1, $2, $3)
             RETURNING
                coding_id,
                interview_id,
                question,
                candidate_code,
                language,
                test_result,
                score`,
            [
                interviewId,
                question,
                language
            ]
        );

        res.status(201).json({
            message: "Coding assessment created successfully",
            coding_assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Create coding assessment error:", error);

        res.status(500).json({
            message: "Failed to create coding assessment"
        });
    }
};


// Get coding assessment
const getCodingAssessment = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                coding_id,
                interview_id,
                question,
                candidate_code,
                language,
                test_result,
                score
             FROM coding_assessments
             WHERE interview_id = $1
             ORDER BY coding_id DESC
             LIMIT 1`,
            [interviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Coding assessment not found"
            });
        }

        res.status(200).json({
            coding_assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Get coding assessment error:", error);

        res.status(500).json({
            message: "Failed to fetch coding assessment"
        });
    }
};


// Submit candidate code
const submitCandidateCode = async (req, res) => {
    try {
        const codingId = req.params.codingId;

        const {
            candidate_code
        } = req.body;

        if (!candidate_code) {
            return res.status(400).json({
                message: "candidate_code is required"
            });
        }

        const result = await pool.query(
            `UPDATE coding_assessments
             SET candidate_code = $1
             WHERE coding_id = $2
             RETURNING
                coding_id,
                interview_id,
                question,
                candidate_code,
                language,
                test_result,
                score`,
            [
                candidate_code,
                codingId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Coding assessment not found"
            });
        }

        res.status(200).json({
            message: "Candidate code submitted successfully",
            coding_assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Submit candidate code error:", error);

        res.status(500).json({
            message: "Failed to submit candidate code"
        });
    }
};


// Update coding test result and score
const updateCodingResult = async (req, res) => {
    try {
        const codingId = req.params.codingId;

        const {
            test_result,
            score
        } = req.body;

        if (test_result === undefined || score === undefined) {
            return res.status(400).json({
                message: "test_result and score are required"
            });
        }

        const result = await pool.query(
            `UPDATE coding_assessments
             SET
                test_result = $1,
                score = $2
             WHERE coding_id = $3
             RETURNING
                coding_id,
                interview_id,
                question,
                candidate_code,
                language,
                test_result,
                score`,
            [
                test_result,
                score,
                codingId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Coding assessment not found"
            });
        }

        res.status(200).json({
            message: "Coding result updated successfully",
            coding_assessment: result.rows[0]
        });

    } catch (error) {
        console.error("Update coding result error:", error);

        res.status(500).json({
            message: "Failed to update coding result"
        });
    }
};


// Delete coding assessment
const deleteCodingAssessment = async (req, res) => {
    try {
        const codingId = req.params.codingId;

        const result = await pool.query(
            `DELETE FROM coding_assessments
             WHERE coding_id = $1
             RETURNING coding_id`,
            [codingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Coding assessment not found"
            });
        }

        res.status(200).json({
            message: "Coding assessment deleted successfully"
        });

    } catch (error) {
        console.error("Delete coding assessment error:", error);

        res.status(500).json({
            message: "Failed to delete coding assessment"
        });
    }
};


module.exports = {
    createCodingAssessment,
    getCodingAssessment,
    submitCandidateCode,
    updateCodingResult,
    deleteCodingAssessment
};