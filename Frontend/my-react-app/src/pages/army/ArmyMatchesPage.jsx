import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { useModal } from "../../hooks/useModal";
import { armyEngagementTabs } from "../../data/matches";

const TABS = ["Upcoming Matched", "Unengaged", "Post Engagement"];

const EMPTY_COPY = {
  "Upcoming Matched": "No matched engagements yet. Add available dates so schools can find your unit.",
  Unengaged: "Nothing unengaged. Every request has a unit assigned.",
  "Post Engagement": "No completed engagements to review yet.",
};

// Small label/value row used throughout the details drawer
function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

function EngagementDetails({ engagement }) {
  if (!engagement) return null;
  const { id, school, unit, date, time, tier, participants, status, venue, address, schoolPoc, equipment, notes } = engagement;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-[#A8A29E]">Code: {id}</span>
        <StatusBadge status={status} />
      </div>

      <DetailRow label="School">{school}</DetailRow>
      <DetailRow label="Unit">{unit}</DetailRow>
      <DetailRow label="Date & time">
        {date}{time && time !== "TBC" ? `, ${time}` : ""}
      </DetailRow>
      <DetailRow label="Engagement type">{tier}</DetailRow>
      <DetailRow label="Participants">{participants} students</DetailRow>

      <div className="h-px bg-[#E7E5E4] my-6" />

      <DetailRow label="Venue">
        {venue}
        <p className="text-[#78716C] mt-0.5">{address}</p>
      </DetailRow>

      <DetailRow label="School point of contact">
        {schoolPoc.name}
        <p className="text-[#78716C]">{schoolPoc.role}</p>
        <p className="text-[#78716C] mt-1">{schoolPoc.phone}</p>
        <a href={`mailto:${schoolPoc.email}`} className="text-[#2563EB] hover:underline">
          {schoolPoc.email}
        </a>
      </DetailRow>

      <div className="h-px bg-[#E7E5E4] my-6" />

      <DetailRow label="Equipment">
        {equipment.length === 0 ? (
          <span className="text-[#A8A29E] italic">None required</span>
        ) : (
          <div className="flex flex-wrap gap-2 mt-1.5">
            {equipment.map((e) => (
              <span key={e} className="px-3 py-1 rounded-full bg-[#F5F5F4] text-xs text-[#44403C]">
                {e}
              </span>
            ))}
          </div>
        )}
      </DetailRow>

      {notes && <DetailRow label="Notes">{notes}</DetailRow>}
    </>
  );
}

export default function ArmyMatchesPage() {
  const [tab, setTab] = useState(TABS[0]);
  const { open, payload, openModal, closeModal } = useModal();
  const rows = armyEngagementTabs[tab] || [];

  return (
    <>
      <PageHeader
        eyebrow="My Engagements"
        title="My Engagements"
        subtitle="Browse and manage your school-unit engagements"
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === t
                ? "bg-[#1C1917] text-white font-medium"
                : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-sm text-[#78716C]">{EMPTY_COPY[tab]}</p>
        </div>
      ) : (
        rows.map((r) => (
          <button
            key={r.id}
            onClick={() => openModal(r)}
            className="card w-full text-left px-6 py-5 flex items-center justify-between gap-4 mb-4 hover:border-[#A8A29E] transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <p className="font-semibold text-[#1C1917]">{r.school}</p>
              <p className="text-sm text-[#78716C] mt-0.5">
                {r.unit} · {r.tier}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium">
                {r.date}
              </span>
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
        subtitle={payload?.school}
        variant="drawer"
      >
        <EngagementDetails engagement={payload} />

        <div className="flex gap-3 mt-8">
          <Button variant="secondary" fullWidth onClick={closeModal}>
            Close
          </Button>
          {payload?.status === "Confirmed" && (
            <Button fullWidth onClick={() => console.log("Contact school", payload.id)}>
              Contact school
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}