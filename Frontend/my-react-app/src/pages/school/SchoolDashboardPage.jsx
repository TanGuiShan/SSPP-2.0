import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import { useEngagements } from "../../hooks/useEngagements";
import { getTier } from "../../data/options";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

export default function SchoolDashboardPage() {
  const navigate = useNavigate();
  const { interestForms, matches } = useEngagements();

  const engaged = matches.filter((m) => m.status === "Approved").length;
  const pending = interestForms.filter((f) => f.status === "Pending").length;

  // Most recent activity across both lists, newest first
  const recent = [...interestForms]
    .sort((a, b) => new Date(b.submittedAt ?? 0) - new Date(a.submittedAt ?? 0))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Overall School's Engagement"
        subtitle="Engagement analytics for the past year"
      />

      <div className="flex gap-4 flex-wrap mb-8">
        <StatCard label="Engaged" value={engaged} valueColor="#16A34A" />
        <StatCard label="Interest Forms" value={interestForms.length} />
        <StatCard label="Pending Approval" value={pending} valueColor="#D97706" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Recent activity
          </h2>
          {interestForms.length > 0 && (
            <button
              onClick={() => navigate("/school/interest-forms")}
              className="text-xs text-[#2563EB] hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-[#78716C] py-8 text-center">
            No engagements yet. Browse units or ambassadors to submit your first interest form.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] border-b border-[#E7E5E4]">
                <th className="pb-3 font-medium">Form</th>
                <th className="pb-3 font-medium">Requested</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((f) => (
                <tr key={f.id} className="border-b border-[#F5F5F4] last:border-0">
                  <td className="py-4 text-[#78716C] align-top">{f.id}</td>
                  <td className="py-4 align-top">
                    <TargetSummary target={f.target} compact />
                  </td>
                  <td className="py-4 text-[#57534E] align-top">{fmtDate(f.date)}</td>
                  <td className="py-4 text-[#57534E] align-top">
                    {getTier(f.tier)?.short ?? f.tier}
                  </td>
                  <td className="py-4 text-right align-top">
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
