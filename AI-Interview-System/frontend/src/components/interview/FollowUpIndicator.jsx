function FollowUpIndicator({ isFollowUp = false }) {
  if (!isFollowUp) {
    return null;
  }

  return (
    <div className="follow-up-indicator">
      <span>Follow-up Question</span>
    </div>
  );
}

export default FollowUpIndicator;