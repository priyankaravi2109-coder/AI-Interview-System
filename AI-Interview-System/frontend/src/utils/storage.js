
// Safely store a value in localStorage
export const setStorageItem = (key, value) => {
  try {
    if (!key) return false;

    const storedValue =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

    localStorage.setItem(
      key,
      storedValue
    );

    return true;
  } catch (error) {
    console.error(
      "Unable to save localStorage item:",
      error
    );

    return false;
  }
};


// Get a value from localStorage
export const getStorageItem = (key) => {
  try {
    if (!key) return null;

    const value =
      localStorage.getItem(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(
      "Unable to read localStorage item:",
      error
    );

    return null;
  }
};


// Remove a localStorage item
export const removeStorageItem = (key) => {
  try {
    if (!key) return false;

    localStorage.removeItem(key);

    return true;
  } catch (error) {
    console.error(
      "Unable to remove localStorage item:",
      error
    );

    return false;
  }
};


// Clear all application-specific storage
export const clearAppStorage = () => {
  try {
    const keysToRemove = [
      "ai_interview_user",
      "ai_interview_token",
      "ai_interview_active",
      "interviewId",
      "assessmentId",
      "codingAssessmentId",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error(
      "Unable to clear application storage:",
      error
    );

    return false;
  }
};


// Save logged-in user
export const saveUser = (user) => {
  return setStorageItem(
    "ai_interview_user",
    user
  );
};


// Get logged-in user
export const getUser = () => {
  return getStorageItem(
    "ai_interview_user"
  );
};


// Remove logged-in user
export const removeUser = () => {
  return removeStorageItem(
    "ai_interview_user"
  );
};


// Save authentication token
export const saveToken = (token) => {
  return setStorageItem(
    "ai_interview_token",
    token
  );
};


// Get authentication token
export const getToken = () => {
  return getStorageItem(
    "ai_interview_token"
  );
};


// Remove authentication token
export const removeToken = () => {
  return removeStorageItem(
    "ai_interview_token"
  );
};


// Save active interview
export const saveActiveInterview = (
  interviewId
) => {
  if (!interviewId) return false;

  return setStorageItem(
    "ai_interview_active",
    interviewId
  );
};


// Get active interview
export const getActiveInterview = () => {
  return getStorageItem(
    "ai_interview_active"
  );
};


// Remove active interview
export const removeActiveInterview = () => {
  return removeStorageItem(
    "ai_interview_active"
  );
};


// Save interview ID
export const saveInterviewId = (
  interviewId
) => {
  if (!interviewId) return false;

  return setStorageItem(
    "interviewId",
    interviewId
  );
};


// Get interview ID
export const getInterviewId = () => {
  return getStorageItem(
    "interviewId"
  );
};


// Remove interview ID
export const removeInterviewId = () => {
  return removeStorageItem(
    "interviewId"
  );
};


// Save coding assessment ID
export const saveCodingAssessmentId = (
  assessmentId
) => {
  if (!assessmentId) return false;

  return setStorageItem(
    "codingAssessmentId",
    assessmentId
  );
};


// Get coding assessment ID
export const getCodingAssessmentId = () => {
  return getStorageItem(
    "codingAssessmentId"
  );
};


// Remove coding assessment ID
export const removeCodingAssessmentId = () => {
  return removeStorageItem(
    "codingAssessmentId"
  );
};


// Save generic assessment ID
export const saveAssessmentId = (
  assessmentId
) => {
  if (!assessmentId) return false;

  return setStorageItem(
    "assessmentId",
    assessmentId
  );
};


// Get generic assessment ID
export const getAssessmentId = () => {
  return getStorageItem(
    "assessmentId"
  );
};


// Remove generic assessment ID
export const removeAssessmentId = () => {
  return removeStorageItem(
    "assessmentId"
  );
};

