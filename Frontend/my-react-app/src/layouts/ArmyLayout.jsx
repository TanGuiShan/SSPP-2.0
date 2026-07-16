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

const navItems = [
  { label: "Dashboard", to: "/army/dashboard", icon: DashboardIcon },
  { label: "My Unit Profile", to: "/army/profile", icon: ProfileIcon },
  { label: "Available Dates", to: "/army/availability", icon: CalendarIcon },
  { label: "My Engagements", to: "/army/engagements", icon: EngagementIcon },
  { label: "Help & Support", to: "/army/help", icon: HelpIcon },
];

export default function ArmyLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout navItems={navItems} brand="SSPP" roleLabel="Army View" onLogout={handleLogout}>
      <Outlet />
    </AppLayout>
  );
}