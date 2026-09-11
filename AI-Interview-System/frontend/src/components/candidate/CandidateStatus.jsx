function CandidateStatus({ status }) {
  const statusLabels = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    interview_scheduled: "AI Interview Scheduled",
    identity_verified: "Identity Verified",
    interview_completed: "AI Interview Completed",
    ai_evaluation: "AI Evaluation",
    hr_review: "HR Review",
    selected: "Selected",
    rejected: "Rejected",
    on_hold: "On Hold",
  };

  const label = statusLabels[status] || "Status Not Available";

  return (
    <div className={`candidate-status status-${status || "unknown"}`}>
      <span className="status-dot"></span>
      <span>{label}</span>
    </div>
  );
}

export default CandidateStatus;