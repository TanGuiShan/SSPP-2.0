import React from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useModal } from "../../hooks/useModal";
import { useEngagements } from "../../hooks/useEngagements";
import { getTier, TIMING_SLOTS } from "../../data/options";

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

export default function InterestFormsPage() {
  const { interestForms, withdrawInterest } = useEngagements();
  const { open, payload, openModal, closeModal } = useModal();

  const handleWithdraw = (id) => {
    withdrawInterest(id);
    closeModal();
  };

  return (
    <>
      <PageHeader
        eyebrow="My Interest Form"
        title="Track submitted requests"
        subtitle="Forms stay pending until an admin approves them and creates a match"
      />

      <div className="card overflow-hidden">
        {interestForms.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">
              No requests yet. Browse units or ambassadors to submit one.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Form ID</th>
                <th className="px-6 py-4 font-medium">Requested</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Pax</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {interestForms.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => openModal(f)}
                  className="border-b border-[#F5F5F4] last:border-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-[#78716C] align-top">{f.id}</td>
                  <td className="px-6 py-4 align-top">
                    <TargetSummary target={f.target} compact />
                  </td>
                  <td className="px-6 py-4 text-[#57534E] align-top">{fmtDate(f.date)}</td>
                  <td className="px-6 py-4 text-[#57534E] align-top">
                    {getTier(f.tier)?.short ?? f.tier}
                  </td>
                  <td className="px-6 py-4 text-[#57534E] align-top">{f.participants}</td>
                  <td className="px-6 py-4 align-top">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    {f.status === "Pending" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          withdrawInterest(f.id);
                        }}
                        className="text-xs text-[#B91C1C] hover:underline"
                      >
                        Withdraw
                      </button>
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
        title="Request details"
        subtitle={payload?.id}
        variant="drawer"
      >
        {payload && (
          <>
            <div className="flex justify-end mb-6">
              <StatusBadge status={payload.status} />
            </div>

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

            {payload.status === "Approved" && payload.matchId && (
              <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mt-6">
                Approved — see it under My Matches as {payload.matchId}.
              </div>
            )}

            {payload.status === "Rejected" && payload.rejectionReason && (
              <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mt-6">
                {payload.rejectionReason}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" fullWidth onClick={closeModal}>
                Close
              </Button>
              {payload.status === "Pending" && (
                <Button variant="danger" fullWidth onClick={() => handleWithdraw(payload.id)}>
                  Withdraw
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
