import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewReports() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [recommendationFilter, setRecommendationFilter] =
    useState("All");

  // Temporary frontend data.
  // This will later come from the backend interview reports API.
  const reports = [
    {
      id: 1,
      candidate: "Priyanka Ravi",
      candidateId: "CAND001",
      role: "Data Scientist",
      interviewId: "INT001",
      date: "10 Sep 2026",
      duration: "28 min",
      questions: 20,
      technical: 86,
      practical: 82,
      problemSolving: 88,
      communication: 84,
      behavioral: 85,
      roleFit: 87,
      finalScore: 85,
      recommendation: "Strong Match",
      summary:
        "Strong technical knowledge with good practical problem-solving and communication skills.",
    },
    {
      id: 2,
      candidate: "Rahul Kumar",
      candidateId: "CAND002",
      role: "Software Developer",
      interviewId: "INT002",
      date: "10 Sep 2026",
      duration: "30 min",
      questions: 20,
      technical: 72,
      practical: 68,
      problemSolving: 70,
      communication: 74,
      behavioral: 76,
      roleFit: 71,
      finalScore: 72,
      recommendation: "Match",
      summary:
        "Good overall performance with acceptable technical and communication skills.",
    },
    {
      id: 3,
      candidate: "Ananya Sharma",
      candidateId: "CAND003",
      role: "Data Analyst",
      interviewId: "INT003",
      date: "10 Sep 2026",
      duration: "24 min",
      questions: 18,
      technical: 61,
      practical: 58,
      problemSolving: 63,
      communication: 67,
      behavioral: 70,
      roleFit: 62,
      finalScore: 63,
      recommendation: "Borderline",
      summary:
        "Candidate demonstrates basic knowledge but needs improvement in practical application.",
    },
    {
      id: 4,
      candidate: "Arun Prakash",
      candidateId: "CAND004",
      role: "Backend Developer",
      interviewId: "INT004",
      date: "10 Sep 2026",
      duration: "19 min",
      questions: 15,
      technical: 48,
      practical: 45,
      problemSolving: 50,
      communication: 55,
      behavioral: 58,
      roleFit: 47,
      finalScore: 50,
      recommendation: "Needs Human Review",
      summary:
        "Performance requires additional human review before making a recruitment decision.",
    },
  ];

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.candidate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.candidateId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.interviewId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRecommendation =
      recommendationFilter === "All" ||
      report.recommendation === recommendationFilter;

    return matchesSearch && matchesRecommendation;
  });

  const getRecommendationClass = (recommendation) => {
    if (recommendation === "Strong Match") {
      return "status-badge status-success";
    }

    if (recommendation === "Match") {
      return "status-badge status-success";
    }

    if (recommendation === "Borderline") {
      return "status-badge status-warning";
    }

    return "status-badge status-danger";
  };

  const getScoreClass = (score) => {
    if (score >= 80) {
      return "status-badge status-success";
    }

    if (score >= 60) {
      return "status-badge status-warning";
    }

    return "status-badge status-danger";
  };

  const viewReport = (reportId) => {
    navigate(`/report/interview?reportId=${reportId}`);
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Interview Reports</h1>

          <p>
            Review AI-generated interview evaluation reports
            for candidates
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

        {/* Statistics */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <h3>Total Reports</h3>
            <strong>{reports.length}</strong>
          </div>

          <div className="stat-card">
            <h3>Strong Match</h3>
            <strong>
              {
                reports.filter(
                  (report) =>
                    report.recommendation === "Strong Match"
                ).length
              }
            </strong>
          </div>

          <div className="stat-card">
            <h3>Average Score</h3>
            <strong>
              {Math.round(
                reports.reduce(
                  (total, report) =>
                    total + report.finalScore,
                  0
                ) / reports.length
              )}
              %
            </strong>
          </div>

          <div className="stat-card">
            <h3>Human Review</h3>
            <strong>
              {
                reports.filter(
                  (report) =>
                    report.recommendation ===
                    "Needs Human Review"
                ).length
              }
            </strong>
          </div>

        </section>

        {/* Search and Filter */}
        <section className="dashboard-card">

          <h2>Search Reports</h2>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="reportSearch">
                Search Candidate
              </label>

              <input
                id="reportSearch"
                type="text"
                placeholder="Candidate, ID, role or interview ID"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label htmlFor="recommendationFilter">
                Recommendation
              </label>

              <select
                id="recommendationFilter"
                value={recommendationFilter}
                onChange={(event) =>
                  setRecommendationFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Recommendations
                </option>

                <option value="Strong Match">
                  Strong Match
                </option>

                <option value="Match">
                  Match
                </option>

                <option value="Borderline">
                  Borderline
                </option>

                <option value="Needs Human Review">
                  Needs Human Review
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* Reports Table */}
        <section className="dashboard-card">

          <h2>Candidate Reports</h2>

          <div className="table-container">

            <table className="dashboard-table">

              <thead>

                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Interview</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Final Score</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id}>

                      <td>
                        <strong>
                          {report.candidate}
                        </strong>

                        <br />

                        <small>
                          {report.candidateId}
                        </small>
                      </td>

                      <td>
                        {report.role}
                      </td>

                      <td>
                        {report.interviewId}
                        <br />
                        <small>
                          {report.date}
                        </small>
                      </td>

                      <td>
                        {report.duration}
                      </td>

                      <td>
                        {report.questions}
                      </td>

                      <td>
                        <span
                          className={getScoreClass(
                            report.finalScore
                          )}
                        >
                          {report.finalScore}%
                        </span>
                      </td>

                      <td>
                        <span
                          className={getRecommendationClass(
                            report.recommendation
                          )}
                        >
                          {report.recommendation}
                        </span>
                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            viewReport(report.id)
                          }
                        >
                          View Report
                        </button>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>

                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No interview reports found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Evaluation Categories */}
        <section className="dashboard-card">

          <h2>Evaluation Categories</h2>

          <div className="form-grid">

            <div>
              <strong>Technical Knowledge</strong>
              <p>
                Measures understanding of technical concepts,
                tools and technologies.
              </p>
            </div>

            <div>
              <strong>Practical Knowledge</strong>
              <p>
                Measures the ability to apply knowledge to
                real-world situations.
              </p>
            </div>

            <div>
              <strong>Problem Solving</strong>
              <p>
                Measures reasoning, analysis and problem-solving
                ability.
              </p>
            </div>

            <div>
              <strong>Communication</strong>
              <p>
                Measures clarity, relevance and effectiveness
                of communication.
              </p>
            </div>

            <div>
              <strong>Behavioral Skills</strong>
              <p>
                Measures workplace behavior and situational
                responses.
              </p>
            </div>

            <div>
              <strong>Role Fit</strong>
              <p>
                Measures alignment between candidate skills and
                job requirements.
              </p>
            </div>

          </div>

        </section>

        {/* Report Information */}
        <section className="report-notice">

          <strong>
            AI Evaluation & Human Review
          </strong>

          <p>
            AI-generated scores and recommendations are
            decision-support information. Final recruitment
            decisions should be made through authorized human
            HR review.
          </p>

        </section>

        {/* Backend Notice */}
        <section className="report-notice">

          <strong>
            Backend Integration Pending
          </strong>

          <p>
            The current reports use temporary frontend data.
            Later, candidate information, question evaluations,
            skill scores, final scores and recommendations will
            be loaded from the backend interview-report API.
          </p>

        </section>

      </main>
    </div>
  );
}

export default InterviewReports;