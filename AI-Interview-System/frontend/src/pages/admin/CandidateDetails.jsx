import { useNavigate, useParams } from "react-router-dom";

function CandidateDetails() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  // Temporary frontend data.
  // This will later come from the backend API.
  const candidate = {
    id: candidateId,
    name: "Test Candidate",
    email: "testcandidate@example.com",
    role: "Data Scientist",
    experience: "2 Years",
    education: "M.Sc Data Science",
    certifications: "Python, AWS",
    status: "AI Interview Completed",

    primarySkills: [
      "Python",
      "Machine Learning",
      "SQL",
    ],

    secondarySkills: [
      "Pandas",
      "NumPy",
      "Power BI",
    ],

    technicalSkills: [
      "Python",
      "SQL",
      "REST APIs",
      "Git",
    ],

    softSkills: [
      "Communication",
      "Teamwork",
      "Problem Solving",
    ],

    proficiency: "Intermediate",

    resume: "Resume uploaded",

    verification: "Verified",

    interview: {
      totalQuestions: 20,
      answeredQuestions: 20,
      duration: "28 minutes",
      technicalScore: 82,
      behavioralScore: 78,
      scenarioScore: 80,
      communicationScore: 85,
      finalScore: 81,
    },

    recommendation: "Match",
  };

  const handleViewReport = () => {
    navigate("/report/interview");
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Candidate Details</h1>

          <p>
            Review candidate profile, interview and evaluation
            information
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/candidates")
          }
        >
          Back to Candidates
        </button>

      </header>

      <main className="dashboard-content">

        {/* Candidate Overview */}
        <section className="dashboard-card">

          <div className="section-heading">
            <h2>Candidate Overview</h2>

            <p>
              Candidate ID: {candidate.id}
            </p>
          </div>

          <div className="form-grid">

            <div>
              <strong>Name</strong>
              <p>{candidate.name}</p>
            </div>

            <div>
              <strong>Email</strong>
              <p>{candidate.email}</p>
            </div>

            <div>
              <strong>Applied Role</strong>
              <p>{candidate.role}</p>
            </div>

            <div>
              <strong>Experience</strong>
              <p>{candidate.experience}</p>
            </div>

            <div>
              <strong>Education</strong>
              <p>{candidate.education}</p>
            </div>

            <div>
              <strong>Certifications</strong>
              <p>{candidate.certifications}</p>
            </div>

            <div>
              <strong>Current Status</strong>

              <p>
                <span className="status-badge">
                  {candidate.status}
                </span>
              </p>
            </div>

            <div>
              <strong>Required Proficiency</strong>
              <p>{candidate.proficiency}</p>
            </div>

          </div>

        </section>

        {/* Skills */}
        <section className="dashboard-card">

          <h2>Candidate Skills</h2>

          <div className="dashboard-grid">

            <div>
              <h3>Primary Skills</h3>

              <ul>
                {candidate.primarySkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Secondary Skills</h3>

              <ul>
                {candidate.secondarySkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Technical Skills</h3>

              <ul>
                {candidate.technicalSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Soft Skills</h3>

              <ul>
                {candidate.softSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

          </div>

        </section>

        {/* Resume */}
        <section className="dashboard-card">

          <h2>Resume / CV</h2>

          <div className="verification-info">

            <strong>
              Resume Status
            </strong>

            <p>
              {candidate.resume}
            </p>

            <button type="button">
              View Resume
            </button>

          </div>

        </section>

        {/* Face Verification */}
        <section className="dashboard-card">

          <h2>Identity Verification</h2>

          <div className="verification-info">

            <strong>
              Face Verification Status
            </strong>

            <p>
              <span className="status-badge">
                {candidate.verification}
              </span>
            </p>

            <p>
              Candidate identity verification was completed
              before the AI interview.
            </p>

          </div>

        </section>

        {/* Interview Summary */}
        <section className="dashboard-card">

          <h2>Interview Summary</h2>

          <div className="dashboard-grid">

            <div className="stat-card">
              <h3>Total Questions</h3>
              <strong>
                {candidate.interview.totalQuestions}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Answered</h3>
              <strong>
                {candidate.interview.answeredQuestions}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Duration</h3>
              <strong>
                {candidate.interview.duration}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Final Score</h3>
              <strong>
                {candidate.interview.finalScore}%
              </strong>
            </div>

          </div>

        </section>

        {/* Skill Evaluation */}
        <section className="dashboard-card">

          <h2>Evaluation Breakdown</h2>

          <div className="dashboard-grid">

            <div className="stat-card">
              <h3>Technical</h3>
              <strong>
                {candidate.interview.technicalScore}%
              </strong>
            </div>

            <div className="stat-card">
              <h3>Behavioral</h3>
              <strong>
                {candidate.interview.behavioralScore}%
              </strong>
            </div>

            <div className="stat-card">
              <h3>Scenario</h3>
              <strong>
                {candidate.interview.scenarioScore}%
              </strong>
            </div>

            <div className="stat-card">
              <h3>Communication</h3>
              <strong>
                {candidate.interview.communicationScore}%
              </strong>
            </div>

          </div>

        </section>

        {/* Recommendation */}
        <section className="dashboard-card">

          <h2>AI Recommendation</h2>

          <div className="verification-info">

            <strong>
              Recommendation
            </strong>

            <p>
              <span className="status-badge">
                {candidate.recommendation}
              </span>
            </p>

            <p>
              This recommendation is intended to support HR
              review and should not be used as an automatic
              hiring decision.
            </p>

          </div>

        </section>

        {/* Actions */}
        <section className="dashboard-card">

          <div className="dashboard-header-actions">

            <button
              type="button"
              onClick={() =>
                navigate("/admin/candidates")
              }
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleViewReport}
            >
              View Interview Report
            </button>

          </div>

        </section>

        {/* Backend Notice */}
        <section className="report-notice">

          <strong>Backend Integration Pending</strong>

          <p>
            Candidate profile, resume, verification events,
            interview answers, evaluation scores and
            recommendation will later be loaded from the
            backend and database.
          </p>

        </section>

      </main>
    </div>
  );
}

export default CandidateDetails;