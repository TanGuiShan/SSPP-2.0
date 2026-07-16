import React, { useState } from "react";
import Modal from "../common/Modal";
import { Input, TextArea, Select } from "../common/Input";
import { MultiSelect } from "../common/MultiSelect";
import Button from "../common/Button";
import { TIMING_SLOTS, getTier, tiersFor } from "../../data/options";

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

  const isTeam = Boolean(formation?.isTeam);

  // A team can only do booth setup if every member can.
  const teamCanBooth = isTeam
    ? formation.team.every((m) => m.mobility === "sharing_booth")
    : false;

  // Only offer tiers the target can actually deliver.
  const capability = isTeam
    ? teamCanBooth
      ? "sharing_booth"
      : "sharing"
    : formation?.mobility ?? "sharing_booth";

  // Ambassadors (individually or as a team) cap at Tier 2 — Tier 3 needs a
  // unit's equipment and supervision. `providerType` drives that ceiling.
  const providerType = isTeam || formation?.isAmbassador ? "ambassador" : "unit";

  const availableTiers = tiersFor(providerType, capability);

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
          {!teamCanBooth && (
            <p className="text-xs text-[#B45309] mt-3">
              Not everyone in this team can do booth setup, so only Tier 1 is available.
            </p>
          )}
          <p className="text-xs text-[#78716C] mt-2">
            Ambassador engagements go up to Tier 2. Tier 3 needs a unit.
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
                Ambassador engagements go up to Tier 2. Tier 3 needs a unit.
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
