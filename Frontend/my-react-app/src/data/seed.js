// Starting data for the demo. Once a school submits something, the live state
// lives in localStorage via useEngagements — this is only the initial fill so
// the pages aren't empty on first load.

/**
 * A "target" is whoever the school wants to engage. Three shapes:
 *   { kind: "unit",       unit: {...} }
 *   { kind: "ambassador", ambassador: {...} }
 *   { kind: "team",       team: [{...}, {...}] }
 *
 * Everything downstream (interest forms, matches, admin) uses describeTarget()
 * so a team renders sensibly everywhere without each page special-casing it.
 */
export function describeTarget(target) {
  if (!target) return { title: "—", subtitle: "", kind: "unknown" };

  if (target.kind === "team") {
    const names = target.team.map((m) => `${m.rank} ${m.name.split(" ")[0]}`).join(", ");
    return {
      kind: "team",
      title: `Ambassador team (${target.team.length})`,
      subtitle: names,
      count: target.team.length,
    };
  }

  if (target.kind === "ambassador") {
    const a = target.ambassador;
    return {
      kind: "ambassador",
      title: `${a.rank} ${a.name}`,
      subtitle: `${a.appointment} · ${a.camp}`,
    };
  }

  const u = target.unit;
  return {
    kind: "unit",
    title: u.name,
    subtitle: u.location,
  };
}

export const seedInterestForms = [
  // A unit request still awaiting the unit's confirmation (stale — 13 days old)
  {
    id: "IF001",
    matchId: "AWEE-2026-001",
    submittedAt: "2026-07-08T09:15:00.000Z",
    status: "Awaiting confirmation",
    school: "Swiss Cottage Secondary School",
    target: {
      kind: "unit",
      unit: { id: "armoured-brigade", name: "Armoured Brigade", location: "Sungei Gedong Camp" },
    },
    date: "2026-07-22",
    timings: ["morning"],
    tier: "tier2",
    participants: 80,
    notes: "Prefer the school field. Wet-weather backup is the hall.",
  },
  // A team request, partly confirmed (1 of 2 in so far)
  {
    id: "IF002",
    matchId: "AWEE-2026-002",
    submittedAt: "2026-07-10T14:02:00.000Z",
    status: "Awaiting confirmation",
    school: "Swiss Cottage Secondary School",
    target: {
      kind: "team",
      team: [
        { id: "amb-001", rank: "3SG", name: "Muhammad Hafiz Bin Rahman", appointment: "Section Commander", mobility: "sharing_booth" },
        { id: "amb-004", rank: "LTA", name: "Tan Jia Hui", appointment: "Platoon Commander", mobility: "sharing_booth" },
      ],
    },
    date: "2026-08-05",
    timings: ["morning", "afternoon"],
    tier: "tier3",
    participants: 120,
    notes: "Sec 3 cohort. Two sessions back to back if possible.",
  },
  // A single ambassador, fully confirmed
  {
    id: "IF003",
    matchId: "AWEE-2026-003",
    submittedAt: "2026-07-12T08:40:00.000Z",
    status: "Confirmed",
    school: "GHI Junior College",
    target: {
      kind: "ambassador",
      ambassador: { id: "amb-002", rank: "CPT", name: "Sarah Lim Wei Ling", appointment: "Signals Officer", mobility: "sharing_booth" },
    },
    date: "2026-07-28",
    timings: ["afternoon"],
    tier: "tier3",
    participants: 60,
    notes: "Career talk for JC2 science stream.",
  },
];

export const seedMatches = [
  {
    id: "AWEE-2026-001",
    formId: "IF001",
    school: "Swiss Cottage Secondary School",
    target: {
      kind: "unit",
      unit: { id: "armoured-brigade", name: "Armoured Brigade", location: "Sungei Gedong Camp" },
    },
    date: "2026-07-22",
    timings: ["morning"],
    tier: "tier2",
    participants: 80,
    notes: "Prefer the school field. Wet-weather backup is the hall.",
    status: "Awaiting confirmation",
    roster: [
      { id: "armoured-brigade", kind: "unit", name: "Armoured Brigade", location: "Sungei Gedong Camp", confirmed: false, confirmedAt: null },
    ],
    equipment: [],
    createdAt: "2026-07-08T09:15:00.000Z",
  },
  {
    id: "AWEE-2026-002",
    formId: "IF002",
    school: "Swiss Cottage Secondary School",
    target: {
      kind: "team",
      team: [
        { id: "amb-001", rank: "3SG", name: "Muhammad Hafiz Bin Rahman", appointment: "Section Commander", mobility: "sharing_booth" },
        { id: "amb-004", rank: "LTA", name: "Tan Jia Hui", appointment: "Platoon Commander", mobility: "sharing_booth" },
      ],
    },
    date: "2026-08-05",
    timings: ["morning", "afternoon"],
    tier: "tier3",
    participants: 120,
    notes: "Sec 3 cohort. Two sessions back to back if possible.",
    status: "Awaiting confirmation",
    roster: [
      { id: "amb-001", kind: "ambassador", rank: "3SG", name: "Muhammad Hafiz Bin Rahman", appointment: "Section Commander", confirmed: true, confirmedAt: "2026-07-11T09:00:00.000Z" },
      { id: "amb-004", kind: "ambassador", rank: "LTA", name: "Tan Jia Hui", appointment: "Platoon Commander", confirmed: false, confirmedAt: null },
    ],
    equipment: [],
    createdAt: "2026-07-10T14:02:00.000Z",
  },
  {
    id: "AWEE-2026-003",
    formId: "IF003",
    school: "GHI Junior College",
    target: {
      kind: "ambassador",
      ambassador: { id: "amb-002", rank: "CPT", name: "Sarah Lim Wei Ling", appointment: "Signals Officer", mobility: "sharing_booth" },
    },
    date: "2026-07-28",
    timings: ["afternoon"],
    tier: "tier3",
    participants: 60,
    notes: "Career talk for JC2 science stream.",
    status: "Confirmed",
    roster: [
      { id: "amb-002", kind: "ambassador", rank: "CPT", name: "Sarah Lim Wei Ling", appointment: "Signals Officer", confirmed: true, confirmedAt: "2026-07-13T10:00:00.000Z" },
    ],
    equipment: [],
    createdAt: "2026-07-12T08:40:00.000Z",
  },
];
