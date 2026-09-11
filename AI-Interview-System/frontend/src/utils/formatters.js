
// Format a date into a readable format
export const formatDate = (date) => {
  if (!date) return "N/A";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "N/A";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// Format date and time
export const formatDateTime = (date) => {
  if (!date) return "N/A";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "N/A";
  }

  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


// Format interview duration
export const formatDuration = (seconds) => {
  if (
    seconds === null ||
    seconds === undefined ||
    Number.isNaN(Number(seconds))
  ) {
    return "N/A";
  }

  const totalSeconds = Math.max(
    0,
    Math.floor(Number(seconds))
  );

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes} min ${String(
    remainingSeconds
  ).padStart(2, "0")} sec`;
};


// Format minutes as readable duration
export const formatMinutes = (minutes) => {
  if (
    minutes === null ||
    minutes === undefined ||
    Number.isNaN(Number(minutes))
  ) {
    return "N/A";
  }

  const value = Number(minutes);

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
};


// Format percentage
export const formatPercentage = (
  value,
  decimals = 1
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "N/A";
  }

  return `${number.toFixed(decimals)}%`;
};


// Format score
export const formatScore = (
  score,
  decimals = 1
) => {
  if (
    score === null ||
    score === undefined ||
    score === ""
  ) {
    return "N/A";
  }

  const number = Number(score);

  if (Number.isNaN(number)) {
    return "N/A";
  }

  return number.toFixed(decimals);
};


// Format name
export const formatName = (name) => {
  if (!name || typeof name !== "string") {
    return "N/A";
  }

  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


// Format status for display
export const formatStatus = (status) => {
  if (!status) return "N/A";

  return String(status)
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


// Format recommendation
export const formatRecommendation = (
  recommendation
) => {
  if (!recommendation) {
    return "Pending Review";
  }

  return String(recommendation)
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};


// Format skill list
export const formatSkillList = (skills) => {
  if (!Array.isArray(skills)) {
    return "N/A";
  }

  const formatted = skills
    .filter(Boolean)
    .map((skill) =>
      typeof skill === "string"
        ? skill.trim()
        : skill?.name ||
          skill?.skill ||
          skill?.skillName ||
          ""
    )
    .filter(Boolean);

  return formatted.length > 0
    ? formatted.join(", ")
    : "N/A";
};


// Convert value to array
export const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};


// Format question number
export const formatQuestionNumber = (
  current,
  total
) => {
  if (!total) {
    return `Question ${current || 1}`;
  }

  return `Question ${current || 1} of ${total}`;
};


// Format progress percentage
export const formatProgress = (
  current,
  total
) => {
  const currentValue = Number(current) || 0;
  const totalValue = Number(total) || 0;

  if (totalValue <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (currentValue / totalValue) * 100
    )
  );
};


// Convert seconds to MM:SS
export const formatTimer = (seconds) => {
  const value = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
};


// Format file size
export const formatFileSize = (bytes) => {
  if (
    bytes === null ||
    bytes === undefined ||
    Number.isNaN(Number(bytes))
  ) {
    return "N/A";
  }

  const value = Number(bytes);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
};


// Format boolean values
export const formatBoolean = (
  value
) => {
  if (value === true) return "Yes";
  if (value === false) return "No";

  return "N/A";
};


// Convert an API value into display text
export const formatDisplayValue = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  if (Array.isArray(value)) {
    return formatSkillList(value);
  }

  if (typeof value === "boolean") {
    return formatBoolean(value);
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.label ||
      value?.title ||
      value?.value ||
      "N/A"
    );
  }

  return String(value);
};

