import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import candidateService from "../../services/candidateService";

function CandidateProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    experience: "",
    education: "",
    certifications: [],
    primarySkills: [],
    secondarySkills: [],
    technicalSkills: [],
    softSkills: [],
    skillProficiency: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await candidateService.getProfile();

        const candidate =
          data.candidate || data.user || data;

        setProfile({
          name: candidate?.name || user?.name || "",
          email: candidate?.email || user?.email || "",
          role: candidate?.role || "",
          experience: candidate?.experience || "",
          education: candidate?.education || "",
          certifications:
            candidate?.certifications || [],
          primarySkills:
            candidate?.primarySkills || [],
          secondarySkills:
            candidate?.secondarySkills || [],
          technicalSkills:
            candidate?.technicalSkills || [],
          softSkills:
            candidate?.softSkills || [],
          skillProficiency:
            candidate?.skillProficiency || {},
        });
      } catch (err) {
        console.error("Failed to load profile:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load candidate profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const renderSkills = (skills) => {
    if (!skills || skills.length === 0) {
      return (
        <span className="profile-empty">
          Not specified
        </span>
      );
    }

    return skills.map((skill, index) => (
      <span
        className="profile-skill"
        key={`${skill}-${index}`}
      >
        {skill}
      </span>
    ));
  };

  const getProficiency = (skill) => {
    if (!profile.skillProficiency) {
      return "Not specified";
    }

    if (typeof profile.skillProficiency === "object") {
      return (
        profile.skillProficiency[skill] ||
        "Not specified"
      );
    }

    return "Not specified";
  };

  const allSkills = [
    ...profile.primarySkills,
    ...profile.secondarySkills,
    ...profile.technicalSkills,
    ...profile.softSkills,
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <div className="dashboard-card">
            <h2>Loading Profile...</h2>
            <p>Please wait while your profile is loaded.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <div className="dashboard-card">
            <h2>Candidate Profile</h2>

            <p>{error}</p>

            <button
              onClick={() =>
                navigate("/candidate/dashboard")
              }
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>Candidate Profile</h1>

          <p>
            Your profile, skills and qualifications used
            for AI interview assessment
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/candidate/dashboard")
          }
        >
          Back to Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        {/* Personal Information */}

        <section className="profile-card">
          <h2>Personal Information</h2>

          <div className="profile-grid">

            <div>
              <label>Full Name</label>

              <strong>
                {profile.name || "Not specified"}
              </strong>
            </div>

            <div>
              <label>Email</label>

              <strong>
                {profile.email || "Not specified"}
              </strong>
            </div>

            <div>
              <label>Job Role</label>

              <strong>
                {profile.role || "Not specified"}
              </strong>
            </div>

            <div>
              <label>Experience</label>

              <strong>
                {profile.experience || "Not specified"}
              </strong>
            </div>

            <div>
              <label>Education</label>

              <strong>
                {profile.education || "Not specified"}
              </strong>
            </div>

          </div>
        </section>

        {/* Primary Skills */}

        <section className="profile-card">
          <h2>Primary Skills</h2>

          <p className="profile-description">
            Core skills that represent the candidate's
            primary technical or professional strengths.
          </p>

          <div className="profile-skills">
            {renderSkills(profile.primarySkills)}
          </div>
        </section>

        {/* Secondary Skills */}

        <section className="profile-card">
          <h2>Secondary Skills</h2>

          <p className="profile-description">
            Additional skills that support the candidate's
            primary skill set.
          </p>

          <div className="profile-skills">
            {renderSkills(profile.secondarySkills)}
          </div>
        </section>

        {/* Technical Skills */}

        <section className="profile-card">
          <h2>Technical Skills</h2>

          <p className="profile-description">
            Technologies, programming languages, frameworks,
            databases and technical tools.
          </p>

          <div className="profile-skills">
            {renderSkills(profile.technicalSkills)}
          </div>
        </section>

        {/* Soft Skills */}

        <section className="profile-card">
          <h2>Soft Skills</h2>

          <p className="profile-description">
            Communication, teamwork, leadership, problem
            solving and other professional skills.
          </p>

          <div className="profile-skills">
            {renderSkills(profile.softSkills)}
          </div>
        </section>

        {/* Skill Proficiency */}

        <section className="profile-card">
          <h2>Skill Proficiency</h2>

          <p className="profile-description">
            Proficiency levels can be used by the AI to
            determine appropriate interview difficulty.
          </p>

          {allSkills.length === 0 ? (
            <p className="profile-empty">
              No skills available.
            </p>
          ) : (
            <div className="proficiency-list">
              {allSkills.map((skill, index) => (
                <div
                  className="proficiency-row"
                  key={`${skill}-${index}`}
                >
                  <strong>{skill}</strong>

                  <span>
                    {getProficiency(skill)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certifications */}

        <section className="profile-card">
          <h2>Certifications</h2>

          <p className="profile-description">
            Professional certifications relevant to the
            candidate's role and skills.
          </p>

          <div className="profile-skills">
            {renderSkills(profile.certifications)}
          </div>
        </section>

      </main>
    </div>
  );
}

export default CandidateProfile;