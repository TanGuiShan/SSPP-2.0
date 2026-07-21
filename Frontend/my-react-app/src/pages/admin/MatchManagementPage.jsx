import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import EngagementRoster from "../../components/common/EngagementRoster";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useModal } from "../../hooks/useModal";
import { useEngagements } from "../../hooks/useEngagements";
import { getTier, TIMING_SLOTS } from "../../data/options";

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

// Filter keys map to statuses; "Awaiting" is the dashboard's "pending" bucket.
const FILTERS = [
  { key: "Awaiting confirmation", label: "Awaiting", statuses: ["Awaiting confirmation"] },
  { key: "Confirmed", label: "Confirmed", statuses: ["Confirmed"] },
  { key: "Cancelled", label: "Cancelled", statuses: ["Cancelled"] },
  { key: "All", label: "All", statuses: null },
];

// Dashboard deep-links use ?status=Approved|Pending — map those to the new keys.
const LEGACY_STATUS = { Approved: "Confirmed", Pending: "Awaiting confirmation", Rejected: "Cancelled" };

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

export default function MatchManagementPage() {
  const { matches, resetDemo } = useEngagements();
  const { open, payload, openModal, closeModal } = useModal();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState("Awaiting confirmation");

  useEffect(() => {
    const s = searchParams.get("status");
    if (!s) return;
    const mapped = LEGACY_STATUS[s] ?? s;
    if (FILTERS.some((f) => f.key === mapped)) setFilter(mapped);
  }, [searchParams]);

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const rows = matches
    .filter((m) => (active.statuses ? active.statuses.includes(m.status) : true))
    .slice()
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

  const awaitingCount = matches.filter((m) => m.status === "Awaiting confirmation").length;
  const liveMatch = payload ? matches.find((m) => m.id === payload.id) ?? payload : null;

  return (
    <>
      <PageHeader
        eyebrow="Match Results"
        title="Engagement matches"
        subtitle="Monitoring only — providers confirm their own engagements"
        action={
          <Button variant="ghost" size="sm" onClick={resetDemo}>
            Reset demo data
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f.key
                ? "bg-[#1C1917] text-white font-medium"
                : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
            }`}
          >
            {f.label}
            {f.key === "Awaiting confirmation" && awaitingCount > 0 && (
              <span className={`ml-2 text-xs ${filter === f.key ? "text-white/60" : "text-[#B45309]"}`}>
                {awaitingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">No engagements in this view.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">School</th>
                <th className="px-6 py-4 font-medium">Engaging</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Confirmed</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const done = m.roster?.filter((r) => r.confirmed).length ?? 0;
                const total = m.roster?.length ?? 0;
                return (
                  <tr
                    key={m.id}
                    onClick={() => openModal(m)}
                    className="border-b border-[#F5F5F4] last:border-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-[#78716C] align-middle">{m.id}</td>
                    <td className="px-6 py-4 font-medium align-middle">{m.school}</td>
                    <td className="px-6 py-4 align-middle">
                      <TargetSummary target={m.target} compact />
                    </td>
                    <td className="px-6 py-4 text-[#57534E] align-middle">{fmtDate(m.date)}</td>
                    <td className="px-6 py-4 align-middle text-[#57534E]">
                      {done}/{total}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        title="Engagement details"
        subtitle={liveMatch?.id}
        variant="drawer"
      >
        {liveMatch && (
          <>
            <div className="flex justify-end mb-6">
              <StatusBadge status={liveMatch.status} />
            </div>

            <DetailRow label="School">{liveMatch.school}</DetailRow>
            <DetailRow label="Requested">
              <TargetSummary target={liveMatch.target} />
            </DetailRow>

            <div className="h-px bg-[#E7E5E4] my-6" />

            <DetailRow label="Date">{fmtDate(liveMatch.date)}</DetailRow>
            <DetailRow label="Timing">
              {liveMatch.timings?.map(timingLabel).join(", ") || "—"}
            </DetailRow>
            <DetailRow label="Engagement tier">
              {getTier(liveMatch.tier)?.name ?? liveMatch.tier}
            </DetailRow>
            <DetailRow label="Size">{liveMatch.participants} pax</DetailRow>
            {liveMatch.notes && <DetailRow label="Notes">{liveMatch.notes}</DetailRow>}

            <div className="h-px bg-[#E7E5E4] my-6" />

            <EngagementRoster match={liveMatch} />

            <div className="mt-8">
              <Button variant="secondary" fullWidth onClick={closeModal}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
