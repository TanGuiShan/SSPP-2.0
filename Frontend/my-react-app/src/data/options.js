// Shared option lists used across signup, profiles, and the interest form.
// Keep these as the single source of truth — importing from here means a new
// formation or topic only has to be added in one place.

// ── Engagement tiers ──────────────────────────────────────────────────
// Mobility is NOT a separate field: the tier implies it. Tier 1 is sharing
// only; Tiers 2 and 3 both require booth setup at the school. `mobility`
// below is derived metadata for display/filtering, not a user choice.
export const TIERS = [
  {
    id: "tier1",
    name: "Tier 1 — Sharing only",
    short: "Sharing only",
    description: "Classroom or hall session. Nothing moved off-camp.",
    mobility: "sharing",
    requiresBooth: false,
  },
  {
    id: "tier2",
    name: "Tier 2 — Sharing + booth setup",
    short: "Sharing + booth",
    description: "Static display. Vehicles and equipment brought to the school.",
    mobility: "sharing_booth",
    requiresBooth: true,
  },
  {
    id: "tier3",
    name: "Tier 3 — Hands-on experience",
    short: "Hands-on",
    description: "Students handle equipment under supervision. Includes booth setup.",
    mobility: "sharing_booth",
    requiresBooth: true,
  },
];

export const getTier = (id) => TIERS.find((t) => t.id === id);

// What a unit/ambassador declares at signup: the most they can offer.
// Tier 1 only => sharing. Tier 2/3 => they can do booth setup.
export const MOBILITY_OPTIONS = [
  {
    value: "sharing",
    label: "Sharing only",
    description: "Talks and briefings. No equipment brought to the school.",
  },
  {
    value: "sharing_booth",
    label: "Sharing + booth setup",
    description: "Talks plus a static display or hands-on equipment on site.",
  },
];

// Tiers available given a declared mobility capability.
export const tiersForMobility = (mobility) =>
  mobility === "sharing_booth" ? TIERS : TIERS.filter((t) => !t.requiresBooth);

// ── Tier ceiling by provider type ─────────────────────────────────────
// Tier 3 (hands-on) needs a unit's equipment and supervision, so it's a unit
// capability, not an individual one. This holds for teams too — five
// ambassadors together still aren't a unit.
export const MAX_TIER_BY_PROVIDER = {
  unit: "tier3",
  ambassador: "tier2",
};

const TIER_ORDER = TIERS.map((t) => t.id);

/**
 * Tiers a provider can offer, given both what they can carry (mobility) and
 * what their provider type allows.
 *
 * @param {"unit"|"ambassador"} providerType
 * @param {"sharing"|"sharing_booth"} mobility
 */
export function tiersFor(providerType, mobility) {
  const ceiling = MAX_TIER_BY_PROVIDER[providerType] ?? "tier3";
  const maxIndex = TIER_ORDER.indexOf(ceiling);
  return tiersForMobility(mobility).filter((t) => TIER_ORDER.indexOf(t.id) <= maxIndex);
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
export const RANKS = [
  { value: "3sg", label: "3SG — Third Sergeant" },
  { value: "2sg", label: "2SG — Second Sergeant" },
  { value: "1sg", label: "1SG — First Sergeant" },
  { value: "ssg", label: "SSG — Staff Sergeant" },
  { value: "msg", label: "MSG — Master Sergeant" },
  { value: "3wo", label: "3WO — Third Warrant Officer" },
  { value: "2wo", label: "2WO — Second Warrant Officer" },
  { value: "1wo", label: "1WO — First Warrant Officer" },
  { value: "mwo", label: "MWO — Master Warrant Officer" },
  { value: "swo", label: "SWO — Senior Warrant Officer" },
  { value: "cwo", label: "CWO — Chief Warrant Officer" },
  { value: "me1", label: "ME1 — Military Expert 1" },
  { value: "me2", label: "ME2 — Military Expert 2" },
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
