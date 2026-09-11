
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import interviewService from "../../services/interviewService";
import reportService from "../../services/reportService";

function InterviewReport() {
  const navigate = useNavigate();
  const location = useLocation();

  const [interviewId, setInterviewId] = useState(null);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * First try to get interviewId from URL.
         */
        const queryParams = new URLSearchParams(
          location.search
        );

        let id = queryParams.get("interviewId");

        /*
         * If URL does not contain interviewId,
         * get the candidate's interviews.
         */
        if (!id) {
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

          const completedInterview =
            [...interviews]
              .reverse()
              .find(
                (item) =>
                  item.status === "completed" ||
                  item.status === "evaluation" ||
                  item.status === "evaluated"
              ) || interviews[interviews.length - 1];

          id =
            completedInterview?._id ||
            completedInterview?.id ||
            completedInterview?.interviewId;
        }

        if (!id) {
          throw new Error(
            "Interview ID could not be found."
          );
        }

        setInterviewId(id);

        /*
         * Request the generated interview report.
         */
        const reportData =
          await reportService.getInterviewReport(id);

        const loadedReport =
          reportData?.report ||
          reportData?.data ||
          reportData;

        setReport(loadedReport);
      } catch (error) {
        console.error(
          "Unable to load interview report:",
          error
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load the interview report."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [location.search]);

  /*
   * Common backend field-name support.
   */
  const candidate =
    report?.candidate ||
    report?.candidateInfo ||
    {};

  const candidateName =
    candidate?.name ||
    report?.candidateName ||
    "Candidate";

  const candidateRole =
    candidate?.role ||
    candidate?.targetRole ||
    report?.role ||
    "Target Role";

  const candidateExperience =
    candidate?.experience ||
    candidate?.yearsOfExperience ||
    report?.experience ||
    "Not available";

  const summary =
    report?.summary ||
    report?.interviewSummary ||
    report?.overallSummary ||
    "The final interview summary will be available after AI evaluation.";

  const scores =
    report?.scores ||
    report?.skillScores ||
    {};

  const technical =
    scores?.technical ??
    report?.technicalScore ??
    "Pending";

  const practical =
    scores?.practical ??
    scores?.practicalKnowledge ??
    report?.practicalKnowledgeScore ??
    "Pending";

  const problemSolving =
    scores?.problemSolving ??
    report?.problemSolvingScore ??
    "Pending";

  const communication =
    scores?.communication ??
    report?.communicationScore ??
    "Pending";

  const behavioral =
    scores?.behavioral ??
    report?.behavioralScore ??
    "Pending";

  const roleFit =
    scores?.roleFit ??
    report?.roleFitScore ??
    "Pending";

  const overall =
    report?.overallScore ??
    scores?.overall ??
    report?.finalScore ??
    "Pending";

  const recommendation =
    report?.recommendation ||
    report?.aiRecommendation ||
    report?.finalRecommendation ||
    "Pending";

  const strengths =
    report?.strengths ||
    report?.keyStrengths ||
    [];

  const weaknesses =
    report?.weaknesses ||
    report?.areasForImprovement ||
    [];

  const duration =
    report?.duration ||
    report?.interviewDuration ||
    "Not available";

  const questionCount =
    report?.questionCount ??
    report?.totalQuestions ??
    "Not available";

  const handleBackToDashboard = () => {
    navigate("/candidate/dashboard");
  };

  return (
    <div className="report-page">

      {/* Header */}

      <header className="report-header">

        <div>
          <h1>
            AI Interview Report
          </h1>

          <p>
            Detailed Interview Evaluation
          </p>
        </div>

        <button
          type="button"
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </button>

      </header>


      <main className="report-content">

        {/* Loading */}

        {loading && (
          <section className="report-notice">

            <strong>
              Loading AI Interview Report
            </strong>

            <p>
              Please wait while the evaluation report
              is retrieved from the backend.
            </p>

          </section>
        )}


        {/* Error */}

        {errorMessage && (
          <section className="report-notice">

            <strong>
              Unable to Load Report
            </strong>

            <p>
              {errorMessage}
            </p>

          </section>
        )}


        {!loading && report && (
          <>

            {/* Candidate Information */}

            <section className="report-card">

              <h2>
                Candidate Information
              </h2>

              <div className="report-info-grid">

                <div>
                  <span>
                    Name
                  </span>

                  <strong>
                    {candidateName}
                  </strong>
                </div>

                <div>
                  <span>
                    Role
                  </span>

                  <strong>
                    {candidateRole}
                  </strong>
                </div>

                <div>
                  <span>
                    Experience
                  </span>

                  <strong>
                    {candidateExperience}
                  </strong>
                </div>

              </div>

            </section>


            {/* Interview Summary */}

            <section className="report-card">

              <h2>
                Interview Summary
              </h2>

              <p>
                {summary}
              </p>

              <div className="report-info-grid">

                <div>
                  <span>
                    Interview Duration
                  </span>

                  <strong>
                    {duration}
                  </strong>
                </div>

                <div>
                  <span>
                    Questions
                  </span>

                  <strong>
                    {questionCount}
                  </strong>
                </div>

              </div>

            </section>


            {/* Skill Scores */}

            <section className="report-card">

              <h2>
                Skill Scores
              </h2>

              <div className="report-score-grid">

                <div className="report-score">
                  <span>
                    Technical
                  </span>

                  <strong>
                    {technical}
                  </strong>
                </div>

                <div className="report-score">
                  <span>
                    Practical Knowledge
                  </span>

                  <strong>
                    {practical}
                  </strong>
                </div>

                <div className="report-score">
                  <span>
                    Problem Solving
                  </span>

                  <strong>
                    {problemSolving}
                  </strong>
                </div>

                <div className="report-score">
                  <span>
                    Communication
                  </span>

                  <strong>
                    {communication}
                  </strong>
                </div>

                <div className="report-score">
                  <span>
                    Behavioral
                  </span>

                  <strong>
                    {behavioral}
                  </strong>
                </div>

                <div className="report-score">
                  <span>
                    Role Fit
                  </span>

                  <strong>
                    {roleFit}
                  </strong>
                </div>

              </div>

            </section>


            {/* Overall Evaluation */}

            <section className="report-card">

              <h2>
                Overall Evaluation
              </h2>

              <div className="overall-report-score">

                <span>
                  Overall Score
                </span>

                <strong>
                  {overall}
                </strong>

              </div>

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

            </section>


            {/* Strengths */}

            {Array.isArray(strengths) &&
              strengths.length > 0 && (
                <section className="report-card">

                  <h2>
                    Key Strengths
                  </h2>

                  <ul className="report-list">

                    {strengths.map(
                      (strength, index) => (
                        <li key={index}>
                          {typeof strength ===
                          "string"
                            ? strength
                            : strength?.description ||
                              strength?.text ||
                              JSON.stringify(
                                strength
                              )}
                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}


            {/* Areas for Improvement */}

            {Array.isArray(weaknesses) &&
              weaknesses.length > 0 && (
                <section className="report-card">

                  <h2>
                    Areas for Improvement
                  </h2>

                  <ul className="report-list">

                    {weaknesses.map(
                      (weakness, index) => (
                        <li key={index}>
                          {typeof weakness ===
                          "string"
                            ? weakness
                            : weakness?.description ||
                              weakness?.text ||
                              JSON.stringify(
                                weakness
                              )}
                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}


            {/* Evaluation Breakdown */}

            <section className="report-card">

              <h2>
                Evaluation Breakdown
              </h2>

              <ul className="report-list">

                <li>
                  <strong>
                    Technical Knowledge:
                  </strong>{" "}
                  Evaluation of technical concepts
                  and knowledge relevant to the
                  target role.
                </li>

                <li>
                  <strong>
                    Practical Knowledge:
                  </strong>{" "}
                  Evaluation of the candidate's
                  ability to apply knowledge to
                  practical situations.
                </li>

                <li>
                  <strong>
                    Problem Solving:
                  </strong>{" "}
                  Evaluation of analytical thinking,
                  reasoning and approach to solving
                  problems.
                </li>

                <li>
                  <strong>
                    Communication:
                  </strong>{" "}
                  Evaluation of clarity, relevance,
                  explanation and communication
                  effectiveness.
                </li>

                <li>
                  <strong>
                    Behavioral Performance:
                  </strong>{" "}
                  Evaluation of workplace behavior,
                  decision-making, adaptability and
                  teamwork.
                </li>

                <li>
                  <strong>
                    Role Fit:
                  </strong>{" "}
                  Evaluation of alignment between
                  candidate skills, experience,
                  resume and job requirements.
                </li>

              </ul>

            </section>


            {/* AI Report Status */}

            <section className="report-card">

              <h2>
                AI Report Generation
              </h2>

              <div className="verification-success">

                <strong>
                  AI interview report loaded
                  successfully.
                </strong>

                <p>
                  The report above contains the
                  evaluation information returned
                  by the backend AI evaluation and
                  reporting services.
                </p>

              </div>

            </section>


            {/* Human Review Notice */}

            <section className="report-notice">

              <strong>
                Important:
              </strong>

              <p>
                The AI-generated evaluation and
                recommendation are decision-support
                information for HR review and should
                not be treated as an automatic hiring
                decision.
              </p>

            </section>

          </>
        )}

      </main>
    </div>
  );
}

export default InterviewReport;

