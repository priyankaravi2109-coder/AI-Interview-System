const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.5-flash-lite";

const MAX_RETRIES =
  Math.max(1, Number(process.env.GEMINI_MAX_RETRIES || 3));

const RETRY_BASE_DELAY =
  Math.max(500, Number(process.env.GEMINI_RETRY_DELAY_MS || 1500));

const RETRYABLE_STATUS_CODES = new Set([
  408,
  429,
  500,
  502,
  503,
  504
]);

/* =========================================================
   CODING LANGUAGE RULES
========================================================= */

const ALLOWED_CODING_LANGUAGES = [
  "python",
  "java",
  "c",
  "cpp",
  "javascript"
];

const FORBIDDEN_CODING_LANGUAGES = [
  "sql",
  "mysql",
  "postgresql",
  "postgres",
  "plsql",
  "tsql",
  "sqlite",
  "oracle sql"
];

/* =========================================================
   BASIC HELPERS
========================================================= */

function cleanText(value, max = 12000) {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/\u0000/g, " ")
    .trim()
    .slice(0, max);
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [
    ...new Set(
      values
        .map(v => cleanText(v, 300))
        .filter(Boolean)
    )
  ];
}

function parseJson(text) {
  if (!text) return null;

  let value = String(text).trim();

  value = value
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(value);
  } catch (_) {}

  const startArray = value.indexOf("[");
  const endArray = value.lastIndexOf("]");

  if (startArray >= 0 && endArray > startArray) {
    try {
      return JSON.parse(
        value.slice(startArray, endArray + 1)
      );
    } catch (_) {}
  }

  const startObject = value.indexOf("{");
  const endObject = value.lastIndexOf("}");

  if (startObject >= 0 && endObject > startObject) {
    try {
      return JSON.parse(
        value.slice(startObject, endObject + 1)
      );
    } catch (_) {}
  }

  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* =========================================================
   CODING LANGUAGE HELPERS
========================================================= */

function normalizeCodingLanguage(value) {
  const language = cleanText(value, 100).toLowerCase();

  const aliases = {
    "c++": "cpp",
    "c plus plus": "cpp",
    "js": "javascript",
    "node": "javascript",
    "nodejs": "javascript",
    "python3": "python"
  };

  return aliases[language] || language;
}

function normalizeCodingLanguages(values) {
  return unique(
    array(values)
      .map(normalizeCodingLanguage)
      .filter(Boolean)
  );
}

function containsForbiddenSql(text) {
  const value =
    cleanText(text, 20000).toLowerCase();

  if (!value) return false;

  return FORBIDDEN_CODING_LANGUAGES.some(
    language =>
      value.includes(language.toLowerCase())
  );
}

function containsSqlCodingPattern(text) {
  const value =
    cleanText(text, 20000).toLowerCase();

  if (!value) return false;

  const sqlPatterns = [
    /\bselect\b[\s\S]{0,200}\bfrom\b/,
    /\binsert\s+into\b/,
    /\bupdate\s+\w+\s+set\b/,
    /\bdelete\s+from\b/,
    /\bcreate\s+table\b/,
    /\balter\s+table\b/,
    /\bdrop\s+table\b/,
    /\btruncate\s+table\b/,
    /\bjoin\b[\s\S]{0,100}\bon\b/,
    /\bstored\s+procedure\b/,
    /\bstored\s+proc\b/,
    /\bsql\s+query\b/,
    /\bdatabase\s+query\b/
  ];

  return sqlPatterns.some(pattern =>
    pattern.test(value)
  );
}

function sanitizeCodingMetadata(metadata = {}) {
  const safe = {
    ...metadata
  };

  safe.languageOptions =
    ALLOWED_CODING_LANGUAGES.slice();

  if (
    safe.starterCode &&
    typeof safe.starterCode === "object"
  ) {
    safe.starterCode = {
      python:
        cleanText(
          safe.starterCode.python,
          10000
        ),

      java:
        cleanText(
          safe.starterCode.java,
          10000
        ),

      c:
        cleanText(
          safe.starterCode.c,
          10000
        ),

      cpp:
        cleanText(
          safe.starterCode.cpp,
          10000
        ),

      javascript:
        cleanText(
          safe.starterCode.javascript,
          10000
        )
    };
  }

  return safe;
}

/* =========================================================
   GEMINI API - RETRY + FALLBACK MODEL
========================================================= */

async function callGeminiModel(
  model,
  prompt,
  json = false
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from backend .env"
    );
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let lastError = null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `
You are the AI interviewer and evaluator for a professional recruitment platform.

Evaluate candidates only using:
- job requirements
- candidate resume/profile
- technical skills
- experience
- education
- certifications
- interview questions
- candidate answers
- objective coding results
- communication responses

Do not evaluate or infer protected characteristics such as:
race, caste, religion, gender, age, disability, nationality,
appearance, facial attractiveness, accent origin, or socioeconomic background.

Do not make automatic hiring decisions.

Questions must be:
- relevant to the job
- relevant to the candidate
- non-repetitive
- realistic
- technically accurate
- appropriate for the configured difficulty
- answerable within the configured interview time

Evaluation must be based on the actual question,
expected answer/rubric and candidate response,
not merely keyword matching or answer length.

CODING LANGUAGE POLICY:

The only allowed programming languages for coding questions are:

Python
Java
C
C++
JavaScript

SQL is NOT a coding language for this assessment.

Never generate SQL as a coding question.

SQL may only appear in a technical MCQ when SQL
is genuinely relevant to the candidate or job.

Never put SQL in metadata.languageOptions.

Never create coding tasks based on:
SELECT
INSERT
UPDATE
DELETE
JOIN
CREATE TABLE
ALTER TABLE
stored procedures
database queries
SQL-only programming problems.

Every coding question must be solvable using:
Python, Java, C, C++, or JavaScript.
                `.trim()
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: cleanText(prompt, 30000)
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 10000,

            ...(json
              ? {
                  responseMimeType:
                    "application/json"
                }
              : {})
          }
        })
      });

      const raw = await response.text();

      if (response.ok) {
        let data;

        try {
          data = JSON.parse(raw);
        } catch (_) {
          throw new Error(
            "Gemini returned invalid JSON response."
          );
        }

        const text =
          data
            ?.candidates?.[0]
            ?.content
            ?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!text) {
          throw new Error(
            `Gemini returned an empty response from ${model}.`
          );
        }

        return text;
      }

      let message = raw;

      try {
        const errorData = JSON.parse(raw);

        message =
          errorData?.error?.message ||
          errorData?.message ||
          raw;
      } catch (_) {}

      const error = new Error(
        `Gemini API ${response.status}: ${message.slice(0, 2000)}`
      );

      error.status = response.status;
      error.model = model;

      lastError = error;

      if (
        !RETRYABLE_STATUS_CODES.has(
          response.status
        )
      ) {
        throw error;
      }

      if (attempt >= MAX_RETRIES) {
        throw error;
      }

      const exponentialDelay =
        RETRY_BASE_DELAY *
        Math.pow(2, attempt);

      const jitter =
        Math.floor(Math.random() * 500);

      const delay =
        exponentialDelay + jitter;

      console.warn(
        `[Gemini] ${model} returned ${response.status}. ` +
        `Retry ${attempt + 1}/${MAX_RETRIES} ` +
        `in ${delay}ms`
      );

      await sleep(delay);

    } catch (error) {
      lastError = error;

      const status =
        Number(error?.status || 0);

      const retryable =
        !status ||
        RETRYABLE_STATUS_CODES.has(status);

      if (
        !retryable ||
        attempt >= MAX_RETRIES
      ) {
        throw error;
      }

      const exponentialDelay =
        RETRY_BASE_DELAY *
        Math.pow(2, attempt);

      const jitter =
        Math.floor(Math.random() * 500);

      const delay =
        exponentialDelay + jitter;

      console.warn(
        `[Gemini] Temporary failure from ${model}. ` +
        `Retry ${attempt + 1}/${MAX_RETRIES} ` +
        `in ${delay}ms`
      );

      await sleep(delay);
    }
  }

  throw (
    lastError ||
    new Error(
      `Gemini request failed for ${model}`
    )
  );
}

/* =========================================================
   PUBLIC GEMINI FUNCTION
========================================================= */

async function gemini(prompt, json = false) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing from backend .env"
    );
  }

  try {
    return await callGeminiModel(
      DEFAULT_MODEL,
      prompt,
      json
    );
  } catch (primaryError) {
    console.error(
      `[Gemini] Primary model ${DEFAULT_MODEL} failed:`,
      primaryError.message
    );
  }

  if (
    FALLBACK_MODEL &&
    FALLBACK_MODEL !== DEFAULT_MODEL
  ) {
    try {
      console.warn(
        `[Gemini] Switching to fallback model: ${FALLBACK_MODEL}`
      );

      return await callGeminiModel(
        FALLBACK_MODEL,
        prompt,
        json
      );

    } catch (fallbackError) {
      console.error(
        `[Gemini] Fallback model ${FALLBACK_MODEL} failed:`,
        fallbackError.message
      );

      throw new Error(
        `Gemini question generation failed. Primary model ${DEFAULT_MODEL} and fallback model ${FALLBACK_MODEL} were unavailable.`
      );
    }
  }

  throw new Error(
    `Gemini model ${DEFAULT_MODEL} is unavailable.`
  );
}

/* =========================================================
   CANDIDATE / JOB CONTEXT
========================================================= */

function normalizeSkills(value) {
  if (Array.isArray(value)) {
    return unique(value);
  }

  if (typeof value === "string") {
    return unique(
      value
        .split(/[,;\n|]/)
        .map(v => v.trim())
    );
  }

  return [];
}

function buildCandidateContext(candidate = {}) {
  const skills =
    normalizeSkills(candidate.skills);

  const technicalSkills =
    normalizeSkills(
      candidate.technical_skills ||
      candidate.technicalSkills
    );

  const softSkills =
    normalizeSkills(
      candidate.soft_skills ||
      candidate.softSkills
    );

  const secondarySkills =
    normalizeSkills(
      candidate.secondary_skills ||
      candidate.secondarySkills
    );

  const certifications =
    normalizeSkills(
      candidate.certifications
    );

  let resumeAnalysis =
    candidate.resume_analysis ||
    candidate.resumeAnalysis ||
    {};

  if (typeof resumeAnalysis === "string") {
    resumeAnalysis =
      parseJson(resumeAnalysis) || {};
  }

  return {
    name:
      cleanText(
        candidate.name,
        300
      ),

    email:
      cleanText(
        candidate.email,
        300
      ),

    education:
      cleanText(
        candidate.education,
        1000
      ),

    experienceYears:
      number(
        candidate.experience_years ??
        candidate.experienceYears,
        0
      ),

    skills,

    technicalSkills,

    secondarySkills,

    softSkills,

    certifications,

    projects:
      array(resumeAnalysis.projects),

    experience:
      array(resumeAnalysis.experience),

    jobHistory:
      array(resumeAnalysis.jobHistory),

    technologies:
      normalizeSkills(
        resumeAnalysis.technologies
      ),

    resumeAnalysis,

    resume:
      cleanText(
        candidate.resume_text ||
        candidate.resumeText ||
        candidate.resume ||
        "",
        18000
      )
  };
}

function buildJobContext(job = {}) {
  const requirements =
    job.requirements ||
    job.job_requirements ||
    [];

  const skills =
    normalizeSkills(
      job.skills ||
      job.required_skills ||
      job.requiredSkills
    );

  return {
    title:
      cleanText(
        job.title ||
        job.job_title ||
        job.role,
        500
      ),

    description:
      cleanText(
        job.description ||
        job.job_description ||
        job.jd ||
        "",
        12000
      ),

    requiredExperience:
      number(
        job.required_experience ??
        job.required_experience_years ??
        job.experience_required,
        0
      ),

    education:
      cleanText(
        job.education ||
        job.required_education ||
        "",
        1000
      ),

    skills,

    requirements:
      cleanText(
        JSON.stringify(requirements),
        6000
      )
  };
}

/* =========================================================
   QUESTION COUNTS
========================================================= */

function calculateCounts(cfg = {}) {
  const total =
    number(
      cfg.question_count ??
      cfg.total_questions,
      17
    );

  let technical =
    number(
      cfg.technical_question_count ??
      cfg.technical_count,
      0
    );

  let coding =
    number(
      cfg.coding_question_count ??
      cfg.coding_count,
      0
    );

  let communication =
    number(
      cfg.communication_question_count ??
      cfg.communication_count,
      0
    );

  let behavioral =
    number(
      cfg.behavioral_question_count ??
      cfg.behavioral_count,
      0
    );

  let scenario =
    number(
      cfg.scenario_question_count ??
      cfg.scenario_count,
      0
    );

  const percentagesExist =
    [
      cfg.technical_pct,
      cfg.communication_pct,
      cfg.behavioral_pct,
      cfg.scenario_pct
    ].some(
      v => number(v, 0) > 0
    );

  if (
    technical +
      coding +
      communication +
      behavioral +
      scenario === 0
  ) {
    if (percentagesExist) {
      technical =
        Math.round(
          total *
          number(cfg.technical_pct, 0) /
          100
        );

      communication =
        Math.round(
          total *
          number(
            cfg.communication_pct,
            0
          ) /
          100
        );

      behavioral =
        Math.round(
          total *
          number(
            cfg.behavioral_pct,
            0
          ) /
          100
        );

      scenario =
        Math.round(
          total *
          number(
            cfg.scenario_pct,
            0
          ) /
          100
        );
    } else {
      technical = 5;
      coding = 3;
      communication = 3;
      behavioral = 3;
      scenario = 3;
    }
  }

  return {
    technical:
      Math.max(
        0,
        Math.floor(technical)
      ),

    coding:
      Math.max(
        0,
        Math.floor(coding)
      ),

    communication:
      Math.max(
        0,
        Math.floor(communication)
      ),

    behavioral:
      Math.max(
        0,
        Math.floor(behavioral)
      ),

    scenario:
      Math.max(
        0,
        Math.floor(scenario)
      )
  };
}

/* =========================================================
   QUESTION VALIDATION
========================================================= */

function normalizeQuestion(
  q,
  index,
  stage
) {
  const type =
    cleanText(
      q.type ||
      (
        stage === "technical"
          ? "mcq"
          : stage
      ),
      100
    ).toLowerCase();

  const options =
    Array.isArray(q.options)
      ? q.options
          .map(v =>
            cleanText(v, 1000)
          )
          .filter(Boolean)
      : [];

  let metadata =
    q.metadata &&
    typeof q.metadata === "object"
      ? q.metadata
      : {};

  if (stage === "coding") {
    metadata =
      sanitizeCodingMetadata(
        metadata
      );
  }

  return {
    stage,

    sequence_no:
      number(
        q.sequence_no,
        index + 1
      ),

    type,

    skill:
      cleanText(
        q.skill ||
        stage,
        300
      ),

    difficulty:
      cleanText(
        q.difficulty ||
        "intermediate",
        100
      ).toLowerCase(),

    prompt:
      cleanText(
        q.prompt ||
        q.question ||
        "",
        5000
      ),

    options,

    correct_answer:
      q.correct_answer !== undefined &&
      q.correct_answer !== null
        ? cleanText(
            q.correct_answer,
            2000
          )
        : null,

    expected_answer:
      cleanText(
        q.expected_answer ||
        "",
        4000
      ),

    evaluation_rubric:
      cleanText(
        q.evaluation_rubric ||
        "",
        5000
      ),

    metadata
  };
}

function validateQuestion(
  q,
  stage
) {
  if (!q || typeof q !== "object") {
    return false;
  }

  if (!cleanText(q.prompt)) {
    return false;
  }

  if (stage === "technical") {
    if (
      !Array.isArray(q.options) ||
      q.options.length !== 4
    ) {
      return false;
    }

    if (
      q.correct_answer === undefined ||
      q.correct_answer === null ||
      q.correct_answer === ""
    ) {
      return false;
    }
  }

  if (stage === "coding") {
    if (!q.metadata) {
      return false;
    }

    /* Never allow SQL coding questions. */
    if (
      containsForbiddenSql(q.prompt) ||
      containsForbiddenSql(q.metadata?.prompt) ||
      containsSqlCodingPattern(q.prompt) ||
      containsSqlCodingPattern(
        q.metadata?.description
      )
    ) {
      return false;
    }

    const languages =
      normalizeCodingLanguages(
        q.metadata.languageOptions
      );

    /* languageOptions must exist */
    if (!languages.length) {
      return false;
    }

    /* SQL or SQL aliases are never allowed. */
    if (
      languages.some(
        language =>
          FORBIDDEN_CODING_LANGUAGES.includes(
            language
          ) ||
          language.includes("sql")
      )
    ) {
      return false;
    }

    /* No unsupported language. */
    if (
      languages.some(
        language =>
          !ALLOWED_CODING_LANGUAGES.includes(
            language
          )
      )
    ) {
      return false;
    }

    if (
      !q.metadata.tests &&
      !q.metadata.publicTests
    ) {
      return false;
    }

    const hasStarterCode =
      q.metadata.starterCode &&
      typeof q.metadata.starterCode === "object";

    if (!hasStarterCode) {
      return false;
    }

    /*
      At least one of the allowed programming
      languages must have starter code.
    */
    const starterCode =
      q.metadata.starterCode;

    const hasAllowedStarter =
      ALLOWED_CODING_LANGUAGES.some(
        language =>
          cleanText(
            starterCode[language],
            10000
          )
      );

    if (!hasAllowedStarter) {
      return false;
    }
  }

  if (stage === "communication") {
    const promptType =
      cleanText(
        q.metadata?.promptType,
        100
      ).toLowerCase();

    const isReading =
      promptType === "reading" ||
      promptType === "read_aloud";

    if (isReading) {
      const passage =
        cleanText(
          q.metadata?.passage ||
          q.metadata?.readingText ||
          "",
          10000
        );

      if (!passage) {
        return false;
      }
    } else if (
      !q.metadata?.passage &&
      !q.metadata?.readingText &&
      !q.metadata?.promptType
    ) {
      return false;
    }
  }

  return true;
}

/* =========================================================
   FALLBACK CODING
========================================================= */

const fallbackCoding = [
  {
    prompt:
      "Given an array of integers, find the second largest distinct value. Return -1 if there are fewer than two distinct values.",

    skill:
      "Problem Solving",

    difficulty:
      "intermediate",

    metadata: {
      languageOptions:
        ALLOWED_CODING_LANGUAGES.slice(),

      constraints: [
        "The array contains at least one integer.",
        "The solution must handle duplicate values.",
        "Return -1 when fewer than two distinct values exist."
      ],

      examples: [
        {
          input: "[10,5,8,10,3]",
          output: "8"
        },
        {
          input: "[1,2,3]",
          output: "2"
        },
        {
          input: "[5,5,5]",
          output: "-1"
        }
      ],

      starterCode: {
        python:
`def second_largest(arr):
    # Write your solution here
    pass`,

        java:
`public static int secondLargest(int[] arr) {
    // Write your solution here
    return -1;
}`,

        cpp:
`int secondLargest(vector<int> arr) {
    // Write your solution here
    return -1;
}`,

        c:
`int secondLargest(int arr[], int n) {
    // Write your solution here
    return -1;
}`,

        javascript:
`function secondLargest(arr) {
    // Write your solution here
    return -1;
}`
      },

      tests: [
        {
          input:
            "[10,5,8,10,3]",
          expected:
            "8"
        },

        {
          input:
            "[1,2,3]",
          expected:
            "2"
        },

        {
          input:
            "[5,5,5]",
          expected:
            "-1"
        }
      ],

      hiddenTests: [
        {
          input:
            "[-10,-5,-20,-5]",
          expected:
            "-10"
        }
      ]
    }
  }
];

/* =========================================================
   PERSONALIZED LOCAL FALLBACK
========================================================= */

function personalizedEmergencyQuestions({
  job,
  candidate,
  counts
}) {
  const candidateContext =
    buildCandidateContext(
      candidate
    );

  const jobContext =
    buildJobContext(job);

  const skills = [
    ...candidateContext.technicalSkills,
    ...candidateContext.technologies,
    ...candidateContext.skills,
    ...jobContext.skills
  ];

  const uniqueCandidateSkills =
    unique(skills);

  const mainSkill =
    uniqueCandidateSkills[0] ||
    "the candidate's demonstrated technical skill";

  const project =
    candidateContext.projects[0] ||
    "a project mentioned in your resume";

  const result = [];

  let sequence = 1;

  /* Technical */

  for (
    let i = 0;
    i < counts.technical;
    i++
  ) {
    result.push({
      stage: "technical",
      sequence_no: sequence++,
      type: "mcq",
      skill: mainSkill,
      difficulty: "intermediate",

      prompt:
        `Based on your experience with ${mainSkill}, ` +
        `which approach would be most appropriate when ` +
        `designing a reliable solution for the ${jobContext.title} role?`,

      options: [
        "Choose an approach based on requirements, correctness and maintainability",
        "Always choose the shortest code regardless of requirements",
        "Ignore edge cases if the normal case works",
        "Avoid testing the solution"
      ],

      correct_answer: "0",

      metadata: {
        emergencyPersonalized: true
      }
    });
  }

  /* Coding */

  for (
    let i = 0;
    i < counts.coding;
    i++
  ) {
    const coding =
      fallbackCoding[
        i %
        fallbackCoding.length
      ];

    result.push({
      stage: "coding",
      sequence_no: sequence++,
      type: "coding",

      skill:
        uniqueCandidateSkills[0] ||
        coding.skill,

      difficulty:
        coding.difficulty,

      prompt:
        `Solve the following programming problem using ` +
        `Python, Java, C, C++, or JavaScript. ` +
        `SQL is not accepted for this coding assessment. ` +
        `Where appropriate, relate your solution approach ` +
        `to the ${mainSkill} skills demonstrated in your profile.\n\n` +
        coding.prompt,

      options: [],

      correct_answer: null,

      expected_answer: "",

      evaluation_rubric:
        "Evaluate correctness, edge cases, time complexity, space complexity, readability and practical reasoning.",

      metadata: {
        ...sanitizeCodingMetadata(
          coding.metadata
        ),

        emergencyPersonalized:
          true
      }
    });
  }

  /* Communication */

  const communicationPassages = [
    `In a professional software environment, a successful project depends on clear communication, careful planning and continuous problem solving. A developer should understand the requirements, communicate important decisions with the team, test the solution properly and remain open to feedback. Good communication helps technical teams work together effectively and resolve problems before they affect the final product.`,

    `Technology projects often require collaboration between people with different responsibilities. A developer may need to explain a technical problem, discuss possible solutions, listen to feedback and communicate progress clearly. Strong communication allows the team to make informed decisions while keeping the project focused on its goals.`,

    `A reliable software solution is not created only by writing code. Developers must understand the problem, consider possible edge cases, test their implementation and communicate their reasoning. When a problem occurs, explaining the issue clearly and working with the team to identify a solution can improve both the development process and the final result.`
  ];

  for (
    let i = 0;
    i < counts.communication;
    i++
  ) {
    const passage =
      communicationPassages[
        i % communicationPassages.length
      ];

    result.push({
      stage: "communication",
      sequence_no: sequence++,
      type: "communication",

      skill: "Communication",

      difficulty:
        "intermediate",

      prompt:
        "Read the displayed passage aloud clearly using the microphone. " +
        "Focus on pronunciation, fluency, clarity and natural pacing.",

      options: [],

      correct_answer: null,

      expected_answer: "",

      evaluation_rubric:
        "Evaluate clarity, pronunciation, fluency, pacing, relevance and comprehension.",

      metadata: {
        promptType:
          "reading",

        passage,

        emergencyPersonalized:
          true
      }
    });
  }

  /* Behavioral */

  for (
    let i = 0;
    i < counts.behavioral;
    i++
  ) {
    result.push({
      stage: "behavioral",
      sequence_no: sequence++,
      type: "behavioral",

      skill:
        "Ownership and problem solving",

      difficulty:
        "intermediate",

      prompt:
        `Tell me about a real situation from ${project} ` +
        `where you faced a difficult problem. ` +
        `Explain what you did, why you chose that approach ` +
        `and what the result was.`,

      options: [],

      correct_answer: null,

      expected_answer: "",

      evaluation_rubric:
        "Evaluate situation, action, reasoning, result and reflection.",

      metadata: {
        adaptive: true,
        emergencyPersonalized: true
      }
    });
  }

  /* Scenario */

  for (
    let i = 0;
    i < counts.scenario;
    i++
  ) {
    result.push({
      stage: "scenario",
      sequence_no: sequence++,
      type: "scenario",

      skill:
        mainSkill,

      difficulty:
        "intermediate",

      prompt:
        `Imagine that a production problem occurs while using ` +
        `${mainSkill} in the ${jobContext.title} role. ` +
        `How would you investigate the problem, prioritize the risks, ` +
        `communicate with the team and implement a reliable solution?`,

      options: [],

      correct_answer: null,

      expected_answer: "",

      evaluation_rubric:
        "Evaluate problem understanding, prioritization, decision making, technical judgement and communication.",

      metadata: {
        adaptive: true,
        emergencyPersonalized: true
      }
    });
  }

  return result;
}

/* =========================================================
   AI QUESTION GENERATION
========================================================= */

function buildQuestionPrompt({
  job,
  candidate,
  cfg,
  previousQuestions = []
}) {
  const jobContext =
    buildJobContext(job);

  const candidateContext =
    buildCandidateContext(
      candidate
    );

  const counts =
    calculateCounts(cfg);

  return `
Create a complete AI interview question set.

JOB:
${JSON.stringify(
  jobContext,
  null,
  2
)}

CANDIDATE:
${JSON.stringify(
  candidateContext,
  null,
  2
)}

INTERVIEW CONFIGURATION:
${JSON.stringify(
  cfg || {},
  null,
  2
)}

REQUIRED COUNTS:
${JSON.stringify(
  counts,
  null,
  2
)}

QUESTIONS ALREADY ASKED:
${JSON.stringify(
  previousQuestions,
  null,
  2
)}

IMPORTANT PERSONALIZATION REQUIREMENT:

EVERY assessment stage must be personalized using
the candidate's resume/profile.

This means:

1. Technical MCQs must use the candidate's actual
   technical skills, technologies and job requirements.

2. Coding questions must use programming languages,
   technologies, algorithms, data-processing, backend,
   frontend, ML or other technical areas demonstrated
   by the candidate whenever possible.

3. Communication questions must relate to the candidate's
   actual projects, technologies or experience.

4. Behavioral questions must use real projects,
   internships, work history or academic experience
   from the candidate profile.

5. Scenario questions must be realistic for the candidate's
   role, skills, technologies and experience.

6. Do NOT invent a project or experience.

7. Do NOT ask generic questions if candidate-specific
   information is available.

8. Do NOT repeat QUESTIONS ALREADY ASKED.

9. Technical MCQs must have exactly four options and
   exactly one correct answer.

10. Coding questions must contain:
    - complete problem
    - constraints
    - examples
    - starter code
    - public tests
    - hidden tests

11. Communication reading questions MUST contain a
    non-empty passage in metadata.passage.

12. Questions must match the configured difficulty.

13. Never ask about protected characteristics.


=========================================================
CODING LANGUAGE RULE — VERY IMPORTANT
=========================================================

Coding questions are programming questions only.

Allowed coding languages:

- Python
- Java
- C
- C++
- JavaScript

SQL IS NOT A CODING LANGUAGE FOR THIS ASSESSMENT.

DO NOT generate SQL coding questions.

DO NOT generate:

- SELECT tasks
- INSERT tasks
- UPDATE tasks
- DELETE tasks
- JOIN tasks
- CREATE TABLE tasks
- ALTER TABLE tasks
- DROP TABLE tasks
- TRUNCATE TABLE tasks
- stored procedure tasks
- database query coding tasks
- SQL query answer tasks
- SQL-only programming problems

SQL may appear ONLY inside a Technical MCQ if
SQL is genuinely relevant to the candidate's
skills or the job requirements.

Every coding question must be solvable using:

Python, Java, C, C++, or JavaScript.

The metadata.languageOptions array for every coding
question MUST contain only these allowed languages.

Do not include "sql" in languageOptions.

starterCode MUST be supplied for the allowed
programming languages where appropriate.

The coding problem itself must not require SQL.

=========================================================
COMMUNICATION RULE — VERY IMPORTANT
=========================================================

For communication reading questions:

metadata.promptType MUST be:

"reading"

and metadata.passage MUST contain a real,
non-empty passage.

The passage must be:

- original
- generated specifically for this assessment
- relevant to professional communication
- suitable for reading aloud
- approximately 60 to 120 words
- not copied from a website
- not a famous quote
- not a copyrighted passage
- not an existing article
- not taken from the candidate's resume

The frontend will display this passage to the
candidate for reading aloud.

Do not return:

"passage": ""

Do not return a missing passage.

=========================================================

RETURN ONLY VALID JSON.

Required structure:

{
  "questions": [
    {
      "stage": "technical",
      "type": "mcq",
      "skill": "specific candidate skill",
      "difficulty": "intermediate",
      "prompt": "question",
      "options": [
        "A",
        "B",
        "C",
        "D"
      ],
      "correct_answer": "A",
      "expected_answer": "",
      "evaluation_rubric": "",
      "metadata": {}
    },

    {
      "stage": "coding",
      "type": "coding",
      "skill": "specific candidate skill",
      "difficulty": "intermediate",
      "prompt": "complete programming problem",
      "options": [],
      "correct_answer": null,
      "expected_answer": "",
      "evaluation_rubric": "",
      "metadata": {
        "promptType": "coding",
        "languageOptions": [
          "python",
          "java",
          "c",
          "cpp",
          "javascript"
        ],
        "constraints": [],
        "examples": [],
        "starterCode": {
          "python": "",
          "java": "",
          "c": "",
          "cpp": "",
          "javascript": ""
        },
        "tests": [],
        "hiddenTests": []
      }
    },

    {
      "stage": "communication",
      "type": "communication",
      "skill": "Communication",
      "difficulty": "intermediate",
      "prompt": "Read the displayed passage aloud clearly.",
      "options": [],
      "correct_answer": null,
      "expected_answer": "",
      "evaluation_rubric": "",
      "metadata": {
        "promptType": "reading",
        "passage": "A real original passage of approximately 60 to 120 words."
      }
    },

    {
      "stage": "behavioral",
      "type": "behavioral",
      "skill": "",
      "difficulty": "intermediate",
      "prompt": "",
      "options": [],
      "correct_answer": null,
      "expected_answer": "",
      "evaluation_rubric": "",
      "metadata": {}
    },

    {
      "stage": "scenario",
      "type": "scenario",
      "skill": "",
      "difficulty": "intermediate",
      "prompt": "",
      "options": [],
      "correct_answer": null,
      "expected_answer": "",
      "evaluation_rubric": "",
      "metadata": {}
    }
  ]
}
`.trim();
}

async function generateQuestions({
  job = {},
  candidate = {},
  cfg = {},
  previousQuestions = []
}) {
  const counts =
    calculateCounts(cfg);

  const total =
    Object.values(counts)
      .reduce(
        (sum, value) =>
          sum + number(value, 0),
        0
      );

  if (total <= 0) {
    throw new Error(
      "Interview question configuration contains zero questions."
    );
  }

  const prompt =
    buildQuestionPrompt({
      job,
      candidate,
      cfg,
      previousQuestions
    });

  try {
    const raw =
      await gemini(
        prompt,
        true
      );

    const generated =
      parseJson(raw);

    const questions =
      Array.isArray(generated)
        ? generated
        : Array.isArray(
            generated?.questions
          )
          ? generated.questions
          : [];

    if (!questions.length) {
      throw new Error(
        "Gemini did not return any interview questions."
      );
    }

    const normalized = [];

    for (const stage of [
      "technical",
      "coding",
      "communication",
      "behavioral",
      "scenario"
    ]) {
      const stageQuestions =
        questions.filter(
          q =>
            String(q.stage || "")
              .toLowerCase() === stage
        );

      const expected =
        counts[stage];

      if (
        stageQuestions.length <
        expected
      ) {
        throw new Error(
          `Gemini returned ${stageQuestions.length} ${stage} questions, but ${expected} were required.`
        );
      }

      for (
        let i = 0;
        i < expected;
        i++
      ) {
        const q =
          normalizeQuestion(
            stageQuestions[i],
            normalized.length,
            stage
          );

        if (
          !validateQuestion(
            q,
            stage
          )
        ) {
          throw new Error(
            `Gemini generated an invalid ${stage} question at position ${i + 1}.`
          );
        }

        normalized.push(q);
      }
    }

    return {
      questions:
        normalized.map(
          (q, index) => ({
            ...q,
            sequence_no:
              index + 1
          })
        ),

      model:
        DEFAULT_MODEL,

      aiGenerated: true
    };

  } catch (error) {
    console.error(
      "Gemini question generation failed:",
      error.message
    );

    const emergency =
      personalizedEmergencyQuestions({
        job,
        candidate,
        counts
      });

    return {
      questions:
        emergency,

      model:
        "personalized-emergency-fallback",

      aiGenerated: false,

      aiError:
        error.message
    };
  }
}

/* =========================================================
   ANSWER EVALUATION
========================================================= */

function buildEvaluationPrompt({
  question,
  answer,
  candidate,
  job,
  stage,
  codingResult
}) {
  return `
Evaluate one candidate answer from a professional AI interview.

JOB:
${JSON.stringify(
  buildJobContext(job),
  null,
  2
)}

CANDIDATE:
${JSON.stringify(
  buildCandidateContext(candidate),
  null,
  2
)}

STAGE:
${cleanText(stage, 100)}

QUESTION:
${JSON.stringify(
  question,
  null,
  2
)}

CANDIDATE ANSWER:
${cleanText(
  answer,
  10000
)}

CODING EXECUTION RESULT:
${JSON.stringify(
  codingResult || null,
  null,
  2
)}

Evaluate against the actual question.

Do not score merely because the answer is long.

For coding answers:
- consider execution results
- correctness
- failed tests
- passed tests
- edge cases
- time complexity
- space complexity
- readability
- language correctness
- practical reasoning

Return ONLY JSON:

{
  "score": 0,
  "correctness": 0,
  "relevance": 0,
  "technical_knowledge": 0,
  "problem_solving": 0,
  "communication": 0,
  "practical_knowledge": 0,
  "confidence": 0,
  "depth": 0,
  "strengths": [],
  "weaknesses": [],
  "feedback": "",
  "improved_answer": "",
  "human_review_required": false
}

All numeric scores must be between 0 and 100.

Do not evaluate protected characteristics.
`.trim();
}

async function evaluateAnswer({
  question = {},
  answer = "",
  candidate = {},
  job = {},
  stage = "",
  codingResult = null
}) {
  const prompt =
    buildEvaluationPrompt({
      question,
      answer,
      candidate,
      job,
      stage,
      codingResult
    });

  const raw =
    await gemini(
      prompt,
      true
    );

  const result =
    parseJson(raw);

  if (
    !result ||
    typeof result !== "object"
  ) {
    throw new Error(
      "Gemini returned an invalid evaluation."
    );
  }

  const clamp =
    value =>
      Math.max(
        0,
        Math.min(
          100,
          number(value, 0)
        )
      );

  return {
    score:
      clamp(result.score),

    correctness:
      clamp(result.correctness),

    relevance:
      clamp(result.relevance),

    technical_knowledge:
      clamp(
        result.technical_knowledge
      ),

    problem_solving:
      clamp(
        result.problem_solving
      ),

    communication:
      clamp(
        result.communication
      ),

    practical_knowledge:
      clamp(
        result.practical_knowledge
      ),

    confidence:
      clamp(result.confidence),

    depth:
      clamp(result.depth),

    strengths:
      array(result.strengths)
        .map(v =>
          cleanText(v, 1000)
        )
        .slice(0, 8),

    weaknesses:
      array(result.weaknesses)
        .map(v =>
          cleanText(v, 1000)
        )
        .slice(0, 8),

    feedback:
      cleanText(
        result.feedback,
        4000
      ),

    improved_answer:
      cleanText(
        result.improved_answer,
        4000
      ),

    human_review_required:
      Boolean(
        result.human_review_required
      )
  };
}

/* =========================================================
   FOLLOW-UP QUESTION
========================================================= */

async function followUp({
  question = {},
  answer = "",
  candidate = {},
  job = {},
  previousQuestions = []
}) {
  const prompt = `
Generate ONE follow-up interview question.

JOB:
${JSON.stringify(
  buildJobContext(job),
  null,
  2
)}

CANDIDATE:
${JSON.stringify(
  buildCandidateContext(candidate),
  null,
  2
)}

ORIGINAL QUESTION:
${JSON.stringify(
  question,
  null,
  2
)}

CANDIDATE ANSWER:
${cleanText(
  answer,
  8000
)}

PREVIOUS QUESTIONS:
${JSON.stringify(
  previousQuestions,
  null,
  2
)}

Rules:

- Relate directly to the candidate's answer.
- Probe deeper understanding.
- Do not repeat previous questions.
- Remain relevant to the candidate's profile.
- Remain relevant to the job.
- Do not ask protected-characteristic questions.

Return ONLY JSON:

{
  "shouldAsk": true,
  "question": "",
  "reason": "",
  "skill": ""
}
`.trim();

  const raw =
    await gemini(
      prompt,
      true
    );

  const result =
    parseJson(raw);

  if (!result) {
    return {
      shouldAsk: false,
      question: "",
      reason: "",
      skill: ""
    };
  }

  return {
    shouldAsk:
      Boolean(
        result.shouldAsk
      ),

    question:
      cleanText(
        result.question,
        4000
      ),

    reason:
      cleanText(
        result.reason,
        2000
      ),

    skill:
      cleanText(
        result.skill,
        300
      )
  };
}

/* =========================================================
   FINAL SUMMARY
========================================================= */

async function summarize({
  candidate = {},
  job = {},
  answers = [],
  evaluations = [],
  codingResults = []
}) {
  const prompt = `
Create a final AI interview summary.

JOB:
${JSON.stringify(
  buildJobContext(job),
  null,
  2
)}

CANDIDATE:
${JSON.stringify(
  buildCandidateContext(candidate),
  null,
  2
)}

ANSWERS:
${JSON.stringify(
  answers,
  null,
  2
)}

EVALUATIONS:
${JSON.stringify(
  evaluations,
  null,
  2
)}

CODING RESULTS:
${JSON.stringify(
  codingResults,
  null,
  2
)}

Create a fair decision-support report.

Do not make a hiring decision based on protected characteristics.

Section scores must be based on the actual
evaluations available for each section.

Return ONLY JSON:

{
  "overall_score": 0,
  "technical_score": 0,
  "coding_score": 0,
  "communication_score": 0,
  "behavioral_score": 0,
  "scenario_score": 0,
  "problem_solving_score": 0,
  "practical_knowledge_score": 0,
  "strengths": [],
  "development_areas": [],
  "summary": "",
  "recommendation": "Needs Human Review",
  "human_review_required": true
}
`.trim();

  const raw =
    await gemini(
      prompt,
      true
    );

  const result =
    parseJson(raw);

  if (!result) {
    throw new Error(
      "Gemini returned invalid final evaluation."
    );
  }

  const clamp =
    value =>
      Math.max(
        0,
        Math.min(
          100,
          number(value, 0)
        )
      );

  return {
    overall_score:
      clamp(
        result.overall_score
      ),

    technical_score:
      clamp(
        result.technical_score
      ),

    coding_score:
      clamp(
        result.coding_score
      ),

    communication_score:
      clamp(
        result.communication_score
      ),

    behavioral_score:
      clamp(
        result.behavioral_score
      ),

    scenario_score:
      clamp(
        result.scenario_score
      ),

    problem_solving_score:
      clamp(
        result.problem_solving_score
      ),

    practical_knowledge_score:
      clamp(
        result.practical_knowledge_score
      ),

    strengths:
      array(result.strengths)
        .map(v =>
          cleanText(v, 1000)
        )
        .slice(0, 10),

    development_areas:
      array(
        result.development_areas
      )
        .map(v =>
          cleanText(v, 1000)
        )
        .slice(0, 10),

    summary:
      cleanText(
        result.summary,
        6000
      ),

    recommendation:
      cleanText(
        result.recommendation ||
        "Needs Human Review",
        100
      ),

    human_review_required:
      true
  };
}

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  gemini,

  generateQuestions,

  evaluateAnswer,

  followUp,

  summarize,

  calculateCounts,

  buildCandidateContext,

  buildJobContext
};