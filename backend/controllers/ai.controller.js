const pool = require("../config/database");

const {
    generateInterviewQuestions
} = require("../services/ai.service");


// Generate AI interview questions
const generateQuestions = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;

        // Get interview + job details
        const interviewResult = await pool.query(
            `SELECT
                i.interview_id,
                i.job_id,
                j.title,
                j.description
             FROM interviews i
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

        const interview = interviewResult.rows[0];

        // Get required skills for the job
        const skillsResult = await pool.query(
            `SELECT
                s.skill_name,
                jr.minimum_proficiency
             FROM job_requirements jr
             JOIN skills s
                ON jr.skill_id = s.skill_id
             WHERE jr.job_id = $1
             ORDER BY s.skill_name`,
            [interview.job_id]
        );

        const skills = skillsResult.rows
            .map(
                skill =>
                    `${skill.skill_name} (${skill.minimum_proficiency})`
            )
            .join(", ");

        // Get interview configuration
        const configResult = await pool.query(
            `SELECT
                difficulty,
                technical_question_count,
                behavioral_question_count
             FROM interview_configurations
             WHERE interview_id = $1`,
            [interviewId]
        );

        const config = configResult.rows[0] || {};

        // Generate questions using AI
        const generatedData = await generateInterviewQuestions({
            jobTitle: interview.title,
            jobDescription: interview.description,
            skills: skills,
            difficulty: config.difficulty || "medium",
            technicalCount: config.technical_question_count || 5,
            behavioralCount: config.behavioral_question_count || 3
        });

        // Store generated questions in database
        const savedQuestions = [];

        for (const question of generatedData.questions) {
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
                    question.question_text,
                    question.question_type,
                    question.difficulty,
                    question.topic,
                    question.sequence_number
                ]
            );

            savedQuestions.push(result.rows[0]);
        }

        res.status(201).json({
            message: "AI interview questions generated successfully",
            questions: savedQuestions
        });

    } catch (error) {
        console.error("AI question generation error:", error);

        res.status(500).json({
            message: "Failed to generate AI interview questions"
        });
    }
};


module.exports = {
    generateQuestions
};