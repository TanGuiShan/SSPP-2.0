import React from "react";
import { describeTarget } from "../../data/seed";

/**
 * Renders whoever a school asked to engage — a unit, a single ambassador, or
 * a team — in one consistent way. Every page that shows an interest form or a
 * match uses this, so a team can't end up displayed as "[object Object]" on
 * some page nobody thought to update.
 */
export default function TargetSummary({ target, showRoster = false, compact = false }) {
  const { kind, title, subtitle } = describeTarget(target);

  const KIND_STYLES = {
    unit: "bg-[#DBEAFE] text-[#1D4ED8]",
    ambassador: "bg-[#EDE9FE] text-[#6D28D9]",
    team: "bg-[#FEF3C7] text-[#B45309]",
  };

  const KIND_LABELS = {
    unit: "Unit",
    ambassador: "Ambassador",
    team: "Team",
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-medium text-[#1C1917] ${compact ? "text-sm" : ""}`}>{title}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            KIND_STYLES[kind] ?? "bg-[#F5F5F4] text-[#57534E]"
          }`}
        >
          {KIND_LABELS[kind] ?? kind}
        </span>
      </div>

      {subtitle && (
        <p className={`text-[#78716C] mt-0.5 ${compact ? "text-xs" : "text-sm"} truncate`}>
          {subtitle}
        </p>
      )}

      {showRoster && kind === "team" && (
        <ul className="mt-3 space-y-1.5">
          {target.team.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[#44403C] truncate">
                {m.rank} {m.name}
              </span>
              <span className="text-[#A8A29E] shrink-0">{m.appointment}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
