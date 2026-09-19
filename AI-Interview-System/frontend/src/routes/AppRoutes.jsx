import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";

// Candidate pages
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateProfile from "../pages/candidate/CandidateProfile";
import ResumeUpload from "../pages/candidate/ResumeUpload";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import JobManagement from "../pages/admin/JobManagement";
import CreateJob from "../pages/admin/CreateJob";
import EditJob from "../pages/admin/EditJob";
import CandidateManagement from "../pages/admin/CandidateManagement";
import CandidateDetails from "../pages/admin/CandidateDetails";
import InterviewManagement from "../pages/admin/InterviewManagement";
import InterviewConfiguration from "../pages/admin/InterviewConfiguration";
import VerificationLogs from "../pages/admin/VerificationLogs";
import InterviewReports from "../pages/admin/InterviewReports";
import AuditLogs from "../pages/admin/AuditLogs";

// Layout
import AdminLayout from "../layouts/AdminLayout";

// Interview pages
import CandidateVerification from "../pages/interview/CandidateVerification";
import CameraPermission from "../pages/interview/CameraPermission";
import FaceVerification from "../pages/interview/FaceVerification";
import InterviewInstructions from "../pages/interview/InterviewInstructions";
import AIInterview from "../pages/interview/AIInterview";
import TechnicalAssessment from "../pages/interview/TechnicalAssessment";
import BehavioralAssessment from "../pages/interview/BehavioralAssessment";
import CommunicationAssessment from "../pages/interview/CommunicationAssessment";
import InterviewComplete from "../pages/interview/InterviewComplete";
import InterviewResult from "../pages/interview/InterviewResult";

// Report pages
import InterviewReport from "../pages/report/InterviewReport";

import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================
            CANDIDATE
        ========================= */}

        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/resume"
          element={
            <ProtectedRoute allowedRole="candidate">
              <ResumeUpload />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN LAYOUT
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* Admin Dashboard */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />


          {/* Job Management */}

          <Route
            path="jobs"
            element={<JobManagement />}
          />

          <Route
            path="jobs/create"
            element={<CreateJob />}
          />

          <Route
            path="jobs/edit/:jobId"
            element={<EditJob />}
          />


          {/* Candidate Management */}

          <Route
            path="candidates"
            element={<CandidateManagement />}
          />

          <Route
            path="candidates/:candidateId"
            element={<CandidateDetails />}
          />


          {/* Interview Management */}

          <Route
            path="interviews"
            element={<InterviewManagement />}
          />

          <Route
            path="interview-configuration"
            element={<InterviewConfiguration />}
          />


          {/* Verification */}

          <Route
            path="verification-logs"
            element={<VerificationLogs />}
          />


          {/* Reports */}

          <Route
            path="reports"
            element={<InterviewReports />}
          />


          {/* Audit Logs */}

          <Route
            path="audit-logs"
            element={<AuditLogs />}
          />

        </Route>


        {/* =========================
            CANDIDATE INTERVIEW FLOW
        ========================= */}

        <Route
          path="/interview/verification"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateVerification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/camera-permission"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CameraPermission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/face-verification"
          element={
            <ProtectedRoute allowedRole="candidate">
              <FaceVerification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/instructions"
          element={
            <ProtectedRoute allowedRole="candidate">
              <InterviewInstructions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/ai-interview"
          element={
            <ProtectedRoute allowedRole="candidate">
              <AIInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/technical-assessment"
          element={
            <ProtectedRoute allowedRole="candidate">
              <TechnicalAssessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/behavioral-assessment"
          element={
            <ProtectedRoute allowedRole="candidate">
              <BehavioralAssessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/communication-assessment"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CommunicationAssessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/complete"
          element={
            <ProtectedRoute allowedRole="candidate">
              <InterviewComplete />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/result"
          element={
            <ProtectedRoute allowedRole="candidate">
              <InterviewResult />
            </ProtectedRoute>
          }
        />


        {/* =========================
            CANDIDATE REPORT
        ========================= */}

        <Route
          path="/report/interview"
          element={
            <ProtectedRoute allowedRole="candidate">
              <InterviewReport />
            </ProtectedRoute>
          }
        />


        {/* =========================
            UNKNOWN URL
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;