import React from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { armyUpcomingEngagements, armyPastEngagements } from "../../data/matches";

const unitInfo = {
  battalion: "3rd Battalion, Singapore Infantry Regiment",
  company: "Alpha Company",
  poc: "CPT Tan Wei Ming",
  contact: "tan_weiming@defence.gov.sg",
};

export default function ArmyDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Unit Dashboard"
        subtitle="3 SIR, Alpha Company — engagement overview"
        action={
          <span className="px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium">
            3 SIR / Alpha Coy
          </span>
        }
      />

      <div className="flex gap-4 flex-wrap mb-8">
        <StatCard label="Assigned Schools" value="5" />
        <StatCard label="Completed" value="3" valueColor="#16A34A" />
        <StatCard label="Upcoming" value="2" valueColor="#2563EB" />
        <StatCard label="Next Engagement" value="25 Jun" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Upcoming engagements
          </h2>
          {armyUpcomingEngagements.map((e) => (
            <div
              key={e.school}
              className="flex items-center justify-between bg-[#F0F5FB] rounded-lg px-5 py-4 mb-3 last:mb-0"
            >
              <div>
                <p className="font-medium text-[#1C1917]">{e.school}</p>
                <p className="text-xs text-[#78716C] mt-0.5">{e.date}</p>
              </div>
              <StatusBadge status={e.status} />
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Unit information
          </h2>
          {[
            ["Battalion", unitInfo.battalion],
            ["Company", unitInfo.company],
            ["Point of contact", unitInfo.poc],
            ["Contact", unitInfo.contact],
          ].map(([label, value]) => (
            <div key={label} className="mb-4 last:mb-0">
              <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
              <p className="text-sm text-[#1C1917] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
          Past engagements
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#78716C] border-b border-[#E7E5E4]">
              <th className="pb-3 font-medium">School</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Activity</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {armyPastEngagements.map((e) => (
              <tr key={e.school} className="border-b border-[#F5F5F4] last:border-0">
                <td className="py-4 font-medium">{e.school}</td>
                <td className="py-4 text-[#57534E]">{e.date}</td>
                <td className="py-4 text-[#57534E]">{e.activity}</td>
                <td className="py-4 text-right"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}