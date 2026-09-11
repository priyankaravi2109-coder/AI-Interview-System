const pool = require("../config/database");

// Get all candidates
const getAllCandidates = async (req, res) => {
    try {
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
             ORDER BY created_at DESC`
        );

        res.status(200).json({
            candidates: result.rows
        });

    } catch (error) {
        console.error("Get all candidates error:", error);

        res.status(500).json({
            message: "Failed to fetch candidates"
        });
    }
};


// Get all jobs
const getAllJobs = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                job_id,
                title,
                description,
                department,
                experience_required,
                created_by,
                created_at
             FROM jobs
             ORDER BY created_at DESC`
        );

        res.status(200).json({
            jobs: result.rows
        });

    } catch (error) {
        console.error("Get all jobs error:", error);

        res.status(500).json({
            message: "Failed to fetch jobs"
        });
    }
};


// Get all interviews
const getAllInterviews = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                i.interview_id,
                i.candidate_id,
                c.name AS candidate_name,
                c.email AS candidate_email,
                i.job_id,
                j.title AS job_title,
                j.department,
                i.status,
                i.started_at,
                i.completed_at,
                i.created_at
             FROM interviews i
             JOIN candidates c
                ON i.candidate_id = c.candidate_id
             JOIN jobs j
                ON i.job_id = j.job_id
             ORDER BY i.created_at DESC`
        );

        res.status(200).json({
            interviews: result.rows
        });

    } catch (error) {
        console.error("Get all interviews error:", error);

        res.status(500).json({
            message: "Failed to fetch interviews"
        });
    }
};


// Get detailed interview result
const getAdminInterviewDetails = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        const interviewResult = await pool.query(
            `SELECT
                i.interview_id,
                i.status,
                i.started_at,
                i.completed_at,
                i.created_at,
                c.candidate_id,
                c.name AS candidate_name,
                c.email AS candidate_email,
                c.phone AS candidate_phone,
                j.job_id,
                j.title AS job_title,
                j.description AS job_description,
                j.department,
                j.experience_required
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

        const scoreResult = await pool.query(
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

        res.status(200).json({
            interview: interviewResult.rows[0],
            score: scoreResult.rows.length > 0
                ? scoreResult.rows[0]
                : null,
            questions: questionsResult.rows,
            evaluations: evaluationsResult.rows
        });

    } catch (error) {
        console.error("Get admin interview details error:", error);

        res.status(500).json({
            message: "Failed to fetch interview details"
        });
    }
};


// Get all reports
const getAllReports = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                r.report_id,
                r.interview_id,
                r.summary,
                r.strengths,
                r.weaknesses,
                r.recommendation,
                r.generated_at,
                c.name AS candidate_name,
                c.email AS candidate_email,
                j.title AS job_title
             FROM reports r
             JOIN interviews i
                ON r.interview_id = i.interview_id
             JOIN candidates c
                ON i.candidate_id = c.candidate_id
             JOIN jobs j
                ON i.job_id = j.job_id
             ORDER BY r.generated_at DESC`
        );

        res.status(200).json({
            reports: result.rows
        });

    } catch (error) {
        console.error("Get all reports error:", error);

        res.status(500).json({
            message: "Failed to fetch reports"
        });
    }
};


module.exports = {
    getAllCandidates,
    getAllJobs,
    getAllInterviews,
    getAdminInterviewDetails,
    getAllReports
};