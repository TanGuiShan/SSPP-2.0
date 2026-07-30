// utils/tabs.js
// ONE definition of the status tabs used by every list page, so the school,
// army and admin views all filter the same way and dashboards can deep-link
// into any of them with the same URL parameter.
//
// Convention (applies everywhere):
//   - the URL parameter is always `?tab=`
//   - the tab KEY is always the engagement status it selects, or "all"
//   - keys are lowercase and URL-safe; the visible label is separate
//
// Engagement statuses, for reference:
//   "Open"                  -> posted with no provider; waiting for volunteers
//   "Awaiting confirmation" -> provider hasn't confirmed yet
//   "Confirmed"             -> everyone on the roster has confirmed
//   "Cancelled"             -> called off
//   "Withdrawn"             -> the school pulled the request (forms only)

export const TAB_PARAM = "tab";

/** Every tab we can show, keyed for URLs. */
export const TAB = {
  ALL: "all",
  OPEN: "open",
  AWAITING: "awaiting",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// Each definition maps a tab key to the statuses it includes.
// `statuses: null` means "don't filter" (the All tab).
const DEFS = {
  [TAB.ALL]: { key: TAB.ALL, label: "All", statuses: null },
  [TAB.OPEN]: {
    key: TAB.OPEN,
    // A request the school posted openly — providers can still volunteer.
    label: "Open",
    statuses: ["Open"],
  },
  [TAB.AWAITING]: {
    key: TAB.AWAITING,
    label: "Awaiting",
    statuses: ["Awaiting confirmation"],
  },
  [TAB.CONFIRMED]: {
    key: TAB.CONFIRMED,
    label: "Confirmed",
    statuses: ["Confirmed"],
  },
  [TAB.CANCELLED]: {
    key: TAB.CANCELLED,
    // Schools "withdraw"; providers/admin see the same thing as "cancelled".
    label: "Cancelled",
    statuses: ["Cancelled", "Withdrawn"],
  },
  [TAB.COMPLETED]: {
    key: TAB.COMPLETED,
    label: "Completed",
    statuses: ["Completed"],
  }
};

/**
 * Build a tab list from keys, so each page shows only what's relevant while
 * still sharing the same definitions.
 *
 * @param {string[]} keys - e.g. [TAB.AWAITING, TAB.CONFIRMED, TAB.ALL]
 */
export function tabsFor(keys) {
  return keys.map((k) => DEFS[k]).filter(Boolean);
}

/** Filter a list of matches/forms by a tab definition. */
export function applyTab(items, tabDef) {
  if (!tabDef?.statuses) return items;
  return items.filter((item) => tabDef.statuses.includes(item.status));
}

/** How many items a tab would show — used for the little count badges. */
export function countForTab(items, tabDef) {
  return applyTab(items, tabDef).length;
}

/**
 * Resolve the tab to show, from a URL param.
 * Falls back to the page's default if the param is missing or unknown.
 */
export function resolveTab(param, tabs, fallbackKey) {
  const found = tabs.find((t) => t.key === param);
  if (found) return found.key;
  return fallbackKey ?? tabs[0]?.key;
}

/** Build a deep link, e.g. linkToTab("/school/matches", TAB.CONFIRMED). */
export function linkToTab(path, tabKey) {
  return `${path}?${TAB_PARAM}=${tabKey}`;
}

