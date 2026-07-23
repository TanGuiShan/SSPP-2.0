import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { emailDomain } from "../../utils/domain";
import DataTable from "../../components/common/DataTable";

// Demo volunteer signups awaiting approval. In production these come from the
// backend — accounts created from non-gov domains, held until an admin acts.
// TODO(real): GET /admin/pending-users ; POST /admin/users/:id/approve|reject
const SEED_USERS = [
  { id: "u-101", name: "Jasmine Koh", email: "jasmine.koh@gmail.com", role: "Ambassador (volunteer)", requestedAt: "2026-07-15", status: "Pending" },
  { id: "u-102", name: "Arjun Mehta", email: "arjun.mehta@outlook.com", role: "Ambassador (volunteer)", requestedAt: "2026-07-17", status: "Pending" },
  { id: "u-103", name: "Community Youth Corps", email: "contact@youthcorps.org", role: "School (volunteer)", requestedAt: "2026-07-12", status: "Approved" },
  { id: "u-104", name: "Lim Wei Sheng", email: "weisheng@yahoo.com.sg", role: "Ambassador (volunteer)", requestedAt: "2026-07-10", status: "Rejected" },
];

const FILTERS = ["Pending", "Approved", "Rejected", "All"];

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

export default function UserManagementPage() {
  const [users, setUsers] = useState(SEED_USERS);
  const [filter, setFilter] = useState("Pending");

  const setStatus = (id, status) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

  const rows = filter === "All" ? users : users.filter((u) => u.status === filter);
  const pendingCount = users.filter((u) => u.status === "Pending").length;

  return (
    <>
      <PageHeader
        eyebrow="Manage Users"
        title="Volunteer approvals"
        subtitle="Government staff get in automatically. Volunteers from outside domains wait here for approval."
      />

      <div className="flex gap-2 mb-6 flex-wrap">
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
            {f === "Pending" && pendingCount > 0 && (
              <span className={`ml-2 text-xs ${filter === f ? "text-white/60" : "text-[#B45309]"}`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">
              {filter === "Pending" ? "No volunteers waiting for approval." : `No ${filter.toLowerCase()} volunteers.`}
            </p>
          </div>
        ) : (
          <DataTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Requested role</th>
                <th className="px-6 py-4 font-medium">Applied</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-[#F5F5F4] last:border-0">
                  <td className="px-6 py-4 font-medium align-middle">{u.name}</td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-[#1C1917]">{u.email}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#78716C] text-[10px]">
                      {emailDomain(u.email)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#57534E] align-middle">{u.role}</td>
                  <td className="px-6 py-4 text-[#57534E] align-middle">{fmtDate(u.requestedAt)}</td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    {u.status === "Pending" ? (
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setStatus(u.id, "Rejected")}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => setStatus(u.id, "Approved")}>
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
          </DataTable>
        )}
      </div>
    </>
  );
}
