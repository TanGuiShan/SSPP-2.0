import React from "react";

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-3xl md:text-[32px] text-[#1C1917]" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#78716C] mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}