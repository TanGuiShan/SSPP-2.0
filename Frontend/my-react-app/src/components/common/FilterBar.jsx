import React from "react";
import Button from "./Button";

/**
 * Filter panel shared by the Units and Ambassadors tabs.
 *
 * Deliberately "dumb": it owns no state. The page holds `filters` and passes
 * an onChange, so both tabs can share this without their filter state leaking
 * into each other.
 */
export default function FilterBar({ filters, onChange, groups, resultCount, totalCount }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleIn = (key, value) => {
    const current = filters[key] ?? [];
    set(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const activeCount =
    groups.reduce((n, g) => n + (filters[g.key]?.length ?? 0), 0) +
    (filters.availableFrom ? 1 : 0) +
    (filters.availableTo ? 1 : 0);

  const clearAll = () => {
    const cleared = Object.fromEntries(groups.map((g) => [g.key, []]));
    onChange({ ...cleared, availableFrom: "", availableTo: "" });
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-[#1C1917]">Filters</h2>
          {activeCount > 0 && (
            <span className="text-xs text-[#78716C]">
              {activeCount} active · showing {resultCount} of {totalCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      {/* Availability window */}
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-2">
          Available between
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={filters.availableFrom ?? ""}
            onChange={(e) => set("availableFrom", e.target.value)}
            className="rounded-lg bg-[#F5F5F4] border border-transparent px-3 py-2 text-xs focus:bg-white focus:border-[#1C1917] focus:outline-none"
          />
          <span className="text-xs text-[#A8A29E]">to</span>
          <input
            type="date"
            value={filters.availableTo ?? ""}
            onChange={(e) => set("availableTo", e.target.value)}
            className="rounded-lg bg-[#F5F5F4] border border-transparent px-3 py-2 text-xs focus:bg-white focus:border-[#1C1917] focus:outline-none"
          />
          {(filters.availableFrom || filters.availableTo) && (
            <button
              onClick={() => onChange({ ...filters, availableFrom: "", availableTo: "" })}
              className="text-xs text-[#78716C] hover:text-[#1C1917] underline"
            >
              Reset dates
            </button>
          )}
        </div>
      </div>

      {/* Chip groups */}
      {groups.map((group) => (
        <div key={group.key} className="mb-4 last:mb-0">
          <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-2">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const active = (filters[group.key] ?? []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleIn(group.key, opt.value)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    active
                      ? "bg-[#1C1917] border-[#1C1917] text-white"
                      : "bg-white border-[#E7E5E4] text-[#44403C] hover:border-[#A8A29E]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
