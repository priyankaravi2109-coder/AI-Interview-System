import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerificationLogs() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Temporary frontend data.
  // This will later come from the backend verification-events API.
  const verificationEvents = [
    {
      id: 1,
      candidate: "Priyanka Ravi",
      candidateId: "CAND001",
      interviewId: "INT001",
      event: "Verification Started",
      status: "Success",
      date: "10 Sep 2026",
      time: "10:05 AM",
      details: "Candidate verification process started.",
    },
    {
      id: 2,
      candidate: "Priyanka Ravi",
      candidateId: "CAND001",
      interviewId: "INT001",
      event: "Camera Permission",
      status: "Success",
      date: "10 Sep 2026",
      time: "10:06 AM",
      details: "Camera permission granted by candidate.",
    },
    {
      id: 3,
      candidate: "Priyanka Ravi",
      candidateId: "CAND001",
      interviewId: "INT001",
      event: "Initial Face Verification",
      status: "Success",
      date: "10 Sep 2026",
      time: "10:07 AM",
      details: "Live face successfully matched with registered profile photo.",
    },
    {
      id: 4,
      candidate: "Rahul Kumar",
      candidateId: "CAND002",
      interviewId: "INT002",
      event: "Face Not Detected",
      status: "Warning",
      date: "10 Sep 2026",
      time: "10:22 AM",
      details: "Candidate face was temporarily not detected.",
    },
    {
      id: 5,
      candidate: "Rahul Kumar",
      candidateId: "CAND002",
      interviewId: "INT002",
      event: "Multiple Faces",
      status: "Flagged",
      date: "10 Sep 2026",
      time: "10:25 AM",
      details: "More than one face was detected in the camera frame.",
    },
    {
      id: 6,
      candidate: "Rahul Kumar",
      candidateId: "CAND002",
      interviewId: "INT002",
      event: "Candidate Absent",
      status: "Flagged",
      date: "10 Sep 2026",
      time: "10:27 AM",
      details: "Candidate was not detected for the required monitoring period.",
    },
    {
      id: 7,
      candidate: "Ananya Sharma",
      candidateId: "CAND003",
      interviewId: "INT003",
      event: "Verification Failed",
      status: "Failed",
      date: "10 Sep 2026",
      time: "11:10 AM",
      details: "Live face could not be verified against the registered photo.",
    },
    {
      id: 8,
      candidate: "Ananya Sharma",
      candidateId: "CAND003",
      interviewId: "INT003",
      event: "Verification Retry",
      status: "Success",
      date: "10 Sep 2026",
      time: "11:13 AM",
      details: "Candidate retried face verification successfully.",
    },
    {
      id: 9,
      candidate: "Arun Prakash",
      candidateId: "CAND004",
      interviewId: "INT004",
      event: "Tab Switch",
      status: "Flagged",
      date: "10 Sep 2026",
      time: "11:40 AM",
      details: "Candidate moved away from the interview browser tab.",
    },
    {
      id: 10,
      candidate: "Arun Prakash",
      candidateId: "CAND004",
      interviewId: "INT004",
      event: "Verification Completed",
      status: "Success",
      date: "10 Sep 2026",
      time: "12:05 PM",
      details: "Verification and interview integrity monitoring completed.",
    },
  ];

  const filteredEvents = verificationEvents.filter((event) => {
    const matchesSearch =
      event.candidate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      event.candidateId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      event.interviewId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesEvent =
      eventFilter === "All" ||
      event.event === eventFilter;

    const matchesStatus =
      statusFilter === "All" ||
      event.status === statusFilter;

    return matchesSearch && matchesEvent && matchesStatus;
  });

  const totalEvents = verificationEvents.length;

  const successfulEvents = verificationEvents.filter(
    (event) => event.status === "Success"
  ).length;

  const flaggedEvents = verificationEvents.filter(
    (event) => event.status === "Flagged"
  ).length;

  const failedEvents = verificationEvents.filter(
    (event) => event.status === "Failed"
  ).length;

  const getStatusClass = (status) => {
    if (status === "Success") {
      return "status-badge status-success";
    }

    if (status === "Warning") {
      return "status-badge status-warning";
    }

    if (status === "Flagged") {
      return "status-badge status-danger";
    }

    if (status === "Failed") {
      return "status-badge status-danger";
    }

    return "status-badge";
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Verification Logs</h1>

          <p>
            Monitor candidate identity verification and
            interview integrity events
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
            <h3>Total Events</h3>
            <strong>{totalEvents}</strong>
          </div>

          <div className="stat-card">
            <h3>Successful</h3>
            <strong>{successfulEvents}</strong>
          </div>

          <div className="stat-card">
            <h3>Flagged</h3>
            <strong>{flaggedEvents}</strong>
          </div>

          <div className="stat-card">
            <h3>Failed</h3>
            <strong>{failedEvents}</strong>
          </div>

        </section>

        {/* Information */}
        <section className="dashboard-card">

          <h2>Verification Monitoring</h2>

          <p>
            These logs record important verification and
            interview integrity events for authorized HR and
            Admin users.
          </p>

          <p>
            A single warning or integrity event should not
            automatically reject a candidate. Flagged events
            should be reviewed by an authorized human reviewer.
          </p>

        </section>

        {/* Filters */}
        <section className="dashboard-card">

          <div className="dashboard-header">

            <div>
              <h2>Verification Events</h2>
              <p>
                Search and filter verification activity.
              </p>
            </div>

          </div>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="verificationSearch">
                Search Candidate
              </label>

              <input
                id="verificationSearch"
                type="text"
                placeholder="Name, candidate ID or interview ID"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label htmlFor="eventFilter">
                Event Type
              </label>

              <select
                id="eventFilter"
                value={eventFilter}
                onChange={(event) =>
                  setEventFilter(event.target.value)
                }
              >

                <option value="All">
                  All Events
                </option>

                <option value="Verification Started">
                  Verification Started
                </option>

                <option value="Camera Permission">
                  Camera Permission
                </option>

                <option value="Initial Face Verification">
                  Initial Face Verification
                </option>

                <option value="Verification Failed">
                  Verification Failed
                </option>

                <option value="Face Not Detected">
                  Face Not Detected
                </option>

                <option value="Multiple Faces">
                  Multiple Faces
                </option>

                <option value="Candidate Absent">
                  Candidate Absent
                </option>

                <option value="Tab Switch">
                  Tab Switch
                </option>

                <option value="Verification Retry">
                  Verification Retry
                </option>

                <option value="Verification Completed">
                  Verification Completed
                </option>

              </select>

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

                <option value="All">
                  All Statuses
                </option>

                <option value="Success">
                  Success
                </option>

                <option value="Warning">
                  Warning
                </option>

                <option value="Flagged">
                  Flagged
                </option>

                <option value="Failed">
                  Failed
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* Event Table */}
        <section className="dashboard-card">

          <div className="table-container">

            <table className="dashboard-table">

              <thead>

                <tr>
                  <th>Candidate</th>
                  <th>Interview ID</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Details</th>
                </tr>

              </thead>

              <tbody>

                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr key={event.id}>

                      <td>
                        <strong>
                          {event.candidate}
                        </strong>

                        <br />

                        <small>
                          {event.candidateId}
                        </small>
                      </td>

                      <td>
                        {event.interviewId}
                      </td>

                      <td>
                        {event.event}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            event.status
                          )}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td>
                        {event.date}
                      </td>

                      <td>
                        {event.time}
                      </td>

                      <td>
                        {event.details}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No verification events found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Event Types */}
        <section className="dashboard-card">

          <h2>Events Monitored</h2>

          <div className="form-grid">

            <div>
              <strong>
                Identity Verification
              </strong>

              <p>
                Verification started, camera permission,
                face verification success or failure.
              </p>
            </div>

            <div>
              <strong>
                Face Presence
              </strong>

              <p>
                Face not detected, candidate absent and
                multiple-face events.
              </p>
            </div>

            <div>
              <strong>
                Interview Integrity
              </strong>

              <p>
                Tab switching, interruptions and other
                suspicious events.
              </p>
            </div>

            <div>
              <strong>
                Verification Completion
              </strong>

              <p>
                Records the final completion of the
                verification process.
              </p>
            </div>

          </div>

        </section>

        {/* Privacy */}
        <section className="report-notice">

          <strong>
            Privacy & Security
          </strong>

          <p>
            Verification information should be accessible only
            to authorized HR/Admin users. Face images should be
            minimized, securely handled and retained only
            according to the configured privacy and retention
            policy.
          </p>

        </section>

        {/* Backend Notice */}
        <section className="report-notice">

          <strong>
            Backend Integration Pending
          </strong>

          <p>
            The current events are frontend sample data.
            Later, this page will receive real verification
            events from the backend verification API and
            database.
          </p>

        </section>

      </main>
    </div>
  );
}

export default VerificationLogs;