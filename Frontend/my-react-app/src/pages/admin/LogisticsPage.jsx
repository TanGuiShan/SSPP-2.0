import { useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { useModal } from "../../hooks/useModal";
import DataTable from "../../components/common/DataTable";
import {
  deriveStock,
  DEMO_ALLOCATIONS,
  // deriveStockFromMatches,   // TODO(real-flow): use this instead of deriveStock
  INVENTORY_CATEGORIES,
  LOW_STOCK_THRESHOLD,
  availableRatio,
  isLowStock,
  categoryLabel,
} from "../../data/inventory";
// import { useEngagements } from "../../hooks/useEngagements"; // TODO(real-flow)

const pct = (r) => `${Math.round(r * 100)}%`;

function barColor(ratio) {
  if (ratio < LOW_STOCK_THRESHOLD) return "#DC2626";
  if (ratio < LOW_STOCK_THRESHOLD + 0.15) return "#D97706";
  return "#16A34A";
}

export default function LogisticsPage() {
  // Extra stock the admin has restocked this session, keyed by item id. Added
  // on top of the derived numbers so restock survives re-derivation.
  const [restocked, setRestocked] = useState({});
  const [filter, setFilter] = useState("all");
  const restockModal = useModal();
  const [restockQty, setRestockQty] = useState("");

  // ── DEMO: derive from hardcoded allocations ──────────────────────────
  // TODO(real-flow): replace with:
  //   const { matches } = useEngagements();
  //   const derived = deriveStockFromMatches(matches);
  const derived = useMemo(() => deriveStock(DEMO_ALLOCATIONS), []);

  // Fold in admin restocks (adds to both total and available).
  const items = useMemo(
    () =>
      derived.map((item) => {
        const extra = restocked[item.id] ?? 0;
        return {
          ...item,
          total: item.total + extra,
          available: item.available + extra,
        };
      }),
    [derived, restocked]
  );

  const flaggedCount = useMemo(() => items.filter((i) => isLowStock(i)).length, [items]);
  const totalGaveOut = useMemo(() => items.reduce((s, i) => s + i.gaveOut, 0), [items]);
  const totalReserved = useMemo(() => items.reduce((s, i) => s + i.reserved, 0), [items]);

  const rows = useMemo(() => {
    let list = items;
    if (filter === "flagged") list = items.filter((i) => isLowStock(i));
    else if (filter !== "all") list = items.filter((i) => i.category === filter);
    return [...list].sort((a, b) => availableRatio(a) - availableRatio(b));
  }, [items, filter]);

  const openRestock = (item) => {
    setRestockQty("");
    restockModal.openModal(item);
  };

  const applyRestock = () => {
    const qty = Math.max(0, Number(restockQty) || 0);
    const id = restockModal.payload.id;
    if (qty > 0) {
      setRestocked((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + qty }));
    }
    restockModal.closeModal();
  };

  return (
    <>
      <PageHeader
        eyebrow="Logistics"
        title="Incentive stock"
        subtitle="Reserved automatically from confirmed engagements — flagged under 30% available"
      />

      <div className="flex gap-4 flex-wrap mb-8">
        <StatCard label="Item types" value={items.length} />
        <StatCard
          label="Needs restock"
          value={flaggedCount}
          valueColor={flaggedCount > 0 ? "#DC2626" : "#16A34A"}
        />
        <StatCard label="Reserved" value={totalReserved.toLocaleString()} valueColor="#D97706" />
        <StatCard label="Gave out" value={totalGaveOut.toLocaleString()} valueColor="#2563EB" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === "all"
              ? "bg-[#1C1917] text-white font-medium"
              : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("flagged")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === "flagged"
              ? "bg-[#DC2626] text-white font-medium"
              : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
          }`}
        >
          Needs restock
          {flaggedCount > 0 && (
            <span className={`ml-2 text-xs ${filter === "flagged" ? "text-white/70" : "text-[#DC2626]"}`}>
              {flaggedCount}
            </span>
          )}
        </button>
        {INVENTORY_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === c.value
                ? "bg-[#1C1917] text-white font-medium"
                : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">
              {filter === "flagged" ? "Nothing needs restocking. All good." : "No items in this category."}
            </p>
          </div>
        ) : (
          <DataTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Available</th>
                <th className="px-6 py-4 font-medium text-right">Reserved</th>
                <th className="px-6 py-4 font-medium text-right">Gave out</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium w-40">Availability</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const ratio = availableRatio(item);
                const low = isLowStock(item);
                return (
                  <tr key={item.id} className="border-b border-[#F5F5F4] last:border-0">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1C1917]">{item.name}</span>
                        {low && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[10px] font-medium">
                            Restock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#57534E] align-middle">
                      {categoryLabel(item.category)}
                    </td>
                    <td className="px-6 py-4 text-right align-middle font-medium">{item.available}</td>
                    <td className="px-6 py-4 text-right align-middle text-[#D97706]">
                      {item.reserved || "—"}
                    </td>
                    <td className="px-6 py-4 text-right align-middle text-[#57534E]">
                      {item.gaveOut || "—"}
                    </td>
                    <td className="px-6 py-4 text-right align-middle text-[#78716C]">{item.total}</td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-[#F5F5F4] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: pct(ratio), background: barColor(ratio) }}
                          />
                        </div>
                        <span className="text-xs text-[#78716C] w-9 text-right">{pct(ratio)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <Button
                        variant={low ? "primary" : "outline"}
                        size="sm"
                        onClick={() => openRestock(item)}
                      >
                        Restock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </DataTable>
        )}
      </div>

      <Modal
        open={restockModal.open}
        onClose={restockModal.closeModal}
        title="Restock item"
        subtitle={restockModal.payload?.name}
        variant="drawer"
      >
        {restockModal.payload && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                ["Available", restockModal.payload.available],
                ["Reserved", restockModal.payload.reserved],
                ["Total", restockModal.payload.total],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-[#F5F5F4] px-3 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
                  <p className="text-lg font-semibold mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-[#78716C] mb-4">
              Reserved and gave-out are driven by engagements, so the admin only restocks. Adding
              units raises both available and total.
            </p>

            <Input
              label="Restock quantity"
              type="number"
              min="0"
              placeholder="e.g. 200"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
            />

            <div className="flex gap-3 mt-2">
              <Button variant="secondary" fullWidth onClick={restockModal.closeModal}>
                Cancel
              </Button>
              <Button fullWidth onClick={applyRestock}>
                Add to stock
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
