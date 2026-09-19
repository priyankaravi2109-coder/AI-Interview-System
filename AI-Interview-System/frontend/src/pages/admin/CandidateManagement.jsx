import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateManagement() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [candidates] = useState([
    {
      id: 1,
      name: "Test Candidate",
      email: "testcandidate@example.com",
      role: "Data Scientist",
      experience: "2 Years",
      status: "Applied",
      score: "-",
    },
    {
      id: 2,
      name: "Priya Kumar",
      email: "priya@example.com",
      role: "Data Analyst",
      experience: "1 Year",
      status: "Shortlisted",
      score: "-",
    },
  ]);

  const statusOptions = [
    "All",
    "Applied",
    "Shortlisted",
    "AI Interview Scheduled",
    "Identity Verified",
    "AI Interview Completed",
    "AI Evaluation",
    "HR Review",
    "Selected",
    "Rejected",
    "On Hold",
  ];

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      candidate.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      candidate.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewCandidate = (candidateId) => {
    navigate(`/admin/candidates/${candidateId}`);
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Candidate Management</h1>
          <p>
            Manage candidates, applications and interview status
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

        {/* Summary */}
        <section className="dashboard-grid">

          <div className="stat-card">
            <h3>Total Candidates</h3>
            <strong>{candidates.length}</strong>
          </div>

          <div className="stat-card">
            <h3>Applied</h3>
            <strong>
              {
                candidates.filter(
                  (candidate) => candidate.status === "Applied"
                ).length
              }
            </strong>
          </div>

          <div className="stat-card">
            <h3>Shortlisted</h3>
            <strong>
              {
                candidates.filter(
                  (candidate) =>
                    candidate.status === "Shortlisted"
                ).length
              }
            </strong>
          </div>

          <div className="stat-card">
            <h3>Completed Interviews</h3>
            <strong>
              {
                candidates.filter(
                  (candidate) =>
                    candidate.status ===
                    "AI Interview Completed"
                ).length
              }
            </strong>
          </div>

        </section>

        {/* Search and Filter */}
        <section className="dashboard-card">

          <div className="section-heading">
            <h2>Candidate List</h2>

            <p>
              Search candidates and filter them by recruitment
              status.
            </p>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="candidateSearch">
                Search Candidate
              </label>

              <input
                id="candidateSearch"
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by name, email or role"
              />
            </div>

            <div className="form-group">
              <label htmlFor="statusFilter">
                Status
              </label>

              <select
                id="statusFilter"
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

        {/* Candidates Table */}
        <section className="dashboard-card">

          <div className="candidate-table-wrapper">

            <table className="candidate-table">

              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>AI Score</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center" }}
                    >
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>

                      <td>
                        <strong>
                          {candidate.name}
                        </strong>

                        <br />

                        <span>
                          {candidate.email}
                        </span>
                      </td>

                      <td>
                        {candidate.role}
                      </td>

                      <td>
                        {candidate.experience}
                      </td>

                      <td>
                        <span className="status-badge">
                          {candidate.status}
                        </span>
                      </td>

                      <td>
                        {candidate.score}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleViewCandidate(
                              candidate.id
                            )
                          }
                        >
                          View Details
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Recruitment Status Flow */}
        <section className="dashboard-card">

          <h2>Candidate Status Flow</h2>

          <p>
            Candidates move through the recruitment workflow
            from application to HR review.
          </p>

          <div className="status-flow">

            {statusOptions
              .filter((status) => status !== "All")
              .map((status, index) => (
                <div
                  className="status-flow-item"
                  key={status}
                >
                  <strong>
                    {index + 1}. {status}
                  </strong>
                </div>
              ))}

          </div>

        </section>

        {/* Backend Integration */}
        <section className="report-notice">

          <strong>Backend Integration Pending</strong>

          <p>
            Candidate information, status updates, AI scores
            and interview details will be loaded from Divya's
            backend API when the candidate-management endpoints
            are connected.
          </p>

        </section>

      </main>
    </div>
  );
}

export default CandidateManagement;