// Shared option lists used across signup, profiles, and the interest form.
// Keep these as the single source of truth — importing from here means a new
// formation or topic only has to be added in one place.

// ── Engagement tiers ──────────────────────────────────────────────────
// Tiers run most-intensive (T1) to least (T3):
//   Tier 1 — hands-on: students handle real equipment. Needs a unit.
//   Tier 2 — sharing + booth: static display brought to the school.
//   Tier 3 — sharing only: talk/briefing, nothing moved on site.
// `requiresBooth` = needs physical setup at the school (T1 and T2).
// `isHandsOn`     = needs a unit's equipment + supervision (T1 only).
export const TIERS = [
  {
    id: "tier1",
    name: "Tier 1 — Hands-on experience",
    short: "Hands-on",
    description: "Students handle real equipment under supervision. Units only.",
    requiresBooth: true,
    isHandsOn: true,
  },
  {
    id: "tier2",
    name: "Tier 2 — Sharing + booth setup",
    short: "Sharing + booth",
    description: "Static display and equipment brought to the school.",
    requiresBooth: true,
    isHandsOn: false,
  },
  {
    id: "tier3",
    name: "Tier 3 — Sharing only",
    short: "Sharing only",
    description: "Talk or briefing. Nothing moved off-camp.",
    requiresBooth: false,
    isHandsOn: false,
  },
];

export const getTier = (id) => TIERS.find((t) => t.id === id);

// Tier ordering is by intensity, T1 highest. Used to compare "up to" ceilings.
const TIER_ORDER = TIERS.map((t) => t.id); // ["tier1","tier2","tier3"]
const tierRank = (id) => TIER_ORDER.indexOf(id); // lower index = more intensive

// What a provider declares at signup: the most they can offer on site.
//   sharing        => can do sharing-only (T3)
//   sharing_booth  => can also bring a booth (T2), and if a unit, hands-on (T1)
export const MOBILITY_OPTIONS = [
  {
    value: "sharing",
    label: "Sharing only",
    description: "Talks and briefings. No equipment brought to the school.",
  },
  {
    value: "sharing_booth",
    label: "Sharing + booth setup",
    description: "Talks plus a static display or equipment on site.",
  },
];

// ── Provider ceilings ─────────────────────────────────────────────────
// Hands-on (T1) is units-only — ambassadors don't hold tanks or weapons, units
// do. So an ambassador (or any ambassador team) tops out at Tier 2, and only
// when the booth condition below is met; otherwise Tier 3.
export const MIN_OFFICERS_FOR_BOOTH = 4; // rule B: 4+ ambassadors unlock booth

/**
 * Tiers a UNIT can offer, from its declared mobility.
 * sharing_booth => T1, T2, T3.  sharing => T3 only.
 */
export function unitTiers(mobility) {
  if (mobility === "sharing_booth") return TIERS;
  return TIERS.filter((t) => !t.requiresBooth); // just T3
}

/**
 * Tiers an AMBASSADOR context can offer. Never hands-on (T1).
 *
 * Rule B: booth (T2) needs at least MIN_OFFICERS_FOR_BOOTH ambassadors in the
 * group, regardless of any individual's declared mobility. Fewer than that —
 * including a lone ambassador — can only do sharing-only (T3).
 *
 * @param {number} groupSize - how many ambassadors are in the team (1 for solo)
 */
export function ambassadorTiers(groupSize = 1) {
  const canBooth = groupSize >= MIN_OFFICERS_FOR_BOOTH;
  return TIERS.filter((t) => !t.isHandsOn && (canBooth || !t.requiresBooth));
}

/**
 * Single entry point the interest form uses.
 * @param {"unit"|"ambassador"} providerType
 * @param {{ mobility?: string, groupSize?: number }} opts
 */
export function tiersFor(providerType, opts = {}) {
  if (providerType === "ambassador") return ambassadorTiers(opts.groupSize ?? 1);
  return unitTiers(opts.mobility ?? "sharing_booth");
}

// ── Army formations ───────────────────────────────────────────────────
export const FORMATIONS = [
  { value: "armoured", label: "Armoured" },
  { value: "army_medical", label: "Army Medical" },
  { value: "army_intelligence", label: "Army Intelligence" },
  { value: "artillery", label: "Artillery" },
  { value: "commandos", label: "Commandos" },
  { value: "guards", label: "Guards" },
  { value: "infantry", label: "Infantry" },
  { value: "maintenance_engineering", label: "Maintenance and Engineering Support" },
  { value: "ammunition", label: "Ammunition" },
  { value: "signal", label: "Signal" },
  { value: "supply", label: "Supply" },
  { value: "combat_engineering", label: "Combat Engineering" },
  { value: "transport", label: "Transport" },
];

// ── School levels ─────────────────────────────────────────────────────
export const SCHOOL_LEVELS = [
  { value: "kindergarten", label: "Kindergarten" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "jc", label: "Junior College" },
  { value: "poly", label: "Polytechnic" },
  { value: "ite", label: "ITE" },
];

// ── Ranks ─────────────────────────────────────────────────────────────
// Ambassadors are WO and above (lowest rank here is Warrant Officer), plus
// the Military Expert track ME3–ME8.
export const RANKS = [
  { value: "3wo", label: "3WO — Third Warrant Officer" },
  { value: "2wo", label: "2WO — Second Warrant Officer" },
  { value: "1wo", label: "1WO — First Warrant Officer" },
  { value: "mwo", label: "MWO — Master Warrant Officer" },
  { value: "swo", label: "SWO — Senior Warrant Officer" },
  { value: "cwo", label: "CWO — Chief Warrant Officer" },
  { value: "me3", label: "ME3 — Military Expert 3" },
  { value: "me4", label: "ME4 — Military Expert 4" },
  { value: "me5", label: "ME5 — Military Expert 5" },
  { value: "me6", label: "ME6 — Military Expert 6" },
  { value: "me7", label: "ME7 — Military Expert 7" },
  { value: "me8", label: "ME8 — Military Expert 8" },
  { value: "2lt", label: "2LT — Second Lieutenant" },
  { value: "lta", label: "LTA — Lieutenant" },
  { value: "cpt", label: "CPT — Captain" },
  { value: "maj", label: "MAJ — Major" },
  { value: "ltc", label: "LTC — Lieutenant Colonel" },
  { value: "sltc", label: "SLTC — Senior Lieutenant Colonel" },
  { value: "col", label: "COL — Colonel" },
];

// ── Topics an ambassador / unit can speak on ──────────────────────────
export const TOPICS = [
  { value: "nsf_life", label: "NSF life and experience" },
  { value: "career_army", label: "Army careers and pathways" },
  { value: "leadership", label: "Leadership and teamwork" },
  { value: "total_defence", label: "Total Defence" },
  { value: "technology", label: "Defence technology and innovation" },
  { value: "fitness", label: "Fitness and resilience" },
  { value: "vocation", label: "Vocation-specific sharing" },
  { value: "women_in_army", label: "Women in the Army" },
];

// ── School appointments (point of contact roles) ──────────────────────
export const SCHOOL_APPOINTMENTS = [
  { value: "principal", label: "Principal" },
  { value: "vice_principal", label: "Vice Principal" },
  { value: "hod", label: "Head of Department" },
  { value: "teacher", label: "Teacher" },
  { value: "cca_coordinator", label: "CCA Coordinator" },
  { value: "careers_coordinator", label: "Careers Coordinator" },
  { value: "admin", label: "Administrative Staff" },
  { value: "other", label: "Other" },
];

// ── Preferred timing slots ────────────────────────────────────────────
export const TIMING_SLOTS = [
  { value: "morning", label: "Morning (0900–1200h)" },
  { value: "afternoon", label: "Afternoon (1400–1700h)" },
  { value: "full_day", label: "Full day" },
];
