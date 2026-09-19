import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewConfiguration() {
  const navigate = useNavigate();

  const [configuration, setConfiguration] = useState({
    questionCount: 20,
    duration: 30,

    difficulty: "Intermediate",

    technicalPercentage: 60,
    behavioralPercentage: 20,
    scenarioPercentage: 10,
    communicationPercentage: 10,

    passingScore: 60,

    language: "English",

    personality: "Professional",
    tone: "Friendly and Professional",

    enableFollowUp: true,
    enableAdaptiveDifficulty: true,
    enableVoiceInterview: false,
    enableFacePresenceMonitoring: true,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setConfiguration((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const totalPercentage =
    Number(configuration.technicalPercentage) +
    Number(configuration.behavioralPercentage) +
    Number(configuration.scenarioPercentage) +
    Number(configuration.communicationPercentage);

  const handleSave = (event) => {
    event.preventDefault();

    if (totalPercentage !== 100) {
      setErrorMessage(
        `Assessment percentages must total 100%. Current total: ${totalPercentage}%.`
      );
      return;
    }

    if (
      configuration.questionCount < 1 ||
      configuration.questionCount > 100
    ) {
      setErrorMessage(
        "Question count must be between 1 and 100."
      );
      return;
    }

    if (
      configuration.duration < 5 ||
      configuration.duration > 180
    ) {
      setErrorMessage(
        "Interview duration must be between 5 and 180 minutes."
      );
      return;
    }

    if (
      configuration.passingScore < 0 ||
      configuration.passingScore > 100
    ) {
      setErrorMessage(
        "Passing score must be between 0 and 100."
      );
      return;
    }

    console.log(
      "Interview Configuration:",
      configuration
    );

    setSuccessMessage(
      "Interview configuration saved successfully on the frontend. Backend integration is pending."
    );
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Interview Configuration</h1>

          <p>
            Configure the AI-powered interview and assessment
            settings
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

        <form onSubmit={handleSave}>

          {/* Basic Interview Settings */}
          <section className="dashboard-card">

            <h2>Basic Interview Settings</h2>

            <p>
              Configure the number of questions and total
              interview duration.
            </p>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="questionCount">
                  Number of Questions
                </label>

                <input
                  id="questionCount"
                  name="questionCount"
                  type="number"
                  min="1"
                  max="100"
                  value={configuration.questionCount}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="duration">
                  Interview Duration (minutes)
                </label>

                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="5"
                  max="180"
                  value={configuration.duration}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="difficulty">
                  Starting Difficulty
                </label>

                <select
                  id="difficulty"
                  name="difficulty"
                  value={configuration.difficulty}
                  onChange={handleChange}
                >

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>

                  <option value="Expert">
                    Expert
                  </option>

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
                  value={configuration.passingScore}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* Assessment Distribution */}
          <section className="dashboard-card">

            <h2>Assessment Distribution</h2>

            <p>
              Set the percentage contribution of each assessment
              category. The total must equal 100%.
            </p>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="technicalPercentage">
                  Technical (%)
                </label>

                <input
                  id="technicalPercentage"
                  name="technicalPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={configuration.technicalPercentage}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="behavioralPercentage">
                  Behavioral (%)
                </label>

                <input
                  id="behavioralPercentage"
                  name="behavioralPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={configuration.behavioralPercentage}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="scenarioPercentage">
                  Scenario (%)
                </label>

                <input
                  id="scenarioPercentage"
                  name="scenarioPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={configuration.scenarioPercentage}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="communicationPercentage">
                  Communication (%)
                </label>

                <input
                  id="communicationPercentage"
                  name="communicationPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={configuration.communicationPercentage}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="verification-info">

              <strong>
                Total: {totalPercentage}%
              </strong>

              {totalPercentage === 100 ? (
                <p>
                  Assessment distribution is valid.
                </p>
              ) : (
                <p>
                  Adjust the percentages so that the total
                  equals 100%.
                </p>
              )}

            </div>

          </section>

          {/* AI Interview Settings */}
          <section className="dashboard-card">

            <h2>AI Interviewer Settings</h2>

            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="language">
                  Interview Language
                </label>

                <select
                  id="language"
                  name="language"
                  value={configuration.language}
                  onChange={handleChange}
                >

                  <option value="English">
                    English
                  </option>

                  <option value="Tamil">
                    Tamil
                  </option>

                  <option value="Hindi">
                    Hindi
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label htmlFor="personality">
                  AI Personality
                </label>

                <select
                  id="personality"
                  name="personality"
                  value={configuration.personality}
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
                  value={configuration.tone}
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

          {/* Adaptive Interview */}
          <section className="dashboard-card">

            <h2>Adaptive Interview Features</h2>

            <p>
              These options allow the interview to respond to
              the candidate's previous performance.
            </p>

            <div className="settings-list">

              <label className="setting-row">

                <input
                  type="checkbox"
                  name="enableFollowUp"
                  checked={configuration.enableFollowUp}
                  onChange={handleChange}
                />

                <span>
                  <strong>
                    Enable Follow-up Questions
                  </strong>

                  <small>
                    Generate follow-up questions based on the
                    candidate's previous answer.
                  </small>
                </span>

              </label>

              <label className="setting-row">

                <input
                  type="checkbox"
                  name="enableAdaptiveDifficulty"
                  checked={
                    configuration.enableAdaptiveDifficulty
                  }
                  onChange={handleChange}
                />

                <span>
                  <strong>
                    Enable Adaptive Difficulty
                  </strong>

                  <small>
                    Adjust question difficulty according to
                    candidate performance.
                  </small>
                </span>

              </label>

            </div>

          </section>

          {/* Verification and Integrity */}
          <section className="dashboard-card">

            <h2>Verification & Integrity</h2>

            <p>
              Configure candidate presence monitoring during
              the interview.
            </p>

            <div className="settings-list">

              <label className="setting-row">

                <input
                  type="checkbox"
                  name="enableFacePresenceMonitoring"
                  checked={
                    configuration.enableFacePresenceMonitoring
                  }
                  onChange={handleChange}
                />

                <span>
                  <strong>
                    Face Presence Monitoring
                  </strong>

                  <small>
                    Monitor whether the candidate remains
                    present during the interview.
                  </small>
                </span>

              </label>

            </div>

            <div className="verification-info">

              <strong>
                Privacy Notice
              </strong>

              <p>
                Face verification and integrity events should
                be handled securely and should be available
                only to authorized HR/Admin users.
              </p>

            </div>

          </section>

          {/* Optional Voice Interview */}
          <section className="dashboard-card">

            <h2>Voice Interview</h2>

            <p>
              Voice-based interviewing can use speech-to-text
              and text-to-speech services when enabled.
            </p>

            <label className="setting-row">

              <input
                type="checkbox"
                name="enableVoiceInterview"
                checked={configuration.enableVoiceInterview}
                onChange={handleChange}
              />

              <span>
                <strong>
                  Enable Voice Interview
                </strong>

                <small>
                  Allow the AI interviewer to communicate using
                  microphone input and AI-generated voice.
                </small>
              </span>

            </label>

          </section>

          {/* Error / Success */}
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
                onClick={() => navigate("/admin/dashboard")}
              >
                Cancel
              </button>

              <button type="submit">
                Save Configuration
              </button>

            </div>

          </section>

        </form>

        {/* Backend Notice */}
        <section className="report-notice">

          <strong>Backend Integration Pending</strong>

          <p>
            These settings will later be loaded from and saved
            to the backend interview configuration API.
          </p>

        </section>

      </main>
    </div>
  );
}

export default InterviewConfiguration;