import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { TIERS } from "../../data/options";

// Wireframe for this screen wasn't in the deck — this is a reasonable first pass.
// Tiers now come from data/options.js so the admin view, the signup forms and
// the interest form can't drift apart.
const TIER_META = {
  tier1: { maxParticipants: 200, equipment: ["Slide deck", "Uniform display"] },
  tier2: { maxParticipants: 120, equipment: ["Light strike vehicle", "Comms set", "Personal weapons"] },
  tier3: { maxParticipants: 60, equipment: ["Simulator", "Obstacle course kit", "Field pack"] },
};

export default function TierConfigPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tier Config"
        title="Engagement tiers"
        subtitle="Each tier implies its own mobility — Tier 1 is sharing only, Tiers 2 and 3 include booth setup"
        action={<Button>Add tier</Button>}
      />

      {TIERS.map((t) => {
        const meta = TIER_META[t.id] ?? { maxParticipants: "—", equipment: [] };
        return (
          <div key={t.id} className="card p-6 mb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-semibold text-[#1C1917]">{t.name}</p>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      t.requiresBooth
                        ? "bg-[#DBEAFE] text-[#1D4ED8]"
                        : "bg-[#F5F5F4] text-[#57534E]"
                    }`}
                  >
                    {t.requiresBooth ? "Booth setup required" : "No booth"}
                  </span>
                </div>
                <p className="text-sm text-[#78716C] mt-1">{t.description}</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">Max participants</p>
                <p className="text-[#1C1917] mt-0.5">{meta.maxParticipants}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-1.5">
                  Default equipment options
                </p>
                <div className="flex flex-wrap gap-2">
                  {meta.equipment.length === 0 ? (
                    <span className="text-xs text-[#A8A29E] italic">None</span>
                  ) : (
                    meta.equipment.map((e) => (
                      <span key={e} className="px-3 py-1 rounded-full bg-[#F5F5F4] text-xs text-[#44403C]">
                        {e}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
