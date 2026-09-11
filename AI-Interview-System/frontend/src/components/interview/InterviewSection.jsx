function InterviewSection({ title, description, active = false }) {
  return (
    <div className={`interview-section ${active ? "active" : ""}`}>
      <div className="section-indicator"></div>

      <div className="section-content">
        <h3>{title}</h3>

        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default InterviewSection;