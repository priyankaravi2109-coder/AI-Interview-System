import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ResumeUploader from "../../components/candidate/ResumeUploader";
import candidateService from "../../services/candidateService";

export default function ResumeUpload() {
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResumeUpload = async (file) => {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      await candidateService.uploadResume(file);

      setMessage(
        "Resume uploaded successfully. It can now be used for AI-powered interview assessment."
      );
    } catch (err) {
      console.error("Resume upload failed:", err);

      setError(
        err?.response?.data?.message ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>Resume / CV</h1>

          <p>
            Manage your resume for AI Interview & Assessment
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/candidate/dashboard")
          }
        >
          Back to Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        <section className="dashboard-card">

          <h2>Upload Your Resume</h2>

          <p>
            Upload your latest resume or CV so the AI
            interview system can consider your skills,
            technologies, projects, experience,
            certifications and qualifications.
          </p>

          <ResumeUploader
            onUpload={handleResumeUpload}
          />

          {uploading && (
            <div className="verification-success">
              Uploading your resume...
            </div>
          )}

          {message && (
            <div className="verification-success">
              {message}
            </div>
          )}

          {error && (
            <div className="resume-error">
              {error}
            </div>
          )}

        </section>

        <section className="dashboard-card">

          <h2>Resume Requirements</h2>

          <ul>
            <li>
              Upload your latest resume or CV.
            </li>

            <li>
              Supported formats: PDF, DOC and DOCX.
            </li>

            <li>
              Maximum file size: 5 MB.
            </li>

            <li>
              Include your education and experience.
            </li>

            <li>
              Include your technical and soft skills.
            </li>

            <li>
              Include projects and technologies you
              have worked with.
            </li>

            <li>
              Include relevant certifications.
            </li>
          </ul>

        </section>

        <section className="dashboard-card">

          <h2>How Your Resume Is Used</h2>

          <div className="resume-processing-steps">

            <div className="resume-step">
              <span>1</span>

              <div>
                <h3>Upload</h3>

                <p>
                  Your resume is uploaded through the
                  candidate portal.
                </p>
              </div>
            </div>

            <div className="resume-step">
              <span>2</span>

              <div>
                <h3>Resume Analysis</h3>

                <p>
                  The backend AI service can analyze
                  relevant skills, technologies,
                  projects, experience and
                  certifications.
                </p>
              </div>
            </div>

            <div className="resume-step">
              <span>3</span>

              <div>
                <h3>Interview Personalization</h3>

                <p>
                  Resume information can be combined
                  with the job requirements and
                  candidate skills to generate relevant
                  interview questions.
                </p>
              </div>
            </div>

            <div className="resume-step">
              <span>4</span>

              <div>
                <h3>AI Evaluation</h3>

                <p>
                  Resume context can be considered
                  together with interview answers during
                  the overall candidate evaluation.
                </p>
              </div>
            </div>

          </div>

        </section>

        <section className="dashboard-card">

          <h2>Privacy & Security</h2>

          <p>
            Resume information is candidate data and
            should be handled securely by the backend.
            AI credentials and sensitive processing
            must remain on the server and must not be
            exposed in the frontend.
          </p>

        </section>

        <div className="resume-page-actions">

          <button
            type="button"
            onClick={() =>
              navigate("/candidate/dashboard")
            }
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/candidate/profile")
            }
          >
            View My Profile
          </button>

        </div>

      </main>

    </div>
  );
}