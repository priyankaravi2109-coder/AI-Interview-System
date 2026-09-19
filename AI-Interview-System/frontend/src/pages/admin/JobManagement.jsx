import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JobManagement() {
  const navigate = useNavigate();

  const [jobs] = useState([
    {
      id: 1,
      title: "Data Scientist",
      department: "Data & Analytics",
      experience: "0-2 Years",
      status: "Active",
    },
  ]);

  const handleCreateJob = () => {
    navigate("/admin/jobs/create");
  };

  const handleEditJob = (jobId) => {
    navigate(`/admin/jobs/edit/${jobId}`);
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Job Management</h1>
          <p>
            Manage job descriptions and AI interview requirements
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

        {/* Page Introduction */}
        <section className="welcome-card">
          <h2>Jobs & Interview Requirements</h2>

          <p>
            Create and manage job roles, job descriptions,
            required skills, experience and AI interview
            configuration.
          </p>

          <button
            type="button"
            onClick={handleCreateJob}
          >
            + Create New Job
          </button>
        </section>

        {/* Job List */}
        <section className="dashboard-card">

          <div className="section-heading">
            <h2>Available Jobs</h2>

            <p>
              Configure the requirements used by the AI
              interview system.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="verification-notice">
              <strong>No jobs available</strong>

              <p>
                Create a job to start configuring an AI-powered
                interview.
              </p>
            </div>
          ) : (
            <div className="candidate-table-wrapper">

              <table className="candidate-table">

                <thead>
                  <tr>
                    <th>Job Role</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>

                      <td>
                        <strong>{job.title}</strong>
                      </td>

                      <td>
                        {job.department}
                      </td>

                      <td>
                        {job.experience}
                      </td>

                      <td>
                        <span className="status-badge">
                          {job.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleEditJob(job.id)}
                        >
                          Edit
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Configuration Areas */}
        <section>

          <div className="section-heading">
            <h2>Interview Configuration</h2>

            <p>
              Each job can have its own AI interview settings.
            </p>
          </div>

          <div className="dashboard-grid">

            <div className="dashboard-card">
              <h3>Job Requirements</h3>

              <p>
                Configure job description, required experience,
                education, certifications and proficiency.
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Required Skills</h3>

              <p>
                Define primary, secondary, technical and
                soft skills required for the role.
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Question Configuration</h3>

              <p>
                Configure question count, duration and
                difficulty levels.
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Assessment Weights</h3>

              <p>
                Configure technical, behavioral, scenario
                and communication percentages.
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Passing Score</h3>

              <p>
                Define the minimum score required for
                successful completion.
              </p>
            </div>

            <div className="dashboard-card">
              <h3>AI Interviewer</h3>

              <p>
                Configure interview language, personality
                and communication tone.
              </p>
            </div>

          </div>

        </section>

        {/* Backend Notice */}
        <section className="report-notice">

          <strong>Backend Integration Pending</strong>

          <p>
            Job records and interview configurations will be
            loaded and saved through the backend API once
            Divya's job-management endpoints are connected.
          </p>

        </section>

      </main>
    </div>
  );
}

export default JobManagement;