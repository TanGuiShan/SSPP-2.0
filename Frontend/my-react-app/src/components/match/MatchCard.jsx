import React from "react";

const ACTION_STYLES = {
  approved: "bg-[#DCFCE7] text-[#15803D]",
  pending: "bg-[#FEF3C7] text-[#B45309]",
  cancel: "bg-[#FEE2E2] text-[#B91C1C]",
  review: "bg-[#EDE9FE] text-[#6D28D9]",
};

export default function MatchCard({ match, onAction }) {
  const { code, name, date, participants, tier, action } = match;
  const actionKey = (action || "").toLowerCase();

  return (
    <div className="card px-6 py-5 flex items-center justify-between gap-4 mb-4">
      <div>
        <p className="text-xs text-[#A8A29E] mb-1">Code: {code}</p>
        <p className="text-lg font-semibold text-[#1C1917]">{name}</p>
        <p className="text-sm text-[#78716C] mt-0.5">
          {date} · {participants} participants · {tier}
        </p>
      </div>
      <button
        onClick={() => onAction?.(match)}
        className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 ${ACTION_STYLES[actionKey] || "bg-[#F5F5F4] text-[#57534E]"}`}
      >
        {action}
      </button>
    </div>
  );
}