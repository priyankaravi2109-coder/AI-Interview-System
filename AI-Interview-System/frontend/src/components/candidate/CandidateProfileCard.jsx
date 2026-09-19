function CandidateProfileCard({ candidate }) {
  if (!candidate) {
    return (
      <div className="candidate-profile-card">
        <h3>Candidate Profile</h3>
        <p>No candidate information available.</p>
      </div>
    );
  }

  return (
    <div className="candidate-profile-card">
      <div className="candidate-profile-header">
        <div className="candidate-avatar">
          {candidate.name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <div>
          <h2>{candidate.name || "Candidate"}</h2>
          <p>{candidate.email || "No email available"}</p>
        </div>
      </div>

      <div className="candidate-profile-details">
        <div>
          <span>Role</span>
          <strong>{candidate.role || "Not specified"}</strong>
        </div>

        <div>
          <span>Experience</span>
          <strong>
            {candidate.experience
              ? `${candidate.experience} years`
              : "Not specified"}
          </strong>
        </div>

        <div>
          <span>Education</span>
          <strong>{candidate.education || "Not specified"}</strong>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfileCard;