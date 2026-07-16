import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import SchoolLayout from "../layouts/SchoolLayout";
import ArmyLayout from "../layouts/ArmyLayout";
import AdminLayout from "../layouts/AdminLayout";

// Auth
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SchoolSignupPage from "../pages/auth/SchoolSignupPage";
import UnitSignupPage from "../pages/auth/UnitSignupPage";
import AmbassadorSignupPage from "../pages/auth/AmbassadorSignupPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";

// School
import SchoolDashboardPage from "../pages/school/SchoolDashboardPage";
import BrowseFormationsPage from "../pages/school/BrowseFormationsPage";
import InterestFormsPage from "../pages/school/InterestFormsPage";
import SchoolMatchesPage from "../pages/school/SchoolMatchesPage";
import SchoolProfilePage from "../pages/school/SchoolProfilePage";
import SchoolHelpPage from "../pages/school/HelpSupportPage";

// Army
import ArmyDashboardPage from "../pages/army/ArmyDashboardPage";
import AvailabilityPage from "../pages/army/AvailabilityPage";
import ArmyMatchesPage from "../pages/army/ArmyMatchesPage";
import ArmyProfilePage from "../pages/army/ArmyProfilePage";
import AmbassadorProfilePage from "../pages/army/AmbassadorProfilePage";
import ArmyHelpPage from "../pages/army/HelpSupportPage";

// Admin
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import MatchManagementPage from "../pages/admin/MatchManagementPage";
import SupportQueriesPage from "../pages/admin/SupportQueriesPage";
import LogisticsPage from "../pages/admin/LogisticsPage";
import TierConfigPage from "../pages/admin/TierConfigPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/school" element={<SchoolSignupPage />} />
      <Route path="/register/unit" element={<UnitSignupPage />} />
      <Route path="/register/ambassador" element={<AmbassadorSignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* School */}
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

      {/* Army */}
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
        <Route path="help" element={<ArmyHelpPage />} />
      </Route>

      {/* Admin */}
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
        <Route path="approvals" element={<MatchManagementPage />} />
        <Route path="matches" element={<MatchManagementPage />} />
        <Route path="logistics" element={<LogisticsPage />} />
        <Route path="tiers" element={<TierConfigPage />} />
        <Route path="support" element={<SupportQueriesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
