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
    {
      id: "AWEE-2026-011",
      school: "ABC Primary School",
      unit: "3 SIR, Alpha Coy",
      date: "25 Jul 2026",
      time: "0900–1200h",
      tier: "Tier 2 — Static Display",
      participants: 80,
      status: "Confirmed",
      venue: "ABC Primary School, School Field",
      address: "12 Ang Mo Kio Ave 3, Singapore 569876",
      schoolPoc: { name: "Mdm Lim Hui Ling", role: "HOD Character Education", phone: "+65 9123 4567", email: "lim_huiling@abcpri.edu.sg" },
      equipment: ["Light strike vehicle", "Comms set", "Personal weapons"],
      notes: "Assembly hall available as wet-weather backup. Vehicles to enter via Gate B.",
    },
    {
      id: "AWEE-2026-012",
      school: "DEF Secondary School",
      unit: "1 GDS, Bravo Coy",
      date: "8 Aug 2026",
      time: "1400–1700h",
      tier: "Tier 3 — Hands-on Experience",
      participants: 120,
      status: "Confirmed",
      venue: "DEF Secondary School, Parade Square",
      address: "5 Bedok North Ave 2, Singapore 469644",
      schoolPoc: { name: "Mr Rajan Kumar", role: "Discipline Master", phone: "+65 9234 5678", email: "rajan_k@defsec.edu.sg" },
      equipment: ["Simulator", "Obstacle course kit", "Field pack"],
      notes: "Split into 4 rotation groups of 30. Water points to be provided by school.",
    },
  ],
  Unengaged: [
    {
      id: "AWEE-2026-013",
      school: "VWX Junior College",
      unit: "—",
      date: "TBC",
      time: "TBC",
      tier: "Tier 1 — Talk / Briefing",
      participants: 200,
      status: "Unmatched",
      venue: "VWX Junior College, Lecture Theatre 1",
      address: "8 Jurong West St 41, Singapore 649412",
      schoolPoc: { name: "Ms Chua Wei Ting", role: "Careers Coordinator", phone: "+65 9345 6789", email: "chua_weiting@vwxjc.edu.sg" },
      equipment: [],
      notes: "School requested dates in the last week of August. Awaiting unit availability.",
    },
  ],
  "Post Engagement": [
    {
      id: "AWEE-2026-004",
      school: "GHI Junior College",
      unit: "3 SIR, Alpha Coy",
      date: "5 Jun 2026",
      time: "0900–1130h",
      tier: "Tier 1 — Talk / Briefing",
      participants: 150,
      status: "Completed",
      venue: "GHI Junior College, Auditorium",
      address: "21 Yishun Ave 9, Singapore 768897",
      schoolPoc: { name: "Mr Tan Boon Hock", role: "Vice Principal", phone: "+65 9456 7890", email: "tan_boonhock@ghijc.edu.sg" },
      equipment: ["Slide deck", "Uniform display"],
      notes: "Feedback: students asked for more hands-on content next round.",
    },
  ],
};

export default schoolMatches;