import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import interviewService from "../../services/interviewService";
import evaluationService from "../../services/evaluationService";

function InterviewResult() {
  const navigate = useNavigate();

  const [interviewId, setInterviewId] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * Get candidate's interviews.
         */
        const interviewData =
          await interviewService.getMyInterviews();

        const interviews = Array.isArray(interviewData)
          ? interviewData
          : interviewData?.interviews ||
            interviewData?.data ||
            [];

        if (!interviews.length) {
          throw new Error(
            "No interview information was found."
          );
        }

        /*
         * Find the most recent/completed interview.
         */
        const completedInterview =
          [...interviews]
            .reverse()
            .find(
              (item) =>
                item.status === "completed" ||
                item.status === "evaluation" ||
                item.status === "evaluated"
            ) || interviews[interviews.length - 1];

        const id =
          completedInterview?._id ||
          completedInterview?.id ||
          completedInterview?.interviewId;

        if (!id) {
          throw new Error(
            "Interview ID could not be found."
          );
        }

        setInterviewId(id);

        /*
         * Get final evaluation score.
         */
        const scoreData =
          await evaluationService.getFinalScore(id);

        const finalResult =
          scoreData?.score ||
          scoreData?.result ||
          scoreData?.data ||
          scoreData;

        setResult(finalResult);
      } catch (error) {
        console.error(
          "Unable to load interview result:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the interview result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, []);

  const handleViewReport = () => {
    if (interviewId) {
      navigate(
        `/report/interview?interviewId=${interviewId}`
      );
    } else {
      navigate("/report/interview");
    }
  };

  /*
   * Support common backend field names.
   */
  const technical =
    result?.technical ??
    result?.technicalScore ??
    result?.technical_score ??
    "Pending";

  const practical =
    result?.practicalKnowledge ??
    result?.practicalKnowledgeScore ??
    result?.practical_score ??
    "Pending";

  const problemSolving =
    result?.problemSolving ??
    result?.problemSolvingScore ??
    result?.problem_solving_score ??
    "Pending";

  const communication =
    result?.communication ??
    result?.communicationScore ??
    result?.communication_score ??
    "Pending";

  const behavioral =
    result?.behavioral ??
    result?.behavioralScore ??
    result?.behavioral_score ??
    "Pending";

  const roleFit =
    result?.roleFit ??
    result?.roleFitScore ??
    result?.role_fit_score ??
    "Pending";

  const overallScore =
    result?.overallScore ??
    result?.overall ??
    result?.finalScore ??
    result?.final_score ??
    "Pending";

  const recommendation =
    result?.recommendation ??
    result?.aiRecommendation ??
    result?.finalRecommendation ??
    "Pending";

  return (
    <div className="verification-page">
      <div className="verification-card interview-result-card">

        {/* Header */}

        <div className="verification-icon">
          📊
        </div>

        <h1>
          Interview Result
        </h1>

        <p>
          Your interview has been completed successfully.
          The final evaluation is generated from your
          interview responses and assessment results.
        </p>


        {/* Loading */}

        {loading && (
          <div className="verification-notice">
            <strong>
              Loading AI Evaluation
            </strong>

            <p>
              Please wait while your final evaluation
              is retrieved.
            </p>
          </div>
        )}


        {/* Error */}

        {errorMessage && (
          <div className="verification-error">
            {errorMessage}
          </div>
        )}


        {!loading && (
          <>

            {/* Evaluation Status */}

            <div className="verification-notice">

              <strong>
                AI Evaluation Result
              </strong>

              <p>
                Your technical, practical, problem-solving,
                communication and behavioral performance
                has been evaluated.
              </p>

            </div>


            {/* Score Categories */}

            <div className="result-grid">

              <div className="result-score">
                <span>
                  Technical
                </span>

                <strong>
                  {technical}
                </strong>
              </div>


              <div className="result-score">
                <span>
                  Practical Knowledge
                </span>

                <strong>
                  {practical}
                </strong>
              </div>


              <div className="result-score">
                <span>
                  Problem Solving
                </span>

                <strong>
                  {problemSolving}
                </strong>
              </div>


              <div className="result-score">
                <span>
                  Communication
                </span>

                <strong>
                  {communication}
                </strong>
              </div>


              <div className="result-score">
                <span>
                  Behavioral
                </span>

                <strong>
                  {behavioral}
                </strong>
              </div>


              <div className="result-score">
                <span>
                  Role Fit
                </span>

                <strong>
                  {roleFit}
                </strong>
              </div>

            </div>


            {/* Overall Score */}

            <div className="overall-score">

              <span>
                Overall Score
              </span>

              <strong>
                {overallScore}
              </strong>

            </div>


            {/* Recommendation */}

            <div className="recommendation-box">

              <span>
                AI Recommendation
              </span>

              <strong>
                {recommendation}
              </strong>

              <p>
                This recommendation is intended to
                support HR decision-making and is not
                an automatic hiring decision.
              </p>

            </div>


            {/* Report */}

            <button
              type="button"
              onClick={handleViewReport}
              disabled={!interviewId}
            >
              View Detailed AI Report
            </button>


            {/* Evaluation Information */}

            <div className="verification-info">

              <h3>
                Evaluation Information
              </h3>

              <ul
                style={{
                  textAlign: "left",
                  lineHeight: "1.8",
                }}
              >

                <li>
                  Technical and practical knowledge
                  are evaluated.
                </li>

                <li>
                  Problem-solving performance
                  is assessed.
                </li>

                <li>
                  Communication and behavioral
                  performance are scored.
                </li>

                <li>
                  Role fit considers the candidate's
                  profile, skills, resume and job
                  requirements.
                </li>

                <li>
                  The final recommendation supports
                  HR review and is not an automatic
                  hiring decision.
                </li>

              </ul>

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default InterviewResult;