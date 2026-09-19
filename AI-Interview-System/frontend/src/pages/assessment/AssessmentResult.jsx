
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import codingService from "../../services/codingService";

function AssessmentResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const assessmentId =
          localStorage.getItem("codingAssessmentId") ||
          localStorage.getItem("assessmentId");

        if (!assessmentId) {
          throw new Error(
            "Assessment result could not be found."
          );
        }

        const data =
          await codingService.getResult(assessmentId);

        const loadedResult =
          data?.result ||
          data?.data ||
          data;

        setResult(loadedResult);
      } catch (error) {
        console.error(
          "Unable to load assessment result:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the assessment result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, []);

  const score =
    result?.score ??
    result?.totalScore ??
    result?.percentage ??
    0;

  const correctAnswers =
    result?.correctAnswers ??
    result?.correct ??
    0;

  const totalQuestions =
    result?.totalQuestions ??
    result?.questionCount ??
    0;

  const percentage =
    result?.percentage ??
    (totalQuestions > 0
      ? (correctAnswers / totalQuestions) * 100
      : score);

  const status =
    result?.status ||
    result?.result ||
    (percentage >= 60
      ? "Passed"
      : "Needs Improvement");

  const getStatusClass = () => {
    if (
      String(status).toLowerCase().includes("pass")
    ) {
      return "verification-success";
    }

    return "verification-notice";
  };

  return (
    <div className="verification-page">

      <div className="verification-card">

        <div className="verification-icon">
          📊
        </div>

        <h1>
          Assessment Result
        </h1>

        <p>
          Your technical assessment result is
          shown below.
        </p>

        {loading && (
          <div className="verification-notice">
            <strong>
              Loading Result
            </strong>

            <p>
              Please wait while your assessment
              result is retrieved.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="verification-error">
            {errorMessage}
          </div>
        )}

        {!loading && result && (
          <>

            {/* Overall Score */}

            <div className="verification-info">

              <h2>
                Overall Score
              </h2>

              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "700",
                  margin: "15px 0",
                }}
              >
                {Number(percentage).toFixed(1)}%
              </div>

              <div className={getStatusClass()}>
                <strong>
                  {status}
                </strong>
              </div>

            </div>


            {/* Assessment Breakdown */}

            <div className="verification-info">

              <h3>
                Assessment Breakdown
              </h3>

              <ul>

                <li>
                  Total Questions:{" "}
                  {totalQuestions}
                </li>

                <li>
                  Correct Answers:{" "}
                  {correctAnswers}
                </li>

                <li>
                  Score:{" "}
                  {Number(score).toFixed(1)}
                </li>

                {result?.wrongAnswers !==
                  undefined && (
                  <li>
                    Incorrect Answers:{" "}
                    {result.wrongAnswers}
                  </li>
                )}

                {result?.timeTaken !==
                  undefined && (
                  <li>
                    Time Taken:{" "}
                    {result.timeTaken}
                  </li>
                )}

              </ul>

            </div>


            {/* Evaluation */}

            {(result?.evaluation ||
              result?.feedback ||
              result?.summary) && (
              <div className="verification-notice">

                <h3>
                  Evaluation
                </h3>

                <p>
                  {result.evaluation ||
                    result.feedback ||
                    result.summary}
                </p>

              </div>
            )}


            {/* Important Notice */}

            <div className="verification-notice">

              <strong>
                Important
              </strong>

              <p>
                This assessment result is one part
                of the overall AI interview evaluation.
                The final candidate recommendation
                can also consider interview answers,
                skills, communication, behavioral
                assessment, practical knowledge and
                role fit.
              </p>

              <p>
                AI results are decision-support
                information and should be reviewed
                by authorized HR personnel.
              </p>

            </div>


            {/* Continue */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/interview/behavioral-assessment"
                )
              }
            >
              Continue to Behavioral Assessment
            </button>

          </>
        )}

      </div>

    </div>
  );
}

export default AssessmentResult;

