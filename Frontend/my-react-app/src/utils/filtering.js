// Filtering shared by the Units and Ambassadors tabs.
// Kept out of the page components so both tabs filter identically and the
// rules can be unit-tested later without rendering anything.

/**
 * Does an entity's availability window overlap the range the school wants?
 * An empty `from` or `to` means "unbounded on that side", so a school that
 * only sets a start date still gets sensible results.
 */
export function overlapsRange(entity, from, to) {
  if (!from && !to) return true;

  const entityStart = new Date(entity.availableFrom);
  const entityEnd = new Date(entity.availableTo);
  const wantStart = from ? new Date(from) : null;
  const wantEnd = to ? new Date(to) : null;

  // No overlap if the entity finishes before the window opens...
  if (wantStart && entityEnd < wantStart) return false;
  // ...or starts after it closes.
  if (wantEnd && entityStart > wantEnd) return false;

  return true;
}

/**
 * Apply the active filters to a list of units or ambassadors.
 *
 * Within a group, options are OR'd (Infantry OR Signal).
 * Across groups, they're AND'd (Infantry AND does leadership).
 * That's what people expect from faceted search.
 */
export function applyFilters(items, filters) {
  return items.filter((item) => {
    if (!overlapsRange(item, filters.availableFrom, filters.availableTo)) return false;

    // Single-value field
    if (filters.formation?.length && !filters.formation.includes(item.formation)) {
      return false;
    }

    // Tier capability: "sharing_booth" can also do sharing-only engagements,
    // so a school filtering for "sharing" should still see booth-capable units.
    if (filters.mobility?.length) {
      const canDo = item.mobility === "sharing_booth" ? ["sharing", "sharing_booth"] : ["sharing"];
      if (!filters.mobility.some((m) => canDo.includes(m))) return false;
    }

    // Array fields — match if there's any overlap
    if (filters.topics?.length && !filters.topics.some((t) => item.topics.includes(t))) {
      return false;
    }

    if (
      filters.levelsPreferred?.length &&
      !filters.levelsPreferred.some((l) => item.levelsPreferred.includes(l))
    ) {
      return false;
    }

    return true;
  });
}

/** Empty filter state — used to initialise and to reset. */
export const emptyFilters = {
  formation: [],
  mobility: [],
  topics: [],
  levelsPreferred: [],
  availableFrom: "",
  availableTo: "",
};

/** "1 Jul 2026 – 31 Jul 2026" from two ISO date strings. */
export function formatRange(from, to) {
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(from)} – ${fmt(to)}`;
}