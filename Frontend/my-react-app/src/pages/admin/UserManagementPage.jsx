import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";

// Wireframe for this screen wasn't in the deck — this is a reasonable first pass.
const USERS = [
  { id: 1, name: "Swiss Cottage Secondary School", email: "contact@swisscottage.edu.sg", role: "School", status: "Approved" },
  { id: 2, name: "3 SIR, Alpha Company", email: "tan_weiming@defence.gov.sg", role: "Unit", status: "Approved" },
  { id: 3, name: "ABC Primary School", email: "admin@abcpri.edu.sg", role: "School", status: "Pending" },
  { id: 4, name: "1 GDS, Bravo Company", email: "ops@1gds.gov.sg", role: "Unit", status: "Approved" },
];

const FILTERS = ["All", "School", "Unit"];

export default function UserManagementPage() {
  const [filter, setFilter] = useState("All");
  const rows = filter === "All" ? USERS : USERS.filter((u) => u.role === filter);

  return (
    <>
      <PageHeader
        eyebrow="Manage Users"
        title="Schools and units"
        subtitle="Approve new accounts and manage existing ones"
      />

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? "bg-[#1C1917] text-white font-medium"
                : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-[#F5F5F4] last:border-0">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4 text-[#78716C]">{u.email}</td>
                <td className="px-6 py-4 text-[#57534E]">{u.role}</td>
                <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}