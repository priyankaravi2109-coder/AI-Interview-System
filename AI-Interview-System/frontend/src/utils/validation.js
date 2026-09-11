
// Email validation
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
};


// Required field validation
export const isRequired = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
};


// Password validation
export const isValidPassword = (password) => {
  if (!password || typeof password !== "string") {
    return false;
  }

  return password.length >= 6;
};


// Candidate name validation
export const isValidName = (name) => {
  if (!name || typeof name !== "string") {
    return false;
  }

  return (
    name.trim().length >= 2 &&
    /^[a-zA-Z\s.'-]+$/.test(name.trim())
  );
};


// Experience validation
export const isValidExperience = (experience) => {
  if (
    experience === null ||
    experience === undefined ||
    experience === ""
  ) {
    return false;
  }

  const value = Number(experience);

  return (
    !Number.isNaN(value) &&
    value >= 0 &&
    value <= 60
  );
};


// Skill validation
export const isValidSkillList = (skills) => {
  if (!Array.isArray(skills)) {
    return false;
  }

  return skills.every(
    (skill) =>
      typeof skill === "string" &&
      skill.trim().length > 0
  );
};


// Job requirement validation
export const validateJobRequirements = (job) => {
  const errors = {};

  if (!isRequired(job?.title)) {
    errors.title = "Job title is required.";
  }

  if (!isRequired(job?.description)) {
    errors.description =
      "Job description is required.";
  }

  if (
    !Array.isArray(job?.requiredSkills) ||
    job.requiredSkills.length === 0
  ) {
    errors.requiredSkills =
      "At least one required skill is needed.";
  }

  if (
    job?.requiredExperience !== undefined &&
    !isValidExperience(job.requiredExperience)
  ) {
    errors.requiredExperience =
      "Enter a valid required experience.";
  }

  return errors;
};


// Candidate profile validation
export const validateCandidateProfile = (
  profile
) => {
  const errors = {};

  if (!isValidName(profile?.name)) {
    errors.name =
      "Enter a valid candidate name.";
  }

  if (!isValidEmail(profile?.email)) {
    errors.email =
      "Enter a valid email address.";
  }

  if (
    profile?.experience !== undefined &&
    profile?.experience !== "" &&
    !isValidExperience(profile.experience)
  ) {
    errors.experience =
      "Enter valid experience.";
  }

  if (
    profile?.primarySkills !== undefined &&
    !isValidSkillList(profile.primarySkills)
  ) {
    errors.primarySkills =
      "Enter valid primary skills.";
  }

  if (
    profile?.secondarySkills !== undefined &&
    !isValidSkillList(profile.secondarySkills)
  ) {
    errors.secondarySkills =
      "Enter valid secondary skills.";
  }

  if (
    profile?.technicalSkills !== undefined &&
    !isValidSkillList(profile.technicalSkills)
  ) {
    errors.technicalSkills =
      "Enter valid technical skills.";
  }

  if (
    profile?.softSkills !== undefined &&
    !isValidSkillList(profile.softSkills)
  ) {
    errors.softSkills =
      "Enter valid soft skills.";
  }

  return errors;
};


// Interview configuration validation
export const validateInterviewConfiguration = (
  config
) => {
  const errors = {};

  const questionCount = Number(
    config?.questionCount
  );

  const duration = Number(
    config?.duration
  );

  const passingScore = Number(
    config?.passingScore
  );

  if (
    Number.isNaN(questionCount) ||
    questionCount < 1
  ) {
    errors.questionCount =
      "Question count must be at least 1.";
  }

  if (
    Number.isNaN(duration) ||
    duration < 1
  ) {
    errors.duration =
      "Interview duration must be at least 1 minute.";
  }

  if (
    Number.isNaN(passingScore) ||
    passingScore < 0 ||
    passingScore > 100
  ) {
    errors.passingScore =
      "Passing score must be between 0 and 100.";
  }

  const technical =
    Number(config?.technicalPercentage || 0);

  const behavioral =
    Number(config?.behavioralPercentage || 0);

  const scenario =
    Number(config?.scenarioPercentage || 0);

  const communication =
    Number(config?.communicationPercentage || 0);

  const total =
    technical +
    behavioral +
    scenario +
    communication;

  if (total !== 100) {
    errors.percentages =
      "Technical, behavioral, scenario and communication percentages must total 100%.";
  }

  return errors;
};


// Interview answer validation
export const validateAnswer = (answer) => {
  if (
    answer === null ||
    answer === undefined ||
    typeof answer !== "string"
  ) {
    return {
      valid: false,
      message: "Please provide an answer.",
    };
  }

  if (answer.trim().length === 0) {
    return {
      valid: false,
      message: "Please provide an answer.",
    };
  }

  return {
    valid: true,
    message: "",
  };
};


// MCQ answer validation
export const validateMCQAnswer = (
  selectedAnswer
) => {
  if (
    selectedAnswer === null ||
    selectedAnswer === undefined ||
    selectedAnswer === ""
  ) {
    return {
      valid: false,
      message: "Please select an answer.",
    };
  }

  return {
    valid: true,
    message: "",
  };
};


// File validation
export const validateFile = (
  file,
  allowedTypes = [],
  maxSizeMB = 5
) => {
  if (!file) {
    return {
      valid: false,
      message: "Please select a file.",
    };
  }

  if (
    allowedTypes.length > 0 &&
    !allowedTypes.includes(file.type)
  ) {
    return {
      valid: false,
      message: "Unsupported file type.",
    };
  }

  const maxSize =
    maxSizeMB * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size must not exceed ${maxSizeMB} MB.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
};


// Resume validation
export const validateResume = (file) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  return validateFile(
    file,
    allowedTypes,
    5
  );
};


// Score validation
export const isValidScore = (score) => {
  const value = Number(score);

  return (
    !Number.isNaN(value) &&
    value >= 0 &&
    value <= 100
  );
};


// Percentage validation
export const isValidPercentage = (
  percentage
) => {
  return isValidScore(percentage);
};


// Verification result validation
export const isValidVerificationResult = (
  result
) => {
  if (!result) {
    return false;
  }

  return (
    result.success === true ||
    result.verified === true ||
    result.status === "verified"
  );
};


// Generic form validation helper
export const hasValidationErrors = (
  errors
) => {
  return (
    errors &&
    Object.keys(errors).length > 0
  );
};

