import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import {
  DashboardIcon,
  ProfileIcon,
  CalendarIcon,
  EngagementIcon,
  HelpIcon,
} from "../assets/icons";

/**
 * Shared by both army roles. The two differ only in the profile label and
 * where that nav item points — everything else (dashboard, availability,
 * engagements, help) is common, so they share one layout rather than
 * duplicating it. If the roles diverge further, split this in two.
 */
const navFor = (isAmbassador) => [
  { label: "Dashboard", to: "/army/dashboard", icon: DashboardIcon },
  {
    label: isAmbassador ? "My Profile" : "My Unit Profile",
    to: isAmbassador ? "/army/profile/ambassador" : "/army/profile",
    icon: ProfileIcon,
  },
  { label: "Available Dates", to: "/army/availability", icon: CalendarIcon },
  { label: "My Engagements", to: "/army/engagements", icon: EngagementIcon },
  { label: "Help & Support", to: "/army/help", icon: HelpIcon },
];

export default function ArmyLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAmbassador = user?.role === "army-ambassador";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout
      navItems={navFor(isAmbassador)}
      brand="SSPP"
      roleLabel={isAmbassador ? "Ambassador View" : "Unit View"}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
}
