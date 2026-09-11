const pool = require("../config/database");

// Get all questions for an interview
const getInterviewQuestions = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                question_id,
                interview_id,
                question_text,
                question_type,
                difficulty,
                topic,
                sequence_number,
                created_at
             FROM questions
             WHERE interview_id = $1
             ORDER BY sequence_number, question_id`,
            [interviewId]
        );

        res.status(200).json({
            questions: result.rows
        });

    } catch (error) {
        console.error("Get interview questions error:", error);

        res.status(500).json({
            message: "Failed to fetch questions"
        });
    }
};


// Get one question
const getQuestionById = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        const result = await pool.query(
            `SELECT
                question_id,
                interview_id,
                question_text,
                question_type,
                difficulty,
                topic,
                sequence_number,
                created_at
             FROM questions
             WHERE question_id = $1`,
            [questionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.status(200).json({
            question: result.rows[0]
        });

    } catch (error) {
        console.error("Get question error:", error);

        res.status(500).json({
            message: "Failed to fetch question"
        });
    }
};


// Create a question
const createQuestion = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const {
            question_text,
            question_type,
            difficulty,
            topic,
            sequence_number
        } = req.body;

        if (!question_text || !question_type) {
            return res.status(400).json({
                message: "question_text and question_type are required"
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

        const result = await pool.query(
            `INSERT INTO questions
                (
                    interview_id,
                    question_text,
                    question_type,
                    difficulty,
                    topic,
                    sequence_number
                )
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING
                question_id,
                interview_id,
                question_text,
                question_type,
                difficulty,
                topic,
                sequence_number,
                created_at`,
            [
                interviewId,
                question_text,
                question_type,
                difficulty || "medium",
                topic || null,
                sequence_number || 1
            ]
        );

        res.status(201).json({
            message: "Question created successfully",
            question: result.rows[0]
        });

    } catch (error) {
        console.error("Create question error:", error);

        res.status(500).json({
            message: "Failed to create question"
        });
    }
};


// Update a question
const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        const {
            question_text,
            question_type,
            difficulty,
            topic,
            sequence_number
        } = req.body;

        const result = await pool.query(
            `UPDATE questions
             SET
                question_text = COALESCE($1, question_text),
                question_type = COALESCE($2, question_type),
                difficulty = COALESCE($3, difficulty),
                topic = COALESCE($4, topic),
                sequence_number = COALESCE($5, sequence_number)
             WHERE question_id = $6
             RETURNING
                question_id,
                interview_id,
                question_text,
                question_type,
                difficulty,
                topic,
                sequence_number,
                created_at`,
            [
                question_text,
                question_type,
                difficulty,
                topic,
                sequence_number,
                questionId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.status(200).json({
            message: "Question updated successfully",
            question: result.rows[0]
        });

    } catch (error) {
        console.error("Update question error:", error);

        res.status(500).json({
            message: "Failed to update question"
        });
    }
};


// Delete a question
const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        // Delete answer first because answers reference this question
        await pool.query(
            `DELETE FROM answers
             WHERE question_id = $1`,
            [questionId]
        );

        const result = await pool.query(
            `DELETE FROM questions
             WHERE question_id = $1
             RETURNING question_id`,
            [questionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.status(200).json({
            message: "Question deleted successfully"
        });

    } catch (error) {
        console.error("Delete question error:", error);

        res.status(500).json({
            message: "Failed to delete question"
        });
    }
};


// Submit an answer
const submitAnswer = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;
        const questionId = req.params.questionId;

        const { answer_text } = req.body;

        if (!answer_text) {
            return res.status(400).json({
                message: "answer_text is required"
            });
        }

        const questionResult = await pool.query(
            `SELECT question_id
             FROM questions
             WHERE question_id = $1
               AND interview_id = $2`,
            [questionId, interviewId]
        );

        if (questionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found for this interview"
            });
        }

        const result = await pool.query(
            `INSERT INTO answers
                (
                    question_id,
                    interview_id,
                    answer_text,
                    answered_at
                )
             VALUES ($1, $2, $3, NOW())
             RETURNING
                answer_id,
                question_id,
                interview_id,
                answer_text,
                answered_at`,
            [
                questionId,
                interviewId,
                answer_text
            ]
        );

        res.status(201).json({
            message: "Answer submitted successfully",
            answer: result.rows[0]
        });

    } catch (error) {
        console.error("Submit answer error:", error);

        res.status(500).json({
            message: "Failed to submit answer"
        });
    }
};


// Get answers for an interview
const getInterviewAnswers = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const result = await pool.query(
            `SELECT
                a.answer_id,
                a.question_id,
                a.interview_id,
                q.question_text,
                a.answer_text,
                a.answered_at
             FROM answers a
             JOIN questions q
                ON a.question_id = q.question_id
             WHERE a.interview_id = $1
             ORDER BY q.sequence_number, a.answer_id`,
            [interviewId]
        );

        res.status(200).json({
            answers: result.rows
        });

    } catch (error) {
        console.error("Get interview answers error:", error);

        res.status(500).json({
            message: "Failed to fetch answers"
        });
    }
};


module.exports = {
    getInterviewQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    submitAnswer,
    getInterviewAnswers
};