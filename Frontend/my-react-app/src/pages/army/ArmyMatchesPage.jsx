import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { armyEngagementTabs } from "../../data/matches";

const TABS = ["Upcoming Matched", "Unengaged", "Post Engagement"];

const EMPTY_COPY = {
  "Upcoming Matched": "No matched engagements yet. Add available dates so schools can find your unit.",
  Unengaged: "Nothing unengaged. Every request has a unit assigned.",
  "Post Engagement": "No completed engagements to review yet.",
};

export default function ArmyMatchesPage() {
  const [tab, setTab] = useState(TABS[0]);
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
          <div key={r.school} className="card px-6 py-5 flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="font-semibold text-[#1C1917]">{r.school}</p>
              <p className="text-sm text-[#78716C] mt-0.5">{r.unit}</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium shrink-0">
              {r.date}
            </span>
          </div>
        ))
      )}
    </>
  );
}