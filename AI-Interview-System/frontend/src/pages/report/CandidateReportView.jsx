
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import interviewService from "../../services/interviewService";
import reportService from "../../services/reportService";

function CandidateReportView() {
  const location = useLocation();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadCandidateReport = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const params = new URLSearchParams(
          location.search
        );

        let id = params.get("interviewId");

        /*
         * If interviewId is not present in the URL,
         * get the candidate's latest interview.
         */
        if (!id) {
          const interviews =
            await interviewService.getMyInterviews();

          const list =
            interviews?.interviews ||
            interviews?.data ||
            interviews ||
            [];

          if (Array.isArray(list) && list.length > 0) {
            const completedInterview =
              list.find(
                (item) =>
                  String(item?.status).toLowerCase() ===
                    "completed" ||
                  String(item?.status).toLowerCase() ===
                    "ai evaluation"
              ) || list[0];

            id =
              completedInterview?._id ||
              completedInterview?.id ||
              completedInterview?.interviewId;
          }
        }

        if (!id) {
          throw new Error(
            "Interview report could not be found."
          );
        }

        setInterviewId(id);

        const data =
          await reportService.getInterviewReport(id);

        const loadedReport =
          data?.report ||
          data?.data ||
          data;

        if (!loadedReport) {
          throw new Error(
            "No interview report was returned by the backend."
          );
        }

        setReport(loadedReport);
      } catch (error) {
        console.error(
          "Unable to load candidate report:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load your interview report."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCandidateReport();
  }, [location.search]);


  if (loading) {
    return (
      <div className="verification-page">
        <div className="verification-card">

          <div className="verification-icon">
            📄
          </div>

          <h1>
            AI Interview Report
          </h1>

          <div className="verification-notice">
            <strong>
              Loading your report...
            </strong>

            <p>
              Please wait while your interview
              evaluation is retrieved.
            </p>
          </div>

        </div>
      </div>
    );
  }


  if (errorMessage) {
    return (
      <div className="verification-page">
        <div className="verification-card">

          <div className="verification-icon">
            ⚠️
          </div>

          <h1>
            Report Unavailable
          </h1>

          <div className="verification-error">
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/candidate/dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }


  if (!report) {
    return null;
  }


  const candidate =
    report?.candidate ||
    report?.candidateInfo ||
    {};

  const skillScores =
    report?.skillScores ||
    report?.skills ||
    report?.skillPerformance ||
    [];

  const strengths =
    report?.strengths || [];

  const weaknesses =
    report?.weaknesses ||
    report?.areasForImprovement ||
    [];

  const evaluation =
    report?.evaluationBreakdown ||
    report?.evaluation ||
    {};

  const overallScore =
    report?.overallScore ??
    report?.finalScore ??
    report?.score ??
    0;

  const recommendation =
    report?.recommendation ||
    report?.finalRecommendation ||
    "Pending HR Review";

  const summary =
    report?.summary ||
    report?.overallSummary ||
    report?.aiSummary ||
    "No summary is available.";

  const duration =
    report?.duration ||
    report?.interviewDuration ||
    "N/A";

  const questionCount =
    report?.questionCount ??
    report?.totalQuestions ??
    0;


  const renderScore = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    const number = Number(value);

    return Number.isNaN(number)
      ? value
      : `${number.toFixed(1)}%`;
  };


  const renderList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <p>
          No information available.
        </p>
      );
    }

    return (
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {typeof item === "string"
              ? item
              : item?.name ||
                item?.skill ||
                item?.text ||
                item?.description ||
                JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  };


  return (
    <div className="verification-page">

      <div
        className="verification-card"
        style={{
          maxWidth: "950px",
        }}
      >

        {/* Header */}

        <div className="verification-icon">
          📊
        </div>

        <h1>
          AI Interview Report
        </h1>

        <p>
          Your interview evaluation and performance
          summary are shown below.
        </p>


        {/* Candidate Information */}

        <div className="verification-info">

          <h2>
            Candidate Information
          </h2>

          <ul>

            <li>
              <strong>Name:</strong>{" "}
              {candidate?.name ||
                report?.candidateName ||
                "N/A"}
            </li>

            <li>
              <strong>Email:</strong>{" "}
              {candidate?.email ||
                report?.candidateEmail ||
                "N/A"}
            </li>

            <li>
              <strong>Role:</strong>{" "}
              {candidate?.role ||
                report?.role ||
                report?.jobTitle ||
                "N/A"}
            </li>

            <li>
              <strong>Experience:</strong>{" "}
              {candidate?.experience ||
                report?.experience ||
                "N/A"}
            </li>

          </ul>

        </div>


        {/* Interview Summary */}

        <div className="verification-info">

          <h2>
            Interview Summary
          </h2>

          <p>
            {summary}
          </p>

          <ul>

            <li>
              <strong>Interview Duration:</strong>{" "}
              {duration}
            </li>

            <li>
              <strong>Total Questions:</strong>{" "}
              {questionCount}
            </li>

          </ul>

        </div>


        {/* Overall Score */}

        <div className="verification-info">

          <h2>
            Overall Score
          </h2>

          <div
            style={{
              fontSize: "44px",
              fontWeight: "700",
              margin: "15px 0",
            }}
          >
            {renderScore(overallScore)}
          </div>

          <div className="verification-success">

            <strong>
              Recommendation: {recommendation}
            </strong>

          </div>

        </div>


        {/* Skill Scores */}

        <div className="verification-info">

          <h2>
            Skill Performance
          </h2>

          {Array.isArray(skillScores) &&
          skillScores.length > 0 ? (
            <div>

              {skillScores.map(
                (skill, index) => {

                  const name =
                    typeof skill === "string"
                      ? skill
                      : skill?.skill ||
                        skill?.name ||
                        skill?.skillName ||
                        `Skill ${index + 1}`;

                  const score =
                    typeof skill === "object"
                      ? skill?.score ??
                        skill?.percentage ??
                        skill?.rating
                      : null;

                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: "15px",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          marginBottom: "5px",
                        }}
                      >

                        <strong>
                          {name}
                        </strong>

                        <span>
                          {renderScore(score)}
                        </span>

                      </div>

                      <div className="progress-bar">

                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              Math.min(
                                Math.max(
                                  Number(score) || 0,
                                  0
                                ),
                                100
                              )
                            }%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <p>
              Skill-level scores are not available.
            </p>
          )}

        </div>


        {/* Evaluation Breakdown */}

        <div className="verification-info">

          <h2>
            Evaluation Breakdown
          </h2>

          <ul>

            <li>
              <strong>
                Technical Knowledge:
              </strong>{" "}
              {renderScore(
                evaluation?.technical ??
                  report?.technicalScore
              )}
            </li>

            <li>
              <strong>
                Practical Knowledge:
              </strong>{" "}
              {renderScore(
                evaluation?.practical ??
                  report?.practicalScore
              )}
            </li>

            <li>
              <strong>
                Problem Solving:
              </strong>{" "}
              {renderScore(
                evaluation?.problemSolving ??
                  report?.problemSolvingScore
              )}
            </li>

            <li>
              <strong>
                Communication:
              </strong>{" "}
              {renderScore(
                evaluation?.communication ??
                  report?.communicationScore
              )}
            </li>

            <li>
              <strong>
                Behavioral:
              </strong>{" "}
              {renderScore(
                evaluation?.behavioral ??
                  report?.behavioralScore
              )}
            </li>

            <li>
              <strong>
                Role Fit:
              </strong>{" "}
              {renderScore(
                evaluation?.roleFit ??
                  report?.roleFitScore
              )}
            </li>

          </ul>

        </div>


        {/* Strengths */}

        <div className="verification-info">

          <h2>
            Strengths
          </h2>

          {renderList(strengths)}

        </div>


        {/* Areas for Improvement */}

        <div className="verification-info">

          <h2>
            Areas for Improvement
          </h2>

          {renderList(weaknesses)}

        </div>


        {/* Human Review Notice */}

        <div className="verification-notice">

          <h3>
            Human Review
          </h3>

          <p>
            This AI-generated report is provided as
            decision-support information. The final
            hiring decision should be made by authorized
            HR personnel after reviewing the complete
            candidate profile and interview results.
          </p>

          <p>
            The AI recommendation does not automatically
            select or reject a candidate.
          </p>

        </div>


        {/* Actions */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >

          <button
            type="button"
            onClick={() =>
              navigate("/candidate/dashboard")
            }
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                interviewId
                  ? `/report/interview?interviewId=${interviewId}`
                  : "/report/interview"
              )
            }
          >
            View Full Report
          </button>

        </div>

      </div>

    </div>
  );
}

export default CandidateReportView;

