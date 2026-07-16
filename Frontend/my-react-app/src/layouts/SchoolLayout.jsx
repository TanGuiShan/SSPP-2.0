import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import {
  DashboardIcon,
  SearchIcon,
  FormIcon,
  MatchesIcon,
  ProfileIcon,
  HelpIcon,
} from "../assets/icons";

const navItems = [
  { label: "Dashboard", to: "/school/dashboard", icon: DashboardIcon },
  { label: "Browse Formation", to: "/school/formations", icon: SearchIcon },
  { label: "Interest Form", to: "/school/interest-forms", icon: FormIcon },
  { label: "My Matches", to: "/school/matches", icon: MatchesIcon },
  { label: "Profile", to: "/school/profile", icon: ProfileIcon },
  { label: "Help & Support", to: "/school/help", icon: HelpIcon },
];

export default function SchoolLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout
      navItems={navItems}
      brand="SSPP"
      roleLabel={user?.schoolName || "School View"}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
}