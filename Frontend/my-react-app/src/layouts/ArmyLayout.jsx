import { Outlet, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useEngagements } from "../hooks/useEngagements";
import {
  DashboardIcon,
  ProfileIcon,
  CalendarIcon,
  EngagementIcon,
  HelpIcon,
  SearchIcon,
} from "../assets/icons";

/**
 * Shared by both army roles. The two differ only in the profile label and
 * where that nav item points — everything else (dashboard, availability,
 * engagements, help) is common, so they share one layout rather than
 * duplicating it. If the roles diverge further, split this in two.
 */
// Standard order shared with the other roles: Dashboard first, then the
// role's functional pages, then Profile, and Help & Support last.
const navFor = (isAmbassador, openCount) => [
  { label: "Dashboard", to: "/army/dashboard", icon: DashboardIcon },
  { label: "Available Dates", to: "/army/availability", icon: CalendarIcon },
  // Schools' open requests. The count is in the label so a provider notices
  // there's something to pick up without opening the page.
  {
    label: openCount > 0 ? `School Requests (${openCount})` : "School Requests",
    to: "/army/requests",
    icon: SearchIcon,
  },
  { label: "My Engagements", to: "/army/engagements", icon: EngagementIcon },
  {
    label: isAmbassador ? "My Profile" : "My Unit Profile",
    to: isAmbassador ? "/army/profile/ambassador" : "/army/profile",
    icon: ProfileIcon,
  },
  { label: "Help & Support", to: "/army/help", icon: HelpIcon },
];

export default function ArmyLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { matches } = useEngagements();
  const isAmbassador = user?.role === "army-ambassador";

  // How many open requests this provider could pick up — mirrors the filter
  // on the requests page so the badge and the list always agree.
  const openCount = useMemo(() => {
    const myId = user?.providerId ?? (isAmbassador ? "amb-demo" : "unit-demo");
    return matches.filter((m) => {
      if (!m.isOpen || m.status !== "Open") return false;
      const forMe = isAmbassador
        ? m.category === "cert" || m.category === "individual_ambassador"
        : m.category === "unit";
      if (!forMe) return false;
      return !(m.roster ?? []).some((r) => r.id === myId);
    }).length;
  }, [matches, isAmbassador, user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout
      navItems={navFor(isAmbassador, openCount)}
      brand="SSPP"
      roleLabel={isAmbassador ? "Ambassador View" : "Unit View"}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
}
