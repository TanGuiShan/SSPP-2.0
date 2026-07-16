import React from "react";

export default function StatCard({ label, value, valueColor = "#1C1917" }) {
  return (
    <div className="card px-6 py-5 flex-1 min-w-[160px]">
      <p className="text-xs font-semibold tracking-wide uppercase text-[#A8A29E]">{label}</p>
      <p className="text-3xl font-bold mt-2" style={{ color: valueColor }}>{value}</p>
    </div>
  );
}