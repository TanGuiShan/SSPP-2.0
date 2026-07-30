import { useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { emailDomain } from "../../utils/domain";
import DataTable from "../../components/common/DataTable";
import { useCollection } from "../../hooks/useCollection";
import { approveUser, rejectUser } from "../../services/firebase/profile.service";

// Users now come straight from Firestore: a live subscription to the `users`
// collection. Each doc is created at sign-up with role + approved flags, so this
// page reflects real signups and updates itself the moment a status changes.
// Government (.gov.sg/.edu.sg) domains are auto-approved at signup; everyone
// else lands here as Pending until an admin acts.

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

const ROLE_LABEL = {
  school: "School",
  "army-unit": "Army unit",
  "army-ambassador": "Army ambassador",
  admin: "Admin",
};
const roleLabel = (r) => ROLE_LABEL[r] ?? r ?? "—";

// Firestore stores createdAt as a Timestamp. Tolerate Timestamp, {seconds},
// an ISO string, or a not-yet-resolved serverTimestamp (null just after write).
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const fmtDate = (value) => {
  const d = toDate(value);
  return d
    ? d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })
    : "—";
};

// Derive a display status from the stored flags.
function statusOf(u) {
  if (u.rejected) return "Rejected";
  if (u.approved) return "Approved";
  return "Pending";
}

// Best display name across the roles: schools store schoolName, providers a
// fullName; fall back to the email's local part so a row is never blank.
const displayName = (u) =>
  u.fullName || u.schoolName || u.providerName || (u.email ? u.email.split("@")[0] : "Unnamed");

export default function UserManagementPage() {
  const users = useCollection("users");
  const [filter, setFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  // Decorate + sort newest-first once, then filter for display.
  const decorated = useMemo(
    () =>
      users
        .map((u) => ({ ...u, _status: statusOf(u), _name: displayName(u) }))
        .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)),
    [users]
  );

  const rows = filter === "All" ? decorated : decorated.filter((u) => u._status === filter);
  const pendingCount = decorated.filter((u) => u._status === "Pending").length;

  // The live subscription repaints the row after the write lands, so there's no
  // local state to update — just guard against double-clicks and surface errors.
  const act = async (uid, fn) => {
    setError("");
    setBusyId(uid);
    try {
      await fn(uid);
    } catch (e) {
      setError(e?.message ?? "Couldn't update that user. Try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Manage Users"
        title="Volunteer approvals"
        subtitle="Government staff get in automatically. Volunteers from outside domains wait here for approval."
      />

      {error && (
        <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

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
              {filter === "Pending"
                ? "No volunteers waiting for approval."
                : `No ${filter.toLowerCase()} users.`}
            </p>
          </div>
        ) : (
          <DataTable>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Signed up</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-[#F5F5F4] last:border-0">
                    <td className="px-6 py-4 font-medium align-middle">{u._name}</td>
                    <td className="px-6 py-4 align-middle">
                      <span className="text-[#1C1917]">{u.email ?? "—"}</span>
                      {u.email && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#78716C] text-[10px]">
                          {emailDomain(u.email)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#57534E] align-middle">{roleLabel(u.role)}</td>
                    <td className="px-6 py-4 text-[#57534E] align-middle">{fmtDate(u.createdAt)}</td>
                    <td className="px-6 py-4 align-middle">
                      <StatusBadge status={u._status} />
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      {u._status === "Pending" ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyId === u.id}
                            onClick={() => act(u.id, rejectUser)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            loading={busyId === u.id}
                            disabled={busyId === u.id}
                            onClick={() => act(u.id, approveUser)}
                          >
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
