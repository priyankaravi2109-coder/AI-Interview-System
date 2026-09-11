const pool = require("../config/database");

// Get complete interview report
const getInterviewReport = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        // Get interview + candidate + job details
        const interviewResult = await pool.query(
            `SELECT
                i.interview_id,
                i.status,
                i.started_at,
                i.completed_at,
                c.candidate_id,
                c.name AS candidate_name,
                c.email AS candidate_email,
                j.job_id,
                j.title AS job_title,
                j.department
             FROM interviews i
             JOIN candidates c
                ON i.candidate_id = c.candidate_id
             JOIN jobs j
                ON i.job_id = j.job_id
             WHERE i.interview_id = $1`,
            [interviewId]
        );

        if (interviewResult.rows.length === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        // Get questions and answers
        const questionsResult = await pool.query(
            `SELECT
                q.question_id,
                q.question_text,
                q.question_type,
                q.difficulty,
                q.topic,
                q.sequence_number,
                a.answer_id,
                a.answer_text,
                a.answered_at
             FROM questions q
             LEFT JOIN answers a
                ON q.question_id = a.question_id
             WHERE q.interview_id = $1
             ORDER BY q.sequence_number, q.question_id`,
            [interviewId]
        );

        // Get evaluations
        const evaluationsResult = await pool.query(
            `SELECT
                e.evaluation_id,
                e.answer_id,
                e.technical_score,
                e.communication_score,
                e.relevance_score,
                e.feedback,
                e.evaluated_at
             FROM evaluations e
             JOIN answers a
                ON e.answer_id = a.answer_id
             WHERE a.interview_id = $1
             ORDER BY e.evaluation_id`,
            [interviewId]
        );

        // Get final interview score
        const scoreResult = await pool.query(
            `SELECT
                score_id,
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

        res.status(200).json({
            message: "Interview report generated successfully",

            interview: interviewResult.rows[0],

            questions: questionsResult.rows,

            evaluations: evaluationsResult.rows,

            score: scoreResult.rows.length > 0
                ? scoreResult.rows[0]
                : null
        });

    } catch (error) {
        console.error("Get interview report error:", error);

        res.status(500).json({
            message: "Failed to generate interview report"
        });
    }
};


module.exports = {
    getInterviewReport
};