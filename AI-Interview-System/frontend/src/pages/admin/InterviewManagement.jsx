import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewManagement() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [interviews] = useState([
    {
      id: 1,
      candidate: "Test Candidate",
      email: "testcandidate@example.com",
      role: "Data Scientist",
      date: "Not Scheduled",
      duration: "30 minutes",
      status: "AI Interview Completed",
      score: "81%",
    },
    {
      id: 2,
      candidate: "Priya Kumar",
      email: "priya@example.com",
      role: "Data Analyst",
      date: "Not Scheduled",
      duration: "30 minutes",
      status: "AI Interview Scheduled",
      score: "-",
    },
  ]);

  const statusOptions = [
    "All",
    "AI Interview Scheduled",
    "Identity Verified",
    "AI Interview Completed",
    "AI Evaluation",
    "HR Review",
  ];

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewCandidate = (interviewId) => {
    navigate(`/admin/candidates/${interviewId}`);
  };

  const handleViewReport = () => {
    navigate("/report/interview");
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Interview Management</h1>

          <p>
            Manage scheduled, ongoing and completed AI interviews
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back to Dashboard
        </button>

      </header>

      <main className="dashboard-content">

        {/* Interview Statistics */}
        <section className="dashboard-grid">

          <div className="stat-card">
            <h3>Total Interviews</h3>

            <strong>
              {interviews.length}
            </strong>
          </div>

          <div className="stat-card">
            <h3>Scheduled</h3>

            <strong>
              {
                interviews.filter(
                  (interview) =>
                    interview.status ===
                    "AI Interview Scheduled"
                ).length
              }
            </strong>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>

            <strong>
              {
                interviews.filter(
                  (interview) =>
                    interview.status ===
                    "AI Interview Completed"
                ).length
              }
            </strong>
          </div>

          <div className="stat-card">
            <h3>Average Score</h3>

            <strong>81%</strong>
          </div>

        </section>

        {/* Search and Filter */}
        <section className="dashboard-card">

          <div className="section-heading">

            <h2>Interview List</h2>

            <p>
              Search interviews and filter them by current status.
            </p>

          </div>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="interviewSearch">
                Search Interview
              </label>

              <input
                id="interviewSearch"
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by candidate, email or role"
              />

            </div>

            <div className="form-group">

              <label htmlFor="interviewStatus">
                Status
              </label>

              <select
                id="interviewStatus"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >

                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </section>

        {/* Interview Table */}
        <section className="dashboard-card">

          <div className="candidate-table-wrapper">

            <table className="candidate-table">

              <thead>

                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Date / Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredInterviews.length === 0 ? (
                  <tr>

                    <td
                      colSpan="7"
                      style={{ textAlign: "center" }}
                    >
                      No interviews found.
                    </td>

                  </tr>
                ) : (
                  filteredInterviews.map((interview) => (
                    <tr key={interview.id}>

                      <td>

                        <strong>
                          {interview.candidate}
                        </strong>

                        <br />

                        <span>
                          {interview.email}
                        </span>

                      </td>

                      <td>
                        {interview.role}
                      </td>

                      <td>
                        {interview.date}
                      </td>

                      <td>
                        {interview.duration}
                      </td>

                      <td>

                        <span className="status-badge">
                          {interview.status}
                        </span>

                      </td>

                      <td>
                        {interview.score}
                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewCandidate(
                              interview.id
                            )
                          }
                        >
                          Candidate
                        </button>

                        {interview.status ===
                          "AI Interview Completed" && (
                          <button
                            type="button"
                            onClick={handleViewReport}
                          >
                            Report
                          </button>
                        )}

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Interview Process */}
        <section className="dashboard-card">

          <h2>Interview Process</h2>

          <p>
            The interview follows the configured AI assessment
            workflow.
          </p>

          <div className="status-flow">

            <div className="status-flow-item">
              <strong>1. Interview Scheduled</strong>
            </div>

            <div className="status-flow-item">
              <strong>2. Identity Verified</strong>
            </div>

            <div className="status-flow-item">
              <strong>3. AI Interview</strong>
            </div>

            <div className="status-flow-item">
              <strong>4. Technical Assessment</strong>
            </div>

            <div className="status-flow-item">
              <strong>5. Behavioral Assessment</strong>
            </div>

            <div className="status-flow-item">
              <strong>6. Communication Assessment</strong>
            </div>

            <div className="status-flow-item">
              <strong>7. AI Evaluation</strong>
            </div>

            <div className="status-flow-item">
              <strong>8. HR Review</strong>
            </div>

          </div>

        </section>

        {/* Interview Information */}
        <section className="dashboard-grid">

          <div className="dashboard-card">

            <h3>AI Question Generation</h3>

            <p>
              Questions are generated according to the candidate's
              skills, resume, experience and job requirements.
            </p>

          </div>

          <div className="dashboard-card">

            <h3>Adaptive Difficulty</h3>

            <p>
              Interview difficulty can change according to the
              candidate's previous performance.
            </p>

          </div>

          <div className="dashboard-card">

            <h3>Answer Evaluation</h3>

            <p>
              Candidate answers are evaluated for correctness,
              relevance, technical knowledge, problem solving and
              communication.
            </p>

          </div>

          <div className="dashboard-card">

            <h3>Interview Report</h3>

            <p>
              Completed interviews produce scores and a detailed
              report for HR review.
            </p>

          </div>

        </section>

        {/* Backend Integration */}
        <section className="report-notice">

          <strong>Backend Integration Pending</strong>

          <p>
            Interview schedules, candidate responses, evaluation
            results, timings and interview status will be loaded
            from Divya's backend API when those endpoints are
            connected.
          </p>

        </section>

      </main>
    </div>
  );
}

export default InterviewManagement;