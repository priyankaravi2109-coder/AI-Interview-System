const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const authRoutes = require("./routes/auth.routes");
const candidateRoutes = require("./routes/candidate.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");
const skillsRoutes = require("./routes/skills.routes");
const interviewRoutes = require("./routes/interview.routes");
const questionsRoutes = require("./routes/questions.routes");
const evaluationRoutes = require("./routes/evaluation.routes");
const aiRoutes = require("./routes/ai.routes");
const reportRoutes = require("./routes/report.routes");
const faceRoutes = require("./routes/face.routes");
const codingRoutes = require("./routes/coding.routes");
const adminRoutes = require("./routes/admin.routes");

const authenticateToken = require("./middleware/auth.middleware");

const app = express();

// Use hosting provider's PORT when deployed.
// Use 5000 when running locally.
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Candidate routes
app.use("/api/candidates", candidateRoutes);

// Resume routes
app.use("/api/resume", resumeRoutes);

// Skills routes
app.use("/api/skills", skillsRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);

// Interview routes
app.use("/api/interviews", interviewRoutes);

// Questions & Answers routes
app.use("/api/questions", questionsRoutes);

// Evaluation & Scoring routes
app.use("/api/evaluations", evaluationRoutes);

// AI Question Generation routes
app.use("/api/ai", aiRoutes);

// Reports routes
app.use("/api/reports", reportRoutes);

// Face Verification routes
app.use("/api/face", faceRoutes);

// Coding Assessment routes
app.use("/api/coding", codingRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "AI Interview System Backend is running"
    });
});

// Database test
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Protected test route
app.get("/api/protected-test", authenticateToken, (req, res) => {
    res.json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});