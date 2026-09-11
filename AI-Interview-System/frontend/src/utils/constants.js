
// Application roles
export const USER_ROLES = {
  ADMIN: "admin",
  HR: "hr",
  CANDIDATE: "candidate",
};


// Candidate status flow
export const CANDIDATE_STATUS = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "AI Interview Scheduled",
  IDENTITY_VERIFIED: "Identity Verified",
  INTERVIEW_COMPLETED: "AI Interview Completed",
  AI_EVALUATION: "AI Evaluation",
  HR_REVIEW: "HR Review",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  ON_HOLD: "On Hold",
};


// Interview sections
export const INTERVIEW_SECTIONS = {
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  SCENARIO: "Scenario",
  COMMUNICATION: "Communication",
};


// Question categories
export const QUESTION_CATEGORIES = {
  TECHNICAL: "Technical",
  SKILL_BASED: "Skill-Based",
  SCENARIO: "Scenario",
  PROBLEM_SOLVING: "Problem-Solving",
  BEHAVIORAL: "Behavioral",
  COMMUNICATION: "Communication",
  EXPERIENCE_BASED: "Experience-Based",
};


// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};


// Assessment types
export const ASSESSMENT_TYPES = {
  MCQ: "MCQ",
  CODING: "Coding",
  SQL: "SQL",
  DEBUGGING: "Debugging",
  OUTPUT_PREDICTION: "Output Prediction",
  SCENARIO: "Scenario",
};


// Recommendation values
export const RECOMMENDATIONS = {
  STRONG_MATCH: "Strong Match",
  MATCH: "Match",
  BORDERLINE: "Borderline",
  NEEDS_HUMAN_REVIEW: "Needs Human Review",
};


// Interview configuration defaults
export const INTERVIEW_DEFAULTS = {
  QUESTION_COUNT: 20,
  DURATION_MINUTES: 30,

  TECHNICAL_PERCENTAGE: 60,
  BEHAVIORAL_PERCENTAGE: 20,
  SCENARIO_PERCENTAGE: 10,
  COMMUNICATION_PERCENTAGE: 10,

  PASSING_SCORE: 60,

  LANGUAGE: "English",
  AI_PERSONALITY: "Professional",
  AI_TONE: "Friendly",
};


// Evaluation categories
export const EVALUATION_CATEGORIES = {
  CORRECTNESS: "Correctness",
  RELEVANCE: "Relevance",
  TECHNICAL_KNOWLEDGE: "Technical Knowledge",
  PROBLEM_SOLVING: "Problem Solving",
  COMMUNICATION: "Communication",
  CONFIDENCE: "Confidence",
  DEPTH: "Depth",
  PRACTICAL_KNOWLEDGE: "Practical Knowledge",
};


// Verification events
export const VERIFICATION_EVENTS = {
  STARTED: "Verification Started",
  PERMISSION_GRANTED: "Camera Permission Granted",
  INITIAL_SUCCESS: "Initial Verification Success",
  INITIAL_FAILED: "Initial Verification Failed",
  FACE_NOT_DETECTED: "Face Not Detected",
  MULTIPLE_FACES: "Multiple Faces Detected",
  CANDIDATE_ABSENT: "Candidate Absent",
  COMPLETED: "Verification Completed",
};


// Integrity events
export const INTEGRITY_EVENTS = {
  FACE_NOT_PRESENT: "Face Not Present",
  MULTIPLE_PERSONS: "Multiple Persons Detected",
  CAMERA_VIEW_LEFT: "Candidate Left Camera View",
  TIMEOUT: "Interview Timeout",
  TAB_SWITCH: "Tab/Window Focus Change",
  SUSPICIOUS_INTERRUPTION: "Suspicious Interruption",
};


// Interview stages
export const INTERVIEW_STAGES = {
  LOGIN: "Candidate Login",
  VERIFICATION: "Candidate Verification",
  CAMERA_PERMISSION: "Camera Permission",
  FACE_VERIFICATION: "Face Verification",
  INSTRUCTIONS: "Instructions",
  AI_INTERVIEW: "AI Interview",
  TECHNICAL_ASSESSMENT: "Technical Assessment",
  BEHAVIORAL_ASSESSMENT: "Behavioral Assessment",
  COMMUNICATION_ASSESSMENT: "Communication Assessment",
  FINAL_EVALUATION: "Final Evaluation",
  RESULT: "Result",
  REPORT: "AI Report",
};


// Local storage keys
export const STORAGE_KEYS = {
  USER: "ai_interview_user",
  TOKEN: "ai_interview_token",
  ACTIVE_INTERVIEW: "ai_interview_active",
  INTERVIEW_ID: "interviewId",
  ASSESSMENT_ID: "assessmentId",
  CODING_ASSESSMENT_ID: "codingAssessmentId",
};


// Supported languages
export const LANGUAGES = [
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
  "Kannada",
];


// AI interviewer personalities
export const AI_PERSONALITIES = [
  "Professional",
  "Friendly",
  "Formal",
  "Conversational",
];


// AI interviewer tones
export const AI_TONES = [
  "Professional",
  "Friendly",
  "Neutral",
  "Encouraging",
];


// Supported coding languages
export const CODE_LANGUAGES = [
  "JavaScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "SQL",
];


// File upload restrictions
export const FILE_UPLOAD = {
  MAX_RESUME_SIZE_MB: 5,

  RESUME_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};


// API timeout
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000,
};


// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};


// Human review notice
export const HUMAN_REVIEW_MESSAGE =
  "AI-generated results are decision-support information and must be reviewed by authorized HR personnel. The system does not automatically select or reject candidates.";

