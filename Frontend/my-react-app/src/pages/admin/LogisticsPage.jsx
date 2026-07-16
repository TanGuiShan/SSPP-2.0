import React from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

// Wireframe for this screen wasn't in the deck — this is a reasonable first pass.
const LOGISTICS = [
  { code: "AWEE-2026-001", school: "Swiss Cottage Secondary School", unit: "3 SIR, Alpha Coy", date: "25 Jul 2026", equipment: "Light strike vehicle, comms set", status: "Confirmed" },
  { code: "AWEE-2026-002", school: "ABC Primary School", unit: "1 GDS, Bravo Coy", date: "8 Aug 2026", equipment: "Slide deck, uniform display", status: "Pending" },
];

export default function LogisticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Logistics"
        title="Equipment and transport"
        subtitle="What each confirmed match needs moved, and when"
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">School</th>
              <th className="px-6 py-4 font-medium">Unit</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Equipment</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {LOGISTICS.map((l) => (
              <tr key={l.code} className="border-b border-[#F5F5F4] last:border-0">
                <td className="px-6 py-4 text-[#78716C]">{l.code}</td>
                <td className="px-6 py-4 font-medium">{l.school}</td>
                <td className="px-6 py-4 text-[#57534E]">{l.unit}</td>
                <td className="px-6 py-4 text-[#57534E]">{l.date}</td>
                <td className="px-6 py-4 text-[#57534E]">{l.equipment}</td>
                <td className="px-6 py-4 text-right"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}