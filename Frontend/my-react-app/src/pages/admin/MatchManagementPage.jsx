import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";

// Wireframe for this screen wasn't in the deck — this is a reasonable first pass.
const INITIAL = [
  { id: "IF1", school: "Swiss Cottage Secondary School", formation: "Armoured Brigade", date: "22/07/2026", tier: "Tier 2", participants: 80, status: "Pending" },
  { id: "IF2", school: "ABC Primary School", formation: "Signal Brigade", date: "25/07/2026", tier: "Tier 1", participants: 40, status: "Pending" },
  { id: "IF3", school: "DEF Secondary School", formation: "Infantry Brigade", date: "08/08/2026", tier: "Tier 3", participants: 60, status: "Approved" },
];

export default function MatchManagementPage() {
  const [rows, setRows] = useState(INITIAL);

  const setStatus = (id, status) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, status } : row)));

  return (
    <>
      <PageHeader
        eyebrow="Match Results"
        title="Approve and match requests"
        subtitle="Approving a request creates a confirmed match for both the school and the unit"
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
              <th className="px-6 py-4 font-medium">Form ID</th>
              <th className="px-6 py-4 font-medium">School</th>
              <th className="px-6 py-4 font-medium">Formation</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Tier</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[#F5F5F4] last:border-0">
                <td className="px-6 py-4 text-[#78716C]">{r.id}</td>
                <td className="px-6 py-4 font-medium">{r.school}</td>
                <td className="px-6 py-4 text-[#57534E]">{r.formation}</td>
                <td className="px-6 py-4 text-[#57534E]">{r.date}</td>
                <td className="px-6 py-4 text-[#57534E]">{r.tier}</td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4 text-right">
                  {r.status === "Pending" ? (
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setStatus(r.id, "Cancelled")}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => setStatus(r.id, "Approved")}>
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[#A8A29E] text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}