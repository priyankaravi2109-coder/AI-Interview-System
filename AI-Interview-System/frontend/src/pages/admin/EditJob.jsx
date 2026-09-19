import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [formData, setFormData] = useState({
    role: "Data Scientist",
    department: "Data & Analytics",
    jobDescription:
      "Develop data-driven solutions using statistical analysis, machine learning and data visualization.",
    requiredExperience: "0-2 Years",
    education: "BCA / B.Tech / MCA",
    certifications: "AWS, Azure, Python",
    primarySkills: "Python, Machine Learning, SQL",
    secondarySkills: "Pandas, NumPy, Power BI",
    technicalSkills: "Python, SQL, APIs, Git",
    softSkills: "Communication, Teamwork, Problem Solving",
    proficiency: "Intermediate",

    questionCount: 20,
    duration: 30,
    difficulty: "Intermediate",

    technicalWeight: 60,
    behavioralWeight: 20,
    scenarioWeight: 10,
    communicationWeight: 10,

    passingScore: 60,
    language: "English",
    personality: "Professional",
    tone: "Friendly and Professional",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.role.trim()) {
      setErrorMessage("Please enter the job role.");
      return;
    }

    if (!formData.jobDescription.trim()) {
      setErrorMessage("Please enter the job description.");
      return;
    }

    if (!formData.primarySkills.trim()) {
      setErrorMessage("Please enter the primary skills.");
      return;
    }

    const totalWeight =
      Number(formData.technicalWeight) +
      Number(formData.behavioralWeight) +
      Number(formData.scenarioWeight) +
      Number(formData.communicationWeight);

    if (totalWeight !== 100) {
      setErrorMessage(
        `Assessment weights must total 100%. Current total: ${totalWeight}%.`
      );
      return;
    }

    console.log("Updated Job ID:", jobId);
    console.log("Updated Job Configuration:", formData);

    setSuccessMessage(
      "Job configuration updated successfully on the frontend. Backend integration is pending."
    );
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Edit Job</h1>
          <p>
            Update job requirements and AI interview settings
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/jobs")}
        >
          Back to Jobs
        </button>
      </header>

      <main className="dashboard-content">

        <form onSubmit={handleSubmit}>

          {/* Job Information */}
          <section className="dashboard-card">

            <h2>Job Information</h2>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="role">
                  Job Role *
                </label>

                <input
                  id="role"
                  name="role"
                  type="text"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  Department
                </label>

                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="jobDescription">
                Job Description *
              </label>

              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

          </section>

          {/* Job Requirements */}
          <section className="dashboard-card">

            <h2>Job Requirements</h2>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="requiredExperience">
                  Required Experience
                </label>

                <input
                  id="requiredExperience"
                  name="requiredExperience"
                  type="text"
                  value={formData.requiredExperience}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">
                  Education
                </label>

                <input
                  id="education"
                  name="education"
                  type="text"
                  value={formData.education}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="certifications">
                  Certifications
                </label>

                <input
                  id="certifications"
                  name="certifications"
                  type="text"
                  value={formData.certifications}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="proficiency">
                  Required Proficiency
                </label>

                <select
                  id="proficiency"
                  name="proficiency"
                  value={formData.proficiency}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">
                    Intermediate
                  </option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

            </div>

          </section>

          {/* Skills */}
          <section className="dashboard-card">

            <h2>Required Skills</h2>

            <p>
              Enter skills separated by commas.
            </p>

            <div className="form-group">
              <label htmlFor="primarySkills">
                Primary Skills *
              </label>

              <textarea
                id="primarySkills"
                name="primarySkills"
                value={formData.primarySkills}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="secondarySkills">
                Secondary Skills
              </label>

              <textarea
                id="secondarySkills"
                name="secondarySkills"
                value={formData.secondarySkills}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="technicalSkills">
                Technical Skills
              </label>

              <textarea
                id="technicalSkills"
                name="technicalSkills"
                value={formData.technicalSkills}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="softSkills">
                Soft Skills
              </label>

              <textarea
                id="softSkills"
                name="softSkills"
                value={formData.softSkills}
                onChange={handleChange}
                rows={3}
              />
            </div>

          </section>

          {/* Interview Configuration */}
          <section className="dashboard-card">

            <h2>Interview Configuration</h2>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="questionCount">
                  Question Count
                </label>

                <input
                  id="questionCount"
                  name="questionCount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.questionCount}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">
                  Duration (minutes)
                </label>

                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="5"
                  max="180"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">
                  Difficulty
                </label>

                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">
                    Intermediate
                  </option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="passingScore">
                  Passing Score (%)
                </label>

                <input
                  id="passingScore"
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={handleChange}
                />
              </div>

            </div>

          </section>

          {/* Assessment Weights */}
          <section className="dashboard-card">

            <h2>Assessment Weights</h2>

            <p>
              All assessment percentages must total 100%.
            </p>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="technicalWeight">
                  Technical (%)
                </label>

                <input
                  id="technicalWeight"
                  name="technicalWeight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.technicalWeight}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="behavioralWeight">
                  Behavioral (%)
                </label>

                <input
                  id="behavioralWeight"
                  name="behavioralWeight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.behavioralWeight}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="scenarioWeight">
                  Scenario (%)
                </label>

                <input
                  id="scenarioWeight"
                  name="scenarioWeight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scenarioWeight}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="communicationWeight">
                  Communication (%)
                </label>

                <input
                  id="communicationWeight"
                  name="communicationWeight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.communicationWeight}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="verification-info">
              <strong>
                Current Total:{" "}
                {Number(formData.technicalWeight) +
                  Number(formData.behavioralWeight) +
                  Number(formData.scenarioWeight) +
                  Number(formData.communicationWeight)}
                %
              </strong>
            </div>

          </section>

          {/* AI Interviewer */}
          <section className="dashboard-card">

            <h2>AI Interviewer Configuration</h2>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="language">
                  Interview Language
                </label>

                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="personality">
                  AI Personality
                </label>

                <select
                  id="personality"
                  name="personality"
                  value={formData.personality}
                  onChange={handleChange}
                >
                  <option value="Professional">
                    Professional
                  </option>

                  <option value="Friendly">
                    Friendly
                  </option>

                  <option value="Supportive">
                    Supportive
                  </option>

                  <option value="Formal">
                    Formal
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tone">
                  AI Interviewer Tone
                </label>

                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                >
                  <option value="Friendly and Professional">
                    Friendly and Professional
                  </option>

                  <option value="Formal and Direct">
                    Formal and Direct
                  </option>

                  <option value="Supportive and Encouraging">
                    Supportive and Encouraging
                  </option>

                  <option value="Professional and Neutral">
                    Professional and Neutral
                  </option>
                </select>
              </div>

            </div>

          </section>

          {/* Messages */}
          {errorMessage && (
            <div className="verification-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="verification-success">
              {successMessage}
            </div>
          )}

          {/* Actions */}
          <section className="dashboard-card">

            <div className="dashboard-header-actions">

              <button
                type="button"
                onClick={() => navigate("/admin/jobs")}
              >
                Cancel
              </button>

              <button type="submit">
                Save Changes
              </button>

            </div>

          </section>

        </form>

      </main>
    </div>
  );
}

export default EditJob;