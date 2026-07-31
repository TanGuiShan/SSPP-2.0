import { useState } from "react";
import Modal from "../common/Modal";
import { Input, TextArea, Select } from "../common/Input";
import { MultiSelect } from "../common/MultiSelect";
import Button from "../common/Button";
import { TIMING_SLOTS, MIN_OFFICERS_FOR_BOOTH } from "../../data/options";
import { useTiers } from "../../hooks/useTiers";

export default function InterestFormModal({ open, onClose, formation, onSubmit }) {
  const [form, setForm] = useState({
    date: "",
    timings: [],
    tier: "",
    participants: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const { getTier, tiersFor } = useTiers();

  const isTeam = Boolean(formation?.isTeam);
  const isAmbassador = isTeam || Boolean(formation?.isAmbassador);

  // Ambassadors: booth (Tier 2) is unlocked by team size (rule B), not by any
  // individual's mobility. A solo ambassador is a group of 1 => Tier 3 only.
  const groupSize = isTeam ? formation.team.length : 1;

  // Units: tiers come from what the unit declared it can carry.
  const unitMobility = formation?.mobility ?? "sharing_booth";

  const availableTiers = isAmbassador
    ? tiersFor("ambassador", { groupSize })
    : tiersFor("unit", { mobility: unitMobility });

  // Does an ambassador team fall short of the booth threshold?
  const teamBelowBoothThreshold =
    isAmbassador && groupSize < MIN_OFFICERS_FOR_BOOTH;

  const selectedTier = form.tier ? getTier(form.tier) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) return setError("Pick a preferred date.");
    if (form.timings.length === 0) return setError("Pick at least one timing slot.");
    if (!form.tier) return setError("Choose an engagement tier.");
    if (!form.participants) return setError("Enter how many students will attend.");

    setError("");
    onSubmit?.({ ...form, formation });
    setForm({ date: "", timings: [], tier: "", participants: "", notes: "" });
  };

  return (
    <Modal open={open} onClose={onClose} title="Interest Form" variant="drawer">
      {/* Target is either a single unit/ambassador, or a team of ambassadors */}
      {isTeam ? (
        <div className="mb-6">
          <p className="text-base font-semibold text-[#1C1917] mb-2">
            Team of {formation.team.length} ambassadors
          </p>
          <div className="space-y-1.5">
            {formation.team.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[#44403C] truncate">
                  {m.rank} {m.name}
                </span>
                <span className="text-[#A8A29E] shrink-0">{m.appointment}</span>
              </div>
            ))}
          </div>
          {teamBelowBoothThreshold ? (
            <p className="text-xs text-[#B45309] mt-3">
              A booth setup (Tier 2) needs a team of {MIN_OFFICERS_FOR_BOOTH} or more. With{" "}
              {groupSize}, only sharing-only (Tier 3) is available — add more ambassadors to unlock
              the booth.
            </p>
          ) : (
            <p className="text-xs text-[#78716C] mt-3">
              With {groupSize} ambassadors, this team can do a booth setup (Tier 2) or sharing only
              (Tier 3).
            </p>
          )}
          <p className="text-xs text-[#A8A29E] mt-2">
            Tier 1 (hands-on) is units only.
          </p>
        </div>
      ) : (
        formation && (
          <div className="mb-6">
            <p className="text-base font-semibold text-[#1C1917]">
              {formation.rank ? `${formation.rank} ${formation.name}` : formation.name}
            </p>
            <p className="text-sm text-[#78716C]">{formation.location ?? formation.camp}</p>
            {formation.isAmbassador && (
              <p className="text-xs text-[#78716C] mt-2">
                On their own, an ambassador can do sharing-only (Tier 3). A booth (Tier 2) needs a
                team of {MIN_OFFICERS_FOR_BOOTH}.
              </p>
            )}
          </div>
        )
      )}

      <form onSubmit={handleSubmit}>
        <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-3">Availability</p>

        <Input
          label="Preferred date"
          required
          type="date"
          value={form.date}
          onChange={update("date")}
        />

        <MultiSelect
          label="Preferred timing"
          required
          hint="Pick every slot that works — the unit will confirm one."
          options={TIMING_SLOTS}
          value={form.timings}
          onChange={(v) => setForm((f) => ({ ...f, timings: v }))}
        />

        <div className="h-px bg-[#E7E5E4] my-6" />

        <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-3">Engagement</p>

        <Select
          label="Engagement tier"
          required
          placeholder="Select engagement tier"
          options={availableTiers.map((t) => ({ value: t.id, label: t.name }))}
          value={form.tier}
          onChange={update("tier")}
        />

        {selectedTier && (
          <div className="rounded-lg bg-[#F5F5F4] px-4 py-3 -mt-2 mb-5">
            <p className="text-xs text-[#57534E]">{selectedTier.description}</p>
            {selectedTier.requiresBooth && (
              <p className="text-xs text-[#B45309] mt-1.5">
                Needs space on site for booth setup.
              </p>
            )}
          </div>
        )}

        <Input
          label="Size (number of pax attending)"
          required
          type="number"
          min="1"
          placeholder="e.g. 80"
          value={form.participants}
          onChange={update("participants")}
        />

        <TextArea
          label="Additional information"
          placeholder="Any specific request or information..."
          value={form.notes}
          onChange={update("notes")}
        />

        {error && (
          <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-2.5 text-xs mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
