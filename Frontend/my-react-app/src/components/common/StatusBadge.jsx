import React from "react";

const STYLES = {
  completed: "bg-[#DCFCE7] text-[#15803D]",
  approved: "bg-[#DCFCE7] text-[#15803D]",
  "awaiting confirmation": "bg-[#FEF3C7] text-[#B45309]",
  awaiting: "bg-[#FEF3C7] text-[#B45309]",
  confirmed: "bg-[#DCFCE7] text-[#15803D]",
  upcoming: "bg-[#DBEAFE] text-[#1D4ED8]",
  pending: "bg-[#FEF3C7] text-[#B45309]",
  unmatched: "bg-[#FEF3C7] text-[#B45309]",
  cancel: "bg-[#FEE2E2] text-[#B91C1C]",
  cancelled: "bg-[#FEE2E2] text-[#B91C1C]",
  review: "bg-[#EDE9FE] text-[#6D28D9]",
  withdraw: "bg-[#FEE2E2] text-[#B91C1C]",
  withdrawn: "bg-[#F5F5F4] text-[#78716C]",
  rejected: "bg-[#FEE2E2] text-[#B91C1C]",
  default: "bg-[#F5F5F4] text-[#57534E]",
};

export default function StatusBadge({ status, children }) {
  const key = (status || "").toString().toLowerCase();
  const style = STYLES[key] || STYLES.default;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${style}`}>
      {children || status}
    </span>
  );
}
