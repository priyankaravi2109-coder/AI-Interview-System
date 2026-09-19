import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuditLogs() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  // Temporary frontend data.
  // Later this will come from the backend audit-logs API.
  const auditLogs = [
    {
      id: 1,
      user: "Admin User",
      role: "Admin",
      action: "Admin Login",
      resource: "Authentication",
      details: "Admin successfully logged into the system.",
      date: "10 Sep 2026",
      time: "09:05 AM",
      status: "Success",
    },
    {
      id: 2,
      user: "Admin User",
      role: "Admin",
      action: "Job Created",
      resource: "Data Scientist Job",
      details: "Created a new job configuration for Data Scientist.",
      date: "10 Sep 2026",
      time: "09:15 AM",
      status: "Success",
    },
    {
      id: 3,
      user: "HR Manager",
      role: "HR",
      action: "Candidate Shortlisted",
      resource: "CAND001",
      details: "Candidate moved from Applied to Shortlisted.",
      date: "10 Sep 2026",
      time: "09:30 AM",
      status: "Success",
    },
    {
      id: 4,
      user: "Admin User",
      role: "Admin",
      action: "Interview Configuration Updated",
      resource: "INT001",
      details: "Updated question count, duration and assessment weights.",
      date: "10 Sep 2026",
      time: "09:45 AM",
      status: "Success",
    },
    {
      id: 5,
      user: "HR Manager",
      role: "HR",
      action: "Verification Log Viewed",
      resource: "INT002",
      details: "Viewed candidate verification and integrity events.",
      date: "10 Sep 2026",
      time: "10:10 AM",
      status: "Success",
    },
    {
      id: 6,
      user: "Admin User",
      role: "Admin",
      action: "Interview Report Viewed",
      resource: "INT001",
      details: "Viewed AI-generated interview evaluation report.",
      date: "10 Sep 2026",
      time: "10:20 AM",
      status: "Success",
    },
    {
      id: 7,
      user: "HR Manager",
      role: "HR",
      action: "Candidate Status Updated",
      resource: "CAND002",
      details: "Candidate moved to HR Review.",
      date: "10 Sep 2026",
      time: "10:40 AM",
      status: "Success",
    },
    {
      id: 8,
      user: "Admin User",
      role: "Admin",
      action: "Failed Login",
      resource: "Authentication",
      details: "Invalid login attempt detected.",
      date: "10 Sep 2026",
      time: "11:00 AM",
      status: "Failed",
    },
    {
      id: 9,
      user: "HR Manager",
      role: "HR",
      action: "Candidate Report Exported",
      resource: "CAND003",
      details: "Interview report export requested.",
      date: "10 Sep 2026",
      time: "11:25 AM",
      status: "Success",
    },
    {
      id: 10,
      user: "Admin User",
      role: "Admin",
      action: "Logout",
      resource: "Authentication",
      details: "Admin logged out of the system.",
      date: "10 Sep 2026",
      time: "12:00 PM",
      status: "Success",
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      log.action
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      log.resource
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      log.details
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === "All" ||
      log.action === actionFilter;

    const matchesRole =
      roleFilter === "All" ||
      log.role === roleFilter;

    return matchesSearch && matchesAction && matchesRole;
  });

  const totalLogs = auditLogs.length;

  const successfulActions = auditLogs.filter(
    (log) => log.status === "Success"
  ).length;

  const failedActions = auditLogs.filter(
    (log) => log.status === "Failed"
  ).length;

  const adminActions = auditLogs.filter(
    (log) => log.role === "Admin"
  ).length;

  const getStatusClass = (status) => {
    if (status === "Success") {
      return "status-badge status-success";
    }

    return "status-badge status-danger";
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Audit Logs</h1>

          <p>
            Track important administrative and HR activities
            across the interview system
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
            <h3>Total Activities</h3>
            <strong>{totalLogs}</strong>
          </div>

          <div className="stat-card">
            <h3>Successful</h3>
            <strong>{successfulActions}</strong>
          </div>

          <div className="stat-card">
            <h3>Failed</h3>
            <strong>{failedActions}</strong>
          </div>

          <div className="stat-card">
            <h3>Admin Activities</h3>
            <strong>{adminActions}</strong>
          </div>

        </section>

        {/* Security Information */}
        <section className="dashboard-card">

          <h2>Audit Activity</h2>

          <p>
            Audit logs provide a record of important actions
            performed by authorized Admin and HR users.
          </p>

          <p>
            These records can help with security monitoring,
            accountability, troubleshooting and compliance.
          </p>

        </section>

        {/* Filters */}
        <section className="dashboard-card">

          <h2>Search Audit Logs</h2>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="auditSearch">
                Search
              </label>

              <input
                id="auditSearch"
                type="text"
                placeholder="User, action, resource or details"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label htmlFor="roleFilter">
                User Role
              </label>

              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
              >

                <option value="All">
                  All Roles
                </option>

                <option value="Admin">
                  Admin
                </option>

                <option value="HR">
                  HR
                </option>

              </select>

            </div>

            <div className="form-group">

              <label htmlFor="actionFilter">
                Action Type
              </label>

              <select
                id="actionFilter"
                value={actionFilter}
                onChange={(event) =>
                  setActionFilter(event.target.value)
                }
              >

                <option value="All">
                  All Actions
                </option>

                <option value="Admin Login">
                  Admin Login
                </option>

                <option value="Failed Login">
                  Failed Login
                </option>

                <option value="Job Created">
                  Job Created
                </option>

                <option value="Candidate Shortlisted">
                  Candidate Shortlisted
                </option>

                <option value="Interview Configuration Updated">
                  Interview Configuration Updated
                </option>

                <option value="Verification Log Viewed">
                  Verification Log Viewed
                </option>

                <option value="Interview Report Viewed">
                  Interview Report Viewed
                </option>

                <option value="Candidate Status Updated">
                  Candidate Status Updated
                </option>

                <option value="Candidate Report Exported">
                  Candidate Report Exported
                </option>

                <option value="Logout">
                  Logout
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* Audit Table */}
        <section className="dashboard-card">

          <h2>Activity History</h2>

          <div className="table-container">

            <table className="dashboard-table">

              <thead>

                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>

              </thead>

              <tbody>

                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>

                      <td>
                        <strong>
                          {log.user}
                        </strong>
                      </td>

                      <td>
                        {log.role}
                      </td>

                      <td>
                        {log.action}
                      </td>

                      <td>
                        {log.resource}
                      </td>

                      <td>
                        {log.date}
                      </td>

                      <td>
                        {log.time}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            log.status
                          )}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td>
                        {log.details}
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
                      No audit activities found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* What Should Be Audited */}
        <section className="dashboard-card">

          <h2>Important Activities to Audit</h2>

          <div className="form-grid">

            <div>
              <strong>Authentication</strong>

              <p>
                Login, logout and failed authentication
                attempts.
              </p>
            </div>

            <div>
              <strong>Job Management</strong>

              <p>
                Job creation, modification and configuration
                changes.
              </p>
            </div>

            <div>
              <strong>Candidate Management</strong>

              <p>
                Candidate status changes and important profile
                actions.
              </p>
            </div>

            <div>
              <strong>Interview Configuration</strong>

              <p>
                Changes to interview questions, duration,
                difficulty and scoring configuration.
              </p>
            </div>

            <div>
              <strong>Verification</strong>

              <p>
                Access to candidate identity and verification
                events.
              </p>
            </div>

            <div>
              <strong>Reports</strong>

              <p>
                Viewing and exporting interview evaluation
                reports.
              </p>
            </div>

          </div>

        </section>

        {/* Security Notice */}
        <section className="report-notice">

          <strong>
            Security & Accountability
          </strong>

          <p>
            Audit logs should be securely stored and protected
            from unauthorized modification. Access should be
            restricted according to the user's role and
            permissions.
          </p>

        </section>

        {/* Backend Notice */}
        <section className="report-notice">

          <strong>
            Backend Integration Pending
          </strong>

          <p>
            The current audit records are temporary frontend
            data. Later, these records will be loaded from the
            backend audit-log service and database.
          </p>

        </section>

      </main>
    </div>
  );
}

export default AuditLogs;