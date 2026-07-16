export const schoolMatches = [
  {
    code: "AWEE-2026-003",
    name: "Armoured Brigade",
    date: "2026-07-25",
    participants: 80,
    tier: "Tier 2 engagement",
    action: "Approved",
  },
  {
    code: "AWEE-2026-004",
    name: "Armoured Brigade",
    date: "2026-07-25",
    participants: 80,
    tier: "Tier 2 engagement",
    action: "Pending",
  },
  {
    code: "AWEE-2026-002",
    name: "Armoured Brigade",
    date: "2026-07-25",
    participants: 80,
    tier: "Tier 2 engagement",
    action: "Cancel",
  },
  {
    code: "AWEE-2026-001",
    name: "Armoured Brigade",
    date: "2026-07-01",
    participants: 80,
    tier: "Tier 2 engagement",
    action: "Review",
  },
];

export const armyUpcomingEngagements = [
  { school: "PQR Primary School", date: "25 Jun 2026, 0900–1200h", status: "Confirmed" },
  { school: "STU Secondary School", date: "10 Jul 2026, 1400–1600h", status: "Confirmed" },
  { school: "VWX Junior College", date: "TBC — awaiting school confirmation", status: "Pending" },
];

export const armyPastEngagements = [
  { school: "ABC Primary School", date: "20 May 2026", activity: "Career Talk", status: "Completed" },
  { school: "DEF Secondary School", date: "28 May 2026", activity: "Training Exercise", status: "Completed" },
  { school: "GHI Junior College", date: "5 Jun 2026", activity: "Mentoring Session", status: "Completed" },
  { school: "JKL Primary School", date: "10 Jun 2026", activity: "School Visit", status: "Completed" },
];

export const armyEngagementTabs = {
  "Upcoming Matched": [
    { school: "ABC Primary School", unit: "3 SIR, Alpha Coy", date: "25 Jul 2026" },
    { school: "DEF Secondary School", unit: "1 GDS, Bravo Coy", date: "8 Aug 2026" },
  ],
  Unengaged: [],
  "Post Engagement": [],
};

export default schoolMatches;