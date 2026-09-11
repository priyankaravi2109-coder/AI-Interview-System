const pool = require("../config/database");

// Evaluate one answer
const evaluateAnswer = async (req, res) => {
    try {
        const answerId = req.params.answerId;

        const {
            technical_score,
            communication_score,
            relevance_score,
            feedback
        } = req.body;

        if (
            technical_score === undefined ||
            communication_score === undefined ||
            relevance_score === undefined
        ) {
            return res.status(400).json({
                message: "technical_score, communication_score and relevance_score are required"
            });
        }

        const answerResult = await pool.query(
            `SELECT answer_id
             FROM answers
             WHERE answer_id = $1`,
            [answerId]
        );

        if (answerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Answer not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO evaluations
                (
                    answer_id,
                    technical_score,
                    communication_score,
                    relevance_score,
                    feedback,
                    evaluated_at
                )
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING
                evaluation_id,
                answer_id,
                technical_score,
                communication_score,
                relevance_score,
                feedback,
                evaluated_at`,
            [
                answerId,
                technical_score,
                communication_score,
                relevance_score,
                feedback || null
            ]
        );

        res.status(201).json({
            message: "Answer evaluated successfully",
            evaluation: result.rows[0]
        });

    } catch (error) {
        console.error("Evaluate answer error:", error);

        res.status(500).json({
            message: "Failed to evaluate answer"
        });
    }
};


// Get evaluation for one answer
const getAnswerEvaluation = async (req, res) => {
    try {
        const answerId = req.params.answerId;

        const result = await pool.query(
            `SELECT
                evaluation_id,
                answer_id,
                technical_score,
                communication_score,
                relevance_score,
                feedback,
                evaluated_at
             FROM evaluations
             WHERE answer_id = $1
             ORDER BY evaluated_at DESC
             LIMIT 1`,
            [answerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Evaluation not found"
            });
        }

        res.status(200).json({
            evaluation: result.rows[0]
        });

    } catch (error) {
        console.error("Get answer evaluation error:", error);

        res.status(500).json({
            message: "Failed to fetch evaluation"
        });
    }
};


// Create interview score
const createInterviewScore = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            technical_score,
            behavioral_score,
            coding_score,
            communication_score
        } = req.body;

        if (
            technical_score === undefined ||
            behavioral_score === undefined ||
            communication_score === undefined
        ) {
            return res.status(400).json({
                message: "technical_score, behavioral_score and communication_score are required"
            });
        }

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

        const codingScore =
            coding_score === undefined ? 0 : coding_score;

        const overallScore =
            (
                Number(technical_score) +
                Number(behavioral_score) +
                Number(codingScore) +
                Number(communication_score)
            ) / 4;

        const result = await pool.query(
            `INSERT INTO scores
                (
                    interview_id,
                    technical_score,
                    behavioral_score,
                    coding_score,
                    communication_score,
                    overall_score
                )
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING
                score_id,
                interview_id,
                technical_score,
                behavioral_score,
                coding_score,
                communication_score,
                overall_score`,
            [
                interviewId,
                technical_score,
                behavioral_score,
                codingScore,
                communication_score,
                overallScore
            ]
        );

        res.status(201).json({
            message: "Interview score created successfully",
            score: result.rows[0]
        });

    } catch (error) {
        console.error("Create interview score error:", error);

        res.status(500).json({
            message: "Failed to create interview score"
        });
    }
};


// Get interview score
const getInterviewScore = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                score_id,
                interview_id,
                technical_score,
                behavioral_score,
                coding_score,
                communication_score,
                overall_score
             FROM scores
             WHERE interview_id = $1
             ORDER BY score_id DESC
             LIMIT 1`,
            [interviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Interview score not found"
            });
        }

        res.status(200).json({
            score: result.rows[0]
        });

    } catch (error) {
        console.error("Get interview score error:", error);

        res.status(500).json({
            message: "Failed to fetch interview score"
        });
    }
};


// Update interview score
const updateInterviewScore = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            technical_score,
            behavioral_score,
            coding_score,
            communication_score
        } = req.body;

        const currentResult = await pool.query(
            `SELECT
                technical_score,
                behavioral_score,
                coding_score,
                communication_score
             FROM scores
             WHERE interview_id = $1
             ORDER BY score_id DESC
             LIMIT 1`,
            [interviewId]
        );

        if (currentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Interview score not found"
            });
        }

        const current = currentResult.rows[0];

        const technical =
            technical_score === undefined
                ? current.technical_score
                : technical_score;

        const behavioral =
            behavioral_score === undefined
                ? current.behavioral_score
                : behavioral_score;

        const coding =
            coding_score === undefined
                ? current.coding_score
                : coding_score;

        const communication =
            communication_score === undefined
                ? current.communication_score
                : communication_score;

        const overall =
            (
                Number(technical) +
                Number(behavioral) +
                Number(coding) +
                Number(communication)
            ) / 4;

        const result = await pool.query(
            `UPDATE scores
             SET
                technical_score = $1,
                behavioral_score = $2,
                coding_score = $3,
                communication_score = $4,
                overall_score = $5
             WHERE score_id = (
                 SELECT score_id
                 FROM scores
                 WHERE interview_id = $6
                 ORDER BY score_id DESC
                 LIMIT 1
             )
             RETURNING
                score_id,
                interview_id,
                technical_score,
                behavioral_score,
                coding_score,
                communication_score,
                overall_score`,
            [
                technical,
                behavioral,
                coding,
                communication,
                overall,
                interviewId
            ]
        );

        res.status(200).json({
            message: "Interview score updated successfully",
            score: result.rows[0]
        });

    } catch (error) {
        console.error("Update interview score error:", error);

        res.status(500).json({
            message: "Failed to update interview score"
        });
    }
};


module.exports = {
    evaluateAnswer,
    getAnswerEvaluation,
    createInterviewScore,
    getInterviewScore,
    updateInterviewScore
};