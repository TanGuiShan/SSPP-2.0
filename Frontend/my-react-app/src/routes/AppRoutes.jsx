import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// NOTE: the ./react/spinner subpath export resolves inconsistently across
// bundlers, so we use the custom element tag directly. The component is
// registered globally by the SGDS theme import in main/global.css, so
// <sgds-spinner> works without a dedicated React wrapper import.
import ProtectedRoute from "./ProtectedRoute";

// Route-level lazy loading keeps the first download smaller. Each page is
// downloaded only when the user visits it.
const SchoolLayout = lazy(() => import("../layouts/SchoolLayout"));
const ArmyLayout = lazy(() => import("../layouts/ArmyLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const SchoolSignupPage = lazy(() => import("../pages/auth/SchoolSignupPage"));
const UnitSignupPage = lazy(() => import("../pages/auth/UnitSignupPage"));
const AmbassadorSignupPage = lazy(() => import("../pages/auth/AmbassadorSignupPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailPage"));
const PendingApprovalPage = lazy(() => import("../pages/auth/PendingApprovalPage"));

const ContactPage = lazy(() => import("../pages/public/ContactPage"));
const FeedbackPage = lazy(() => import("../pages/public/FeedbackPage"));

const SchoolDashboardPage = lazy(() => import("../pages/school/SchoolDashboardPage"));
const BrowseFormationsPage = lazy(() => import("../pages/school/BrowseFormationsPage"));
const InterestFormsPage = lazy(() => import("../pages/school/InterestFormsPage"));
const SchoolMatchesPage = lazy(() => import("../pages/school/SchoolMatchesPage"));
const SchoolProfilePage = lazy(() => import("../pages/school/SchoolProfilePage"));
const SchoolHelpPage = lazy(() => import("../pages/school/HelpSupportPage"));

const ArmyDashboardPage = lazy(() => import("../pages/army/ArmyDashboardPage"));
const AvailabilityPage = lazy(() => import("../pages/army/AvailabilityPage"));
const ArmyMatchesPage = lazy(() => import("../pages/army/ArmyMatchesPage"));
const BrowseRequestsPage = lazy(() => import("../pages/army/BrowseRequestsPage"));
const ArmyProfilePage = lazy(() => import("../pages/army/ArmyProfilePage"));
const AmbassadorProfilePage = lazy(() => import("../pages/army/AmbassadorProfilePage"));
const ArmyHelpPage = lazy(() => import("../pages/army/HelpSupportPage"));

const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const SchoolsPage = lazy(() => import("../pages/admin/SchoolsPage"));
const MatchManagementPage = lazy(() => import("../pages/admin/MatchManagementPage"));
const SupportQueriesPage = lazy(() => import("../pages/admin/SupportQueriesPage"));
const LogisticsPage = lazy(() => import("../pages/admin/LogisticsPage"));
const TierConfigPage = lazy(() => import("../pages/admin/TierConfigPage"));
const AdminProfilePage = lazy(() => import("../pages/admin/AdminProfilePage"));

function RouteLoadingFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <sgds-spinner size="lg"></sgds-spinner>
      <span>Loading page…</span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/school" element={<SchoolSignupPage />} />
        <Route path="/register/unit" element={<UnitSignupPage />} />
        <Route path="/register/ambassador" element={<AmbassadorSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />

        {/* Public utility pages — reachable from the footer by any user. */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        <Route
          path="/school"
          element={
            <ProtectedRoute allowedRoles={["school"]}>
              <SchoolLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SchoolDashboardPage />} />
          <Route path="formations" element={<BrowseFormationsPage />} />
          <Route path="interest-forms" element={<InterestFormsPage />} />
          <Route path="matches" element={<SchoolMatchesPage />} />
          <Route path="profile" element={<SchoolProfilePage />} />
          <Route path="help" element={<SchoolHelpPage />} />
        </Route>

        <Route
          path="/army"
          element={
            <ProtectedRoute allowedRoles={["army-unit", "army-ambassador"]}>
              <ArmyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ArmyDashboardPage />} />
          <Route path="profile" element={<ArmyProfilePage />} />
          <Route path="profile/ambassador" element={<AmbassadorProfilePage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="engagements" element={<ArmyMatchesPage />} />
          <Route path="requests" element={<BrowseRequestsPage />} />
          <Route path="help" element={<ArmyHelpPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="approvals" element={<MatchManagementPage />} />
          <Route path="matches" element={<MatchManagementPage />} />
          <Route path="logistics" element={<LogisticsPage />} />
          <Route path="tiers" element={<TierConfigPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="support" element={<SupportQueriesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
