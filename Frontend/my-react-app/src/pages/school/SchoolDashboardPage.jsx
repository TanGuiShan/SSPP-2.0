import React from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { schoolMatches } from "../../data/matches";

export default function SchoolDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Overall School's Engagement"
        subtitle="Engagement analytics for the past year"
      />

      <div className="flex gap-4 flex-wrap mb-8">
        <StatCard label="Engaged" value="4" valueColor="#16A34A" />
        <StatCard label="Interest Forms" value="1" valueColor="#1C1917" />
        <StatCard label="Pending Approval" value="1" valueColor="#D97706" />
      </div>

      <div className="card p-6">
        <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
          Recent activity
        </h2>
        {schoolMatches.length === 0 ? (
          <p className="text-sm text-[#78716C] py-8 text-center">
            No engagements yet. Browse formations to submit your first interest form.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] border-b border-[#E7E5E4]">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Formation</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {schoolMatches.map((m) => (
                <tr key={m.code} className="border-b border-[#F5F5F4] last:border-0">
                  <td className="py-4 text-[#78716C]">{m.code}</td>
                  <td className="py-4 font-medium">{m.name}</td>
                  <td className="py-4 text-[#57534E]">{m.date}</td>
                  <td className="py-4 text-right">
                    <StatusBadge status={m.action} />
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