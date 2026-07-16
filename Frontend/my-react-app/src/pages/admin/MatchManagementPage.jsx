import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { TextArea } from "../../components/common/Input";
import { useModal } from "../../hooks/useModal";
import { useEngagements } from "../../hooks/useEngagements";
import { getTier, TIMING_SLOTS } from "../../data/options";

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

const FILTERS = ["Pending", "Approved", "Rejected", "All"];

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

export default function MatchManagementPage() {
  const { interestForms, approveInterest, rejectInterest, resetDemo } = useEngagements();
  const { open, payload, openModal, closeModal } = useModal();
  const [filter, setFilter] = useState("Pending");
  const [reason, setReason] = useState("");

  const rows =
    filter === "All" ? interestForms : interestForms.filter((f) => f.status === filter);

  const pendingCount = interestForms.filter((f) => f.status === "Pending").length;

  const handleApprove = (id) => {
    approveInterest(id);
    closeModal();
  };

  const handleReject = (id) => {
    rejectInterest(id, reason.trim());
    setReason("");
    closeModal();
  };

  return (
    <>
      <PageHeader
        eyebrow="Match Results"
        title="Approve and match requests"
        subtitle="Approving a request creates a confirmed match for both the school and the unit"
        action={
          <Button variant="ghost" size="sm" onClick={resetDemo}>
            Reset demo data
          </Button>
        }
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
              <span
                className={`ml-2 text-xs ${filter === f ? "text-white/60" : "text-[#A8A29E]"}`}
              >
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
                ? "Nothing waiting for approval."
                : `No ${filter.toLowerCase()} requests.`}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Form ID</th>
                <th className="px-6 py-4 font-medium">School</th>
                <th className="px-6 py-4 font-medium">Requested</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => openModal(f)}
                  className="border-b border-[#F5F5F4] last:border-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-[#78716C] align-top">{f.id}</td>
                  <td className="px-6 py-4 font-medium align-top">{f.school}</td>
                  <td className="px-6 py-4 align-top">
                    <TargetSummary target={f.target} compact />
                  </td>
                  <td className="px-6 py-4 text-[#57534E] align-top">{fmtDate(f.date)}</td>
                  <td className="px-6 py-4 text-[#57534E] align-top">
                    {getTier(f.tier)?.short ?? f.tier}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    {f.status === "Pending" ? (
                      <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => openModal(f)}>
                          Review
                        </Button>
                        <Button size="sm" onClick={() => approveInterest(f.id)}>
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
        )}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        title="Review request"
        subtitle={payload?.id}
        variant="drawer"
      >
        {payload && (
          <>
            <div className="flex justify-end mb-6">
              <StatusBadge status={payload.status} />
            </div>

            <DetailRow label="School">{payload.school}</DetailRow>
            <DetailRow label="Requested">
              <TargetSummary target={payload.target} showRoster />
            </DetailRow>

            <div className="h-px bg-[#E7E5E4] my-6" />

            <DetailRow label="Preferred date">{fmtDate(payload.date)}</DetailRow>
            <DetailRow label="Preferred timing">
              {payload.timings?.map(timingLabel).join(", ") || "—"}
            </DetailRow>
            <DetailRow label="Engagement tier">
              {getTier(payload.tier)?.name ?? payload.tier}
            </DetailRow>
            <DetailRow label="Size">{payload.participants} pax</DetailRow>
            {payload.notes && <DetailRow label="Notes">{payload.notes}</DetailRow>}

            {payload.status === "Pending" && (
              <>
                <div className="h-px bg-[#E7E5E4] my-6" />
                <TextArea
                  label="Rejection reason"
                  rows={3}
                  placeholder="Only needed if you're rejecting — the school will see this."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => handleReject(payload.id)}
                  >
                    Reject
                  </Button>
                  <Button fullWidth onClick={() => handleApprove(payload.id)}>
                    Approve &amp; create match
                  </Button>
                </div>
              </>
            )}

            {payload.status === "Approved" && payload.matchId && (
              <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mt-2">
                Approved — match {payload.matchId} created.
              </div>
            )}

            {payload.status === "Rejected" && (
              <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mt-2">
                {payload.rejectionReason || "Rejected."}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
