import React from "react";

/**
 * A metric card. Pass `onClick` to make it an interactive button that shows a
 * hover state and a subtle "drill in" affordance.
 */
export default function StatCard({ label, value, valueColor = "#1C1917", onClick, hint }) {
  const clickable = typeof onClick === "function";

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide uppercase text-[#A8A29E]">{label}</p>
        {clickable && (
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        )}
      </div>
      <p className="text-3xl font-bold mt-2" style={{ color: valueColor }}>{value}</p>
      {hint && <p className="text-[11px] text-[#78716C] mt-1">{hint}</p>}
    </>
  );

  if (clickable) {
    return (
      <button
        onClick={onClick}
        className="card group px-6 py-5 flex-1 min-w-[160px] text-left hover:border-[#A8A29E] transition-colors cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return <div className="card px-6 py-5 flex-1 min-w-[160px]">{content}</div>;
}
