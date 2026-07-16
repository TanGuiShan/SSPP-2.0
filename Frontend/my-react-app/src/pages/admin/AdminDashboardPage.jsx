import React from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

const monthly = [
  { month: "Jan", value: 3900 },
  { month: "Feb", value: 3150 },
  { month: "Mar", value: 2180 },
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
];

const statusBreakdown = [
  { label: "Completed", count: 18, color: "#16A34A" },
  { label: "Upcoming", count: 10, color: "#2563EB" },
  { label: "Unmatched", count: 6, color: "#EAB308" },
];

export default function AdminDashboardPage() {
  const max = Math.max(...monthly.map((m) => m.value)) || 1;
  const total = statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Admin Overview"
        subtitle="Engagement platform analytics, Jan – Jun 2026"
        action={
          <span className="px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium">
            Jan – Jun 2026
          </span>
        }
      />

      <div className="flex gap-4 flex-wrap mb-8">
        <StatCard label="Total Schools" value="34" />
        <StatCard label="Total Units" value="50" />
        <StatCard label="Active Matches" value="20" valueColor="#2563EB" />
        <StatCard label="Yet to Match" value="50" valueColor="#EA580C" />
        <StatCard label="Completion Rate" value="85%" valueColor="#16A34A" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — plain CSS so there's no charting dependency yet */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Monthly engagements (2026)
          </h2>
          <p className="text-xs text-[#78716C] mb-8">Jun data is partial — month in progress</p>

          <div className="flex items-end gap-4 h-56 border-b border-[#E7E5E4] pb-0">
            {monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                {m.value > 0 && (
                  <span className="text-[11px] text-[#78716C] mb-1">{m.value.toLocaleString()}</span>
                )}
                <div
                  className="w-full rounded-t-md bg-[#3B82F6] transition-all"
                  style={{ height: `${(m.value / max) * 100}%`, minHeight: m.value > 0 ? "4px" : "0" }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {monthly.map((m) => (
              <div key={m.month} className="flex-1 text-center text-xs text-[#78716C]">
                {m.month}
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card p-6">
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Status breakdown
          </h2>

          {statusBreakdown.map((s) => (
            <div key={s.label} className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-sm text-[#44403C]">{s.label}</span>
              </div>
              <span className="text-sm font-medium">{s.count}</span>
            </div>
          ))}

          <div className="flex h-2 rounded-full overflow-hidden mt-5 gap-0.5">
            {statusBreakdown.map((s) => (
              <div
                key={s.label}
                style={{ background: s.color, width: `${(s.count / total) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}