function SkillList({ skills = [] }) {
  return (
    <div className="skill-list">
      <h3>Skills</h3>

      {skills.length === 0 ? (
        <p className="no-skills">No skills added yet.</p>
      ) : (
        <div className="skill-items">
          {skills.map((skill, index) => (
            <span className="skill-item" key={skill.id || index}>
              {skill.name || skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default SkillList;