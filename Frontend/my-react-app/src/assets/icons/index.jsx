// Minimal stroke-icon set (24x24, currentColor) used across the app.
// Avoids a hard dependency on an icon library — swap for lucide-react etc. if you have it installed.
import React from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const DashboardIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
);

export const ProfileIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20.5c1.5-4 4-6 7.5-6s6 2 7.5 6" /></svg>
);

export const CalendarIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);

export const EngagementIcon = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M8 15h3" /></svg>
);

export const HelpIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.2.9-1.2 1.8" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
);

export const LogoutIcon = (p) => (
  <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);

export const FormIcon = (p) => (
  <svg {...base} {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
);

export const MatchesIcon = (p) => (
  <svg {...base} {...p}><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /></svg>
);

export const UsersIcon = (p) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c1-3.2 3-5 5.5-5s4.5 1.8 5.5 5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M14.8 14.2c2 .3 3.4 1.9 4.2 4.8" /></svg>
);

export const ApprovalsIcon = (p) => (
  <svg {...base} {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>
);

export const LogisticsIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg>
);

export const TierIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="9" r="5" /><path d="M8 13.5L6 21l6-3 6 3-2-7.5" /></svg>
);

export const ChevronLeft = (p) => (<svg {...base} {...p}><path d="M15 6l-6 6 6 6" /></svg>);
export const ChevronRight = (p) => (<svg {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>);
export const ChevronDown = (p) => (<svg {...base} {...p}><path d="M6 9l6 6 6-6" /></svg>);
export const CloseIcon = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);