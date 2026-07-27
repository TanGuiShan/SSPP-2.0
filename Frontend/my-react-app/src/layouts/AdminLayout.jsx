import { Outlet, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import {
  DashboardIcon,
  UsersIcon,
  ApprovalsIcon,
  MatchesIcon,
  LogisticsIcon,
  TierIcon,
  ProfileIcon,
  HelpIcon,
} from "../assets/icons";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: DashboardIcon },
  { label: "Manage Users", to: "/admin/users", icon: UsersIcon },
  { label: "Schools", to: "/admin/schools", icon: UsersIcon },
  // { label: "SSPP Approvals", to: "/admin/approvals", icon: ApprovalsIcon },
  { label: "Match Results", to: "/admin/matches", icon: MatchesIcon },
  { label: "Inventory", to: "/admin/logistics", icon: LogisticsIcon },
  { label: "Tier Config", to: "/admin/tiers", icon: TierIcon },
  { label: "Profile", to: "/admin/profile", icon: ProfileIcon },
  { label: "Help & Support", to: "/admin/support", icon: HelpIcon },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout navItems={navItems} brand="SSPP" roleLabel="Admin View" onLogout={handleLogout}>
      <Outlet />
    </AppLayout>
  );
}
