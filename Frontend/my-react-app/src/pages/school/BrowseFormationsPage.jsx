import React, { useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import FilterBar from "../../components/common/FilterBar";
import FormationCard from "../../components/formation/FormationCard";
import AmbassadorCard from "../../components/formation/AmbassadorCard";
import InterestFormModal from "../../components/formation/InterestFormModal";
import Button from "../../components/common/Button";
import { useModal } from "../../hooks/useModal";
import { formations } from "../../data/formations";
import { ambassadors } from "../../data/ambassadors";
import { FORMATIONS, TOPICS, SCHOOL_LEVELS, MOBILITY_OPTIONS } from "../../data/options";
import { applyFilters, emptyFilters } from "../../utils/filtering";

const TABS = [
  { id: "units", label: "Units" },
  { id: "ambassadors", label: "Ambassadors" },
];

// Same filter groups for both tabs — the data shapes line up deliberately.
const FILTER_GROUPS = [
  { key: "formation", label: "Formation", options: FORMATIONS },
  { key: "mobility", label: "Engagement type", options: MOBILITY_OPTIONS.map(({ value, label }) => ({ value, label })) },
  { key: "topics", label: "Topics", options: TOPICS },
  { key: "levelsPreferred", label: "School level", options: SCHOOL_LEVELS },
];

export default function BrowseFormationsPage() {
  const [tab, setTab] = useState("units");
  // Separate filter state per tab so switching tabs doesn't wipe your work
  const [unitFilters, setUnitFilters] = useState(emptyFilters);
  const [ambFilters, setAmbFilters] = useState(emptyFilters);
  // Team-forming: ambassadors picked so far
  const [team, setTeam] = useState([]);

  const { open, payload, openModal, closeModal } = useModal();

  const filteredUnits = useMemo(() => applyFilters(formations, unitFilters), [unitFilters]);
  const filteredAmbs = useMemo(() => applyFilters(ambassadors, ambFilters), [ambFilters]);

  const isAmbTab = tab === "ambassadors";
  const teamMode = team.length > 0;

  const toggleTeamMember = (amb) =>
    setTeam((t) =>
      t.some((m) => m.id === amb.id) ? t.filter((m) => m.id !== amb.id) : [...t, amb]
    );

  const handleSubmit = (data) => {
    console.log("Interest form submitted", data);
    closeModal();
    setTeam([]);
  };

  // A team can only do booth setup if every member can.
  const teamMobility = team.every((m) => m.mobility === "sharing_booth")
    ? "sharing_booth"
    : "sharing";

  return (
    <>
      <PageHeader
        eyebrow="My Interest Form"
        title="Browse Army Formation"
        subtitle="Explore available units and ambassadors for engagement"
      />

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === t.id
                ? "bg-[#1C1917] text-white font-medium"
                : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
            }`}
          >
            {t.label}
            <span className={`ml-2 text-xs ${tab === t.id ? "text-white/60" : "text-[#A8A29E]"}`}>
              {t.id === "units" ? formations.length : ambassadors.length}
            </span>
          </button>
        ))}
      </div>

      <FilterBar
        filters={isAmbTab ? ambFilters : unitFilters}
        onChange={isAmbTab ? setAmbFilters : setUnitFilters}
        groups={FILTER_GROUPS}
        resultCount={isAmbTab ? filteredAmbs.length : filteredUnits.length}
        totalCount={isAmbTab ? ambassadors.length : formations.length}
      />

      {isAmbTab && (
        <div className="rounded-lg bg-[#F5F5F4] px-5 py-3.5 mb-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-[#57534E]">
            Tick more than one ambassador to form a team, then submit a single interest form.
          </p>
          {teamMode && (
            <Button variant="ghost" size="sm" onClick={() => setTeam([])}>
              Clear selection
            </Button>
          )}
        </div>
      )}

      {/* ── Units tab ── */}
      {!isAmbTab &&
        (filteredUnits.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="text-sm text-[#78716C]">
              No units match those filters. Try widening the date range or clearing a filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((f) => (
              <FormationCard key={f.id} formation={f} onInterested={openModal} />
            ))}
          </div>
        ))}

      {/* ── Ambassadors tab ── */}
      {isAmbTab &&
        (filteredAmbs.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="text-sm text-[#78716C]">
              No ambassadors match those filters. Try widening the date range or clearing a filter.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 ${teamMode ? "pb-28" : ""}`}>
            {filteredAmbs.map((a) => (
              <AmbassadorCard
                key={a.id}
                ambassador={a}
                selectable
                selected={team.some((m) => m.id === a.id)}
                onToggleSelect={toggleTeamMember}
              />
            ))}
          </div>
        ))}

      {/* Sticky team bar — only while ambassadors are selected */}
      {isAmbTab && teamMode && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-white border-t border-[#E7E5E4] px-6 md:px-10 py-4 z-30 shadow-[0_-2px_12px_rgba(28,25,23,0.06)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1C1917]">
                {team.length} ambassador{team.length > 1 ? "s" : ""} selected
                <span
                  className={`ml-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    teamMobility === "sharing_booth"
                      ? "bg-[#DBEAFE] text-[#1D4ED8]"
                      : "bg-[#F5F5F4] text-[#57534E]"
                  }`}
                >
                  {teamMobility === "sharing_booth" ? "Can do booth setup" : "Sharing only"}
                </span>
              </p>
              <p className="text-xs text-[#78716C] mt-0.5 truncate">
                {team.map((m) => `${m.rank} ${m.name.split(" ")[0]}`).join(", ")}
              </p>
            </div>
            <Button onClick={() => openModal({ team, isTeam: true })} className="shrink-0">
              Submit interest form
            </Button>
          </div>
        </div>
      )}

      <InterestFormModal
        open={open}
        formation={payload}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
