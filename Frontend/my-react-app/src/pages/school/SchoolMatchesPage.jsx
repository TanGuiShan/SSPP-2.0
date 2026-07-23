import { useEffect, useMemo, useState } from "react";
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
import TabFilter from "../../components/common/TabFilter";
import { TAB, tabsFor, applyTab, resolveTab, TAB_PARAM } from "../../utils/tabs";

// Shared tab definitions — same everywhere (see utils/tabs.js).
const TABS = tabsFor([TAB.ALL, TAB.OPEN, TAB.AWAITING, TAB.CONFIRMED, TAB.CANCELLED]);

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

export default function SchoolMatchesPage() {
  const { matches, cancelMatch } = useEngagements();
  const { open, payload, openModal, closeModal } = useModal();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB.ALL);

  // Dashboard stat cards deep-link here, e.g. /school/matches?tab=confirmed
  useEffect(() => {
    setTab(resolveTab(searchParams.get(TAB_PARAM), TABS, TAB.ALL));
  }, [searchParams]);

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rows = useMemo(() => applyTab(matches, activeTab), [matches, activeTab]);

  const handleCancel = (id) => {
    cancelMatch(id);
    closeModal();
  };

  return (
    <>
      <PageHeader
        eyebrow="My Matches"
        title="Your engagements"
        subtitle="Track who has confirmed for each engagement"
      />

      {matches.length > 0 && (
        <TabFilter tabs={TABS} value={tab} onChange={setTab} items={matches} />
      )}

      {rows.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-sm text-[#78716C]">
            {matches.length === 0
              ? "No engagements yet. Submit an interest form to get started."
              : `No ${activeTab.label.toLowerCase()} engagements.`}
          </p>
        </div>
      ) : (
        rows.map((m) => (
          <button
            key={m.id}
            onClick={() => openModal(m)}
            className="card w-full text-left px-6 py-5 flex items-center justify-between gap-4 mb-4 hover:border-[#A8A29E] transition-colors"
          >
            <div className="min-w-0">
              <p className="text-xs text-[#A8A29E] mb-1.5">Code: {m.id}</p>
              <TargetSummary target={m.target} />
              <p className="text-sm text-[#78716C] mt-1.5">
                {fmtDate(m.date)} · {m.participants} pax · {getTier(m.tier)?.short ?? m.tier}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={m.status} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </button>
        ))
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title="Engagement details"
        subtitle={payload?.id}
        variant="drawer"
      >
        {payload && (
          <>
            <div className="flex justify-end mb-6">
              <StatusBadge status={payload.status} />
            </div>

            <DetailRow label="Engaging">
              <TargetSummary target={payload.target} showRoster />
            </DetailRow>

            <div className="h-px bg-[#E7E5E4] my-6" />

            <DetailRow label="Date">{fmtDate(payload.date)}</DetailRow>
            <DetailRow label="Timing">
              {payload.timings?.map(timingLabel).join(", ") || "—"}
            </DetailRow>
            <DetailRow label="Engagement tier">
              {getTier(payload.tier)?.name ?? payload.tier}
            </DetailRow>
            <DetailRow label="Size">{payload.participants} pax</DetailRow>
            {payload.notes && <DetailRow label="Notes">{payload.notes}</DetailRow>}
            {payload.formId && (
              <DetailRow label="From request">{payload.formId}</DetailRow>
            )}

            <div className="h-px bg-[#E7E5E4] my-6" />

            <EngagementRoster match={payload} />

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" fullWidth onClick={closeModal}>
                Close
              </Button>
              {payload.status === "Confirmed" && (
                <Button variant="danger" fullWidth onClick={() => handleCancel(payload.id)}>
                  Cancel engagement
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
