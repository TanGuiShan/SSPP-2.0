// Admin-managed incentive stock — small giveaways handed out at engagements.
// NOT weapons or unit equipment.
//
// Allocation is AUTOMATED from matches, not manual: when a team confirms an
// engagement they pick equipment, which reserves stock. Admin's only lever is
// Restock. Counts:
//
//   total    - procured in this batch
//   reserved - committed to upcoming engagements (>1 day away)
//   gaveOut  - handed out (engagement is <=1 day away or done); consumables
//              never come back
//   available = total - reserved - gaveOut   (derived, never stored)
//
// Flag: available / total < LOW_STOCK_THRESHOLD.

export const LOW_STOCK_THRESHOLD = 0.3; // 30%

// Stock "gives out" this many days before the engagement — reserved flips to
// gaveOut once the date is this close.
export const GIVE_OUT_LEAD_DAYS = 1;

export const INVENTORY_CATEGORIES = [
  { value: "wearable", label: "Wearables" },
  { value: "stationery", label: "Stationery" },
  { value: "collectible", label: "Collectibles" },
  { value: "consumable", label: "Consumables" },
  { value: "bag", label: "Bags" },
];

// `total` is the procured batch. reserved/gaveOut are DERIVED from matches at
// runtime (see deriveStock below) — the numbers here are just the base stock.
export const inventoryBase = [
  { id: "inv-001", name: "Camo cream stick", category: "consumable", total: 500 },
  { id: "inv-002", name: "SSPP sticker pack", category: "collectible", total: 1000 },
  { id: "inv-003", name: "Army enamel pin", category: "collectible", total: 300 },
  { id: "inv-004", name: "Keychain (tank)", category: "collectible", total: 400 },
  { id: "inv-005", name: "Notebook A6", category: "stationery", total: 600 },
  { id: "inv-006", name: "Ballpoint pen", category: "stationery", total: 800 },
  { id: "inv-007", name: "Tote bag", category: "bag", total: 250 },
  { id: "inv-008", name: "Drawstring bag", category: "bag", total: 350 },
  { id: "inv-009", name: "Water bottle", category: "wearable", total: 200 },
  { id: "inv-010", name: "Lanyard", category: "wearable", total: 700 },
  { id: "inv-011", name: "SSPP wristband", category: "wearable", total: 900 },
  { id: "inv-012", name: "Postcard set", category: "collectible", total: 450 },
];

// ─────────────────────────────────────────────────────────────────────
// DEMO allocations (hardcoded).
//
// Until the ambassador equipment-selection step exists, real matches carry no
// equipment, so nothing would reserve and every item would read 100%. These
// stand-in allocations make the page look real.
//
// TODO(real-flow): once matches carry `equipment: [{ itemId, qty }]`, DELETE
// this block and pass real matches to deriveStock() — see App/LogisticsPage.
// Each entry: which item, how many, and how many days until the engagement
// (negative or small = already gave out, large = still reserved).
// ─────────────────────────────────────────────────────────────────────
export const DEMO_ALLOCATIONS = [
  { itemId: "inv-001", qty: 375, daysAway: 0 },   // gave out (today)
  { itemId: "inv-001", qty: 100, daysAway: 14 },  // reserved
  { itemId: "inv-003", qty: 230, daysAway: 2 },   // reserved
  { itemId: "inv-005", qty: 300, daysAway: 1 },   // gave out (<=1 day)
  { itemId: "inv-005", qty: 160, daysAway: 20 },  // reserved
  { itemId: "inv-007", qty: 190, daysAway: 0 },   // gave out
  { itemId: "inv-009", qty: 150, daysAway: 1 },   // gave out
  { itemId: "inv-011", qty: 500, daysAway: 3 },   // reserved
  { itemId: "inv-011", qty: 180, daysAway: 0 },   // gave out
  { itemId: "inv-002", qty: 360, daysAway: 5 },   // reserved
];

/**
 * Turn allocations into per-item reserved / gaveOut / available.
 *
 * An allocation counts as "gave out" once the engagement is within
 * GIVE_OUT_LEAD_DAYS; otherwise it's "reserved".
 *
 * @param {{itemId, qty, daysAway}[]} allocations
 */
export function deriveStock(allocations = DEMO_ALLOCATIONS) {
  return inventoryBase.map((item) => {
    let reserved = 0;
    let gaveOut = 0;
    for (const a of allocations) {
      if (a.itemId !== item.id) continue;
      if (a.daysAway <= GIVE_OUT_LEAD_DAYS) gaveOut += a.qty;
      else reserved += a.qty;
    }
    const available = Math.max(0, item.total - reserved - gaveOut);
    return { ...item, reserved, gaveOut, available };
  });
}

// ─────────────────────────────────────────────────────────────────────
// REAL derivation (dormant until matches carry equipment).
//
// TODO(real-flow): call this with the live matches from useEngagements instead
// of deriveStock(). It reads match.equipment and match.date, so the moment the
// ambassador selection step writes those, allocation becomes automatic — no
// other change needed here.
// ─────────────────────────────────────────────────────────────────────
export function deriveStockFromMatches(matches = []) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const allocations = [];
  for (const m of matches) {
    if (m.status === "Cancelled") continue;
    const daysAway = m.date ? Math.ceil((new Date(m.date).getTime() - now) / dayMs) : 999;
    for (const line of m.equipment ?? []) {
      allocations.push({ itemId: line.itemId, qty: line.qty, daysAway });
    }
  }
  return deriveStock(allocations);
}

// ── Helpers ───────────────────────────────────────────────────────────
export const availableRatio = (item) =>
  item.total > 0 ? item.available / item.total : 0;

export const isLowStock = (item, threshold = LOW_STOCK_THRESHOLD) =>
  availableRatio(item) < threshold;

export const categoryLabel = (v) =>
  INVENTORY_CATEGORIES.find((c) => c.value === v)?.label ?? v;
