const pool = require("../config/database");

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


// Get single job with requirements
const getJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const jobResult = await pool.query(
            `SELECT
                job_id,
                title,
                description,
                department,
                experience_required,
                created_by,
                created_at
             FROM jobs
             WHERE job_id = $1`,
            [jobId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const requirementsResult = await pool.query(
            `SELECT
                jr.requirement_id,
                jr.job_id,
                jr.skill_id,
                s.skill_name,
                jr.minimum_proficiency
             FROM job_requirements jr
             JOIN skills s
                ON jr.skill_id = s.skill_id
             WHERE jr.job_id = $1
             ORDER BY s.skill_name`,
            [jobId]
        );

        res.status(200).json({
            job: jobResult.rows[0],
            requirements: requirementsResult.rows
        });

    } catch (error) {
        console.error("Get job by ID error:", error);

        res.status(500).json({
            message: "Failed to fetch job"
        });
    }
};


// Create a new job
const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            department,
            experience_required
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "title is required"
            });
        }

        const createdBy = req.user.user_id;

        const result = await pool.query(
            `INSERT INTO jobs
                (title, description, department, experience_required, created_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING
                job_id,
                title,
                description,
                department,
                experience_required,
                created_by,
                created_at`,
            [
                title,
                description || null,
                department || null,
                experience_required || null,
                createdBy
            ]
        );

        res.status(201).json({
            message: "Job created successfully",
            job: result.rows[0]
        });

    } catch (error) {
        console.error("Create job error:", error);

        res.status(500).json({
            message: "Failed to create job"
        });
    }
};


// Update a job
const updateJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const {
            title,
            description,
            department,
            experience_required
        } = req.body;

        const result = await pool.query(
            `UPDATE jobs
             SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                department = COALESCE($3, department),
                experience_required = COALESCE($4, experience_required)
             WHERE job_id = $5
             RETURNING
                job_id,
                title,
                description,
                department,
                experience_required,
                created_by,
                created_at`,
            [
                title,
                description,
                department,
                experience_required,
                jobId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json({
            message: "Job updated successfully",
            job: result.rows[0]
        });

    } catch (error) {
        console.error("Update job error:", error);

        res.status(500).json({
            message: "Failed to update job"
        });
    }
};


// Delete a job
const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        await pool.query(
            `DELETE FROM job_requirements
             WHERE job_id = $1`,
            [jobId]
        );

        const result = await pool.query(
            `DELETE FROM jobs
             WHERE job_id = $1
             RETURNING job_id`,
            [jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json({
            message: "Job deleted successfully"
        });

    } catch (error) {
        console.error("Delete job error:", error);

        res.status(500).json({
            message: "Failed to delete job"
        });
    }
};


// Add requirement to a job
const addJobRequirement = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const {
            skill_id,
            minimum_proficiency
        } = req.body;

        if (!skill_id || !minimum_proficiency) {
            return res.status(400).json({
                message: "skill_id and minimum_proficiency are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO job_requirements
                (job_id, skill_id, minimum_proficiency)
             VALUES ($1, $2, $3)
             RETURNING
                requirement_id,
                job_id,
                skill_id,
                minimum_proficiency`,
            [
                jobId,
                skill_id,
                minimum_proficiency
            ]
        );

        res.status(201).json({
            message: "Job requirement added successfully",
            requirement: result.rows[0]
        });

    } catch (error) {
        console.error("Add job requirement error:", error);

        res.status(500).json({
            message: "Failed to add job requirement"
        });
    }
};


// Delete job requirement
const deleteJobRequirement = async (req, res) => {
    try {
        const requirementId = req.params.requirementId;

        const result = await pool.query(
            `DELETE FROM job_requirements
             WHERE requirement_id = $1
             RETURNING requirement_id`,
            [requirementId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job requirement not found"
            });
        }

        res.status(200).json({
            message: "Job requirement deleted successfully"
        });

    } catch (error) {
        console.error("Delete job requirement error:", error);

        res.status(500).json({
            message: "Failed to delete job requirement"
        });
    }
};


module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    addJobRequirement,
    deleteJobRequirement
};