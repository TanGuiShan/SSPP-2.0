import React from "react";
import { confirmedCount } from "../../hooks/useEngagements";

/**
 * Who's attending an engagement and whether each has confirmed. Shown to the
 * school, the provider, and admin — everyone sees the same roster.
 *
 * For a unit it's a single row; for an ambassador team, one row per member.
 */
export default function EngagementRoster({ match, highlightId }) {
  const roster = match?.roster ?? [];
  if (roster.length === 0) return null;

  const done = confirmedCount(match);
  const isTeam = roster.length > 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">
          {isTeam ? "Attending team" : "Provider"}
        </p>
        {isTeam && (
          <span className="text-xs text-[#78716C]">
            {done} of {roster.length} confirmed
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {roster.map((r) => {
          const isYou = highlightId && r.id === highlightId;
          return (
            <div
              key={r.id}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 border ${
                isYou ? "border-[#1C1917] bg-[#FAFAF9]" : "border-[#E7E5E4]"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm text-[#1C1917] truncate">
                  {r.rank ? `${r.rank} ${r.name}` : r.name}
                  {isYou && <span className="text-[#78716C] font-normal"> · you</span>}
                </p>
                {(r.appointment || r.location) && (
                  <p className="text-xs text-[#78716C] truncate">{r.appointment || r.location}</p>
                )}
              </div>

              {r.confirmed ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-medium shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 6" />
                  </svg>
                  Confirmed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-medium shrink-0">
                  Awaiting
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
