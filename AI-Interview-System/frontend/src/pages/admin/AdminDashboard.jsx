import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardStats = [
    {
      title: "Total Candidates",
      value: "Pending",
      description: "Registered candidates",
    },
    {
      title: "Scheduled Interviews",
      value: "Pending",
      description: "Upcoming AI interviews",
    },
    {
      title: "Completed Interviews",
      value: "Pending",
      description: "Successfully completed",
    },
    {
      title: "Failed / Flagged",
      value: "Pending",
      description: "Requires review",
    },
    {
      title: "Average Score",
      value: "Pending",
      description: "Across completed interviews",
    },
    {
      title: "HR Reviews",
      value: "Pending",
      description: "Awaiting HR decision",
    },
  ];

  const managementItems = [
    {
      title: "Job Management",
      description:
        "Create and manage job descriptions, required skills and job requirements.",
      action: "Manage Jobs",
      path: "/admin/jobs",
    },
    {
      title: "Interview Configuration",
      description:
        "Configure question count, duration, difficulty, scoring weights, language and AI interviewer settings.",
      action: "Configure Interview",
      path: "/admin/interview-configuration",
    },
    {
      title: "Candidate Management",
      description:
        "View candidate profiles, skills, resumes and application status.",
      action: "View Candidates",
      path: "/admin/candidates",
    },
    {
      title: "Interview Management",
      description:
        "View scheduled interviews, interview status and assessment progress.",
      action: "Manage Interviews",
      path: "/admin/interviews",
    },
    {
      title: "Verification Logs",
      description:
        "Review face verification, camera and interview integrity events.",
      action: "View Verification",
      path: "/admin/verification-logs",
    },
    {
      title: "Interview Reports",
      description:
        "Review AI-generated scores, evaluation breakdowns and recommendations.",
      action: "View Reports",
      path: "/admin/reports",
    },
    {
      title: "Audit Logs",
      description:
        "Monitor important administrative, HR and system activities.",
      action: "View Audit Logs",
      path: "/admin/audit-logs",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Admin / HR Dashboard</h1>

          <p>
            AI Interview &amp; Assessment Management
          </p>
        </div>

        <div className="dashboard-header-actions">

          {user?.email && (
            <span>
              {user.email}
            </span>
          )}

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-content">

        {/* Welcome */}
        <section className="welcome-card">

          <h2>
            Welcome, {user?.name || "Admin / HR"}
          </h2>

          <p>
            Manage jobs, candidates, interviews, assessments,
            verification events and AI-generated reports from
            this dashboard.
          </p>

        </section>

        {/* Dashboard Statistics */}
        <section>

          <div className="section-heading">

            <h2>
              Dashboard Overview
            </h2>

            <p>
              Key candidate and interview statistics
            </p>

          </div>

          <div className="dashboard-grid">

            {dashboardStats.map((stat) => (
              <div
                className="dashboard-card"
                key={stat.title}
              >

                <h3>
                  {stat.title}
                </h3>

                <strong className="dashboard-stat-value">
                  {stat.value}
                </strong>

                <p>
                  {stat.description}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* Management */}
        <section>

          <div className="section-heading">

            <h2>
              Management
            </h2>

            <p>
              Manage the AI interview and assessment system
            </p>

          </div>

          <div className="dashboard-grid">

            {managementItems.map((item) => (
              <div
                className="dashboard-card"
                key={item.title}
              >

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(item.path)
                  }
                >
                  {item.action}
                </button>

              </div>
            ))}

          </div>

        </section>

        {/* Candidate Status Flow */}
        <section className="dashboard-card">

          <h2>
            Candidate Status Flow
          </h2>

          <p>
            Candidates move through the following recruitment
            stages:
          </p>

          <div className="candidate-status-flow">

            <span>
              Applied
            </span>

            <span>
              →
            </span>

            <span>
              Shortlisted
            </span>

            <span>
              →
            </span>

            <span>
              AI Interview Scheduled
            </span>

            <span>
              →
            </span>

            <span>
              Identity Verified
            </span>

            <span>
              →
            </span>

            <span>
              AI Interview Completed
            </span>

            <span>
              →
            </span>

            <span>
              AI Evaluation
            </span>

            <span>
              →
            </span>

            <span>
              HR Review
            </span>

            <span>
              →
            </span>

            <span>
              Selected / Rejected / On Hold
            </span>

          </div>

        </section>

        {/* System Modules */}
        <section className="dashboard-card">

          <h2>
            AI Interview System Modules
          </h2>

          <div className="form-grid">

            <div>
              <strong>
                Candidate &amp; Resume
              </strong>

              <p>
                Candidate profile, skills, experience,
                education, certifications and resume.
              </p>
            </div>

            <div>
              <strong>
                AI Question Generation
              </strong>

              <p>
                Questions are generated according to the role,
                job requirements, skills and candidate profile.
              </p>
            </div>

            <div>
              <strong>
                Answer Evaluation
              </strong>

              <p>
                Answers are evaluated for correctness,
                relevance, technical knowledge, reasoning and
                communication.
              </p>
            </div>

            <div>
              <strong>
                Adaptive Interview
              </strong>

              <p>
                Follow-up questions and difficulty can adapt
                according to previous responses.
              </p>
            </div>

            <div>
              <strong>
                Face Verification
              </strong>

              <p>
                Candidate identity and interview integrity
                events can be monitored.
              </p>
            </div>

            <div>
              <strong>
                Final Evaluation
              </strong>

              <p>
                Skill scores, final score and recommendation
                are generated for HR review.
              </p>
            </div>

          </div>

        </section>

        {/* Important Notice */}
        <section className="report-notice">

          <strong>
            AI Decision Support
          </strong>

          <p>
            AI-generated scores and recommendations are
            decision-support information. Final recruitment
            decisions should remain with authorized HR or
            human reviewers.
          </p>

        </section>

        {/* Backend Integration */}
        <section className="report-notice">

          <strong>
            Backend Integration Pending
          </strong>

          <p>
            Dashboard statistics and management records are
            currently represented by frontend data. They will
            be loaded from the backend APIs when Divya's
            services are connected.
          </p>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;