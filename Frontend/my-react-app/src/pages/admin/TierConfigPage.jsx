import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

// Wireframe for this screen wasn't in the deck — this is a reasonable first pass.
const INITIAL_TIERS = [
  { id: "tier1", name: "Tier 1 — Talk / Briefing", description: "Classroom session, no equipment moved off-camp", maxParticipants: 200, equipment: ["Slide deck", "Uniform display"] },
  { id: "tier2", name: "Tier 2 — Static Display", description: "Vehicles and equipment brought to the school", maxParticipants: 120, equipment: ["Light strike vehicle", "Comms set", "Personal weapons"] },
  { id: "tier3", name: "Tier 3 — Hands-on Experience", description: "Students handle equipment under supervision", maxParticipants: 60, equipment: ["Simulator", "Obstacle course kit", "Field pack"] },
];

export default function TierConfigPage() {
  const [tiers] = useState(INITIAL_TIERS);

  return (
    <>
      <PageHeader
        eyebrow="Tier Config"
        title="Engagement tiers"
        subtitle="Define what each tier includes and how many students it can take"
        action={<Button>Add tier</Button>}
      />

      {tiers.map((t) => (
        <div key={t.id} className="card p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-semibold text-[#1C1917]">{t.name}</p>
              <p className="text-sm text-[#78716C] mt-0.5">{t.description}</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">Max participants</p>
              <p className="text-[#1C1917] mt-0.5">{t.maxParticipants}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-1.5">Equipment options</p>
              <div className="flex flex-wrap gap-2">
                {t.equipment.map((e) => (
                  <span key={e} className="px-3 py-1 rounded-full bg-[#F5F5F4] text-xs text-[#44403C]">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}