import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import CandidateProfileCard from "../../components/candidate/CandidateProfileCard";
import CandidateStatus from "../../components/candidate/CandidateStatus";
import SkillList from "../../components/candidate/SkillList";
import ResumeUploader from "../../components/candidate/ResumeUploader";

import candidateService from "../../services/candidateService";

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidateProfile = async () => {
      try {
        const data = await candidateService.getProfile();

        const profile =
          data.candidate || data.user || data;

        setCandidate(profile);
      } catch (err) {
        console.error(
          "Failed to load candidate profile:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load candidate profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCandidateProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleResumeUpload = async (file) => {
    try {
      await candidateService.uploadResume(file);

      alert("Resume uploaded successfully.");

      const data = await candidateService.getProfile();

      const profile =
        data.candidate || data.user || data;

      setCandidate(profile);
    } catch (err) {
      console.error("Resume upload failed:", err);

      alert(
        err?.response?.data?.message ||
          "Resume upload failed."
      );
    }
  };

  const handleStartInterview = () => {
    navigate("/interview/verification");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h2>Loading candidate profile...</h2>
            <p>Please wait.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h2>Candidate Dashboard</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const candidateData = {
    name:
      candidate?.name ||
      user?.name ||
      "Candidate",

    email:
      candidate?.email ||
      user?.email ||
      "",

    role:
      candidate?.role ||
      "",

    experience:
      candidate?.experience ||
      "",

    education:
      candidate?.education ||
      "",

    certifications:
      candidate?.certifications ||
      [],
  };

  const skills = [
    ...(candidate?.primarySkills || []),
    ...(candidate?.secondarySkills || []),
    ...(candidate?.technicalSkills || []),
    ...(candidate?.softSkills || []),
  ];

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>Candidate Dashboard</h1>

          <p>
            AI Interview & Assessment Portal
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">

        <section className="welcome-card">
          <h2>
            Welcome, {candidateData.name}
          </h2>

          <p>
            Manage your profile, resume, applications
            and AI interview activities from here.
          </p>

          <CandidateStatus
            status={candidate?.status || "applied"}
          />
        </section>

        <section className="interview-start-card">

          <div>
            <h2>AI Interview</h2>

            <p>
              Start your AI-powered interview and
              assessment. Your identity will be
              verified before the interview begins.
            </p>

            <div className="interview-features">
              <span>✓ Face Verification</span>
              <span>✓ AI Generated Questions</span>
              <span>✓ Technical Assessment</span>
              <span>✓ Behavioral Assessment</span>
              <span>✓ Communication Assessment</span>
              <span>✓ AI Evaluation & Report</span>
            </div>
          </div>

          <button
            type="button"
            className="start-interview-button"
            onClick={handleStartInterview}
          >
            Start AI Interview
          </button>

        </section>

        <section className="candidate-dashboard-section">

          <CandidateProfileCard
            candidate={candidateData}
          />

          <button
            type="button"
            className="profile-button"
            onClick={() =>
              navigate("/candidate/profile")
            }
          >
            View Full Profile
          </button>

        </section>

        <section className="candidate-dashboard-section">

          <SkillList
            skills={skills}
          />

        </section>

        <section className="candidate-dashboard-section">

          <div className="dashboard-card">

            <h2>Resume / CV</h2>

            <p>
              Upload and manage your resume for
              AI-powered interview assessment.
            </p>

            <button
              type="button"
              className="profile-button"
              onClick={() =>
                navigate("/candidate/resume")
              }
            >
              Open Resume / CV
            </button>

            <div className="dashboard-resume-upload">

              <ResumeUploader
                onUpload={handleResumeUpload}
              />

            </div>

          </div>

        </section>

        <section className="dashboard-grid">

          <div
            className="dashboard-card clickable-card"
            onClick={() =>
              navigate("/candidate/profile")
            }
          >
            <h3>My Profile</h3>

            <p>
              View your personal information,
              education, experience, skills
              and certifications.
            </p>
          </div>

          <div
            className="dashboard-card clickable-card"
            onClick={() =>
              navigate("/candidate/resume")
            }
          >
            <h3>Resume / CV</h3>

            <p>
              Upload and manage your resume
              for AI interview assessment.
            </p>
          </div>

          <div className="dashboard-card">

            <h3>My Applications</h3>

            <p>
              Track your job applications
              and application status.
            </p>

          </div>

          <div className="dashboard-card">

            <h3>Interview Schedule</h3>

            <p>
              View your scheduled AI interviews
              and interview details.
            </p>

          </div>

          <div
            className="dashboard-card clickable-card"
            onClick={() =>
              navigate("/interview/result")
            }
          >
            <h3>Interview Results</h3>

            <p>
              View completed interview results
              and AI evaluation reports.
            </p>
          </div>

        </section>

      </main>

    </div>
  );
}