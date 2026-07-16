import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, TextArea } from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import { TIERS } from "../../data/options";

// Tier definitions come from data/options.js so the unit profile, admin tier
// config and interest form can't drift apart. Only the *default equipment*
// per tier lives here — the unit edits its own list in state below.
const DEFAULT_EQUIPMENT = {
  tier1: ["Slide deck", "Uniform display"],
  tier2: ["Light strike vehicle", "Comms set", "Personal weapons"],
  tier3: ["Simulator", "Obstacle course kit", "Field pack"],
};

// Shape: { tier1: [{ name, checked }], tier2: [...] }
const initialEquipment = Object.fromEntries(
  TIERS.map((t) => [
    t.id,
    (DEFAULT_EQUIPMENT[t.id] ?? []).map((name) => ({ name, checked: true })),
  ])
);

export default function ArmyProfilePage() {
  const { values, handleChange } = useForm({
    unitName: "",
    location: "",
    commandingOfficer: "",
    contactEmail: "",
    contactNumber: "",
    about: "",
  });

  const [selectedTiers, setSelectedTiers] = useState(["tier2"]);
  const [equipment, setEquipment] = useState(initialEquipment);
  // Which tier's "add equipment" input is open, and what's typed in it
  const [adding, setAdding] = useState({ tierId: null, text: "" });

  const toggleTier = (id) =>
    setSelectedTiers((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const toggleEquipment = (tierId, name) =>
    setEquipment((eq) => ({
      ...eq,
      [tierId]: eq[tierId].map((item) =>
        item.name === name ? { ...item, checked: !item.checked } : item
      ),
    }));

  const addEquipment = (tierId) => {
    const name = adding.text.trim();
    if (!name) return;
    // Ignore duplicates (case-insensitive)
    const exists = equipment[tierId].some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );
    if (!exists) {
      setEquipment((eq) => ({
        ...eq,
        [tierId]: [...eq[tierId], { name, checked: true }],
      }));
    }
    setAdding({ tierId, text: "" });
  };

  const removeEquipment = (tierId, name) =>
    setEquipment((eq) => ({
      ...eq,
      [tierId]: eq[tierId].filter((item) => item.name !== name),
    }));

  const handleSave = () => {
    // Only send tiers the unit offers, and only equipment they ticked.
    const payload = {
      ...values,
      tiers: selectedTiers.map((tierId) => ({
        tierId,
        equipment: equipment[tierId].filter((e) => e.checked).map((e) => e.name),
      })),
    };
    console.log("Saved unit profile", payload);
  };

  return (
    <>
      <PageHeader
        eyebrow="My Unit Profile"
        title="My Unit Profile"
        subtitle="Manage your unit information and engagement preferences"
        action={<Button onClick={handleSave}>Save changes</Button>}
      />

      <div className="card p-8 mb-6">
        <h2 className="text-lg font-semibold mb-6 pb-4 border-b border-[#E7E5E4]">Unit information</h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0 text-center">
            <div className="w-32 h-32 rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-xs text-[#A8A29E]">
              Unit crest
            </div>
            <button className="text-xs text-[#2563EB] mt-3 hover:underline">Change logo</button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input
              label="Unit / formation name"
              required
              placeholder="e.g. 42 Singapore Armoured Regiment"
              value={values.unitName}
              onChange={handleChange("unitName")}
            />
            <Input
              label="Location"
              required
              placeholder="e.g. Sungei Gedong Camp"
              value={values.location}
              onChange={handleChange("location")}
            />
            <Input
              label="Commanding officer"
              required
              placeholder="e.g. LTA Tan Xiao Ming"
              value={values.commandingOfficer}
              onChange={handleChange("commandingOfficer")}
            />
            <Input
              label="Contact email"
              required
              type="email"
              placeholder="e.g. unit@defence.gov.sg"
              value={values.contactEmail}
              onChange={handleChange("contactEmail")}
            />
            <Input
              label="Contact number"
              required
              placeholder="+65 8123 4567"
              value={values.contactNumber}
              onChange={handleChange("contactNumber")}
            />
          </div>
        </div>

        <TextArea
          label="About"
          required
          rows={4}
          placeholder="Describe your unit's role, capabilities, and engagement approach..."
          value={values.about}
          onChange={handleChange("about")}
        />
      </div>

      <div className="card p-8">
        <h2 className="text-lg font-semibold mb-1">Engagement tiers offered</h2>
        <p className="text-sm text-[#78716C] mb-5">
          Select the tiers your unit can provide, then choose or add the equipment available for each
        </p>

        {TIERS.map((tier) => {
          const active = selectedTiers.includes(tier.id);
          const items = equipment[tier.id];
          const isAddingHere = adding.tierId === tier.id;

          return (
            <div
              key={tier.id}
              className={`rounded-lg border p-5 mb-3 last:mb-0 transition-colors ${
                active ? "border-[#1C1917] bg-[#FAFAF9]" : "border-[#E7E5E4]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleTier(tier.id)}
                  id={`tier-${tier.id}`}
                  className="mt-1 w-4 h-4 accent-[#1C1917] cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={`tier-${tier.id}`} className="cursor-pointer">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="font-medium text-[#1C1917]">{tier.name}</p>
                      {tier.requiresBooth && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-medium">
                          Booth setup
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#78716C] mt-0.5">{tier.description}</p>
                  </label>

                  {active && (
                    <>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {items.map((item) => (
                          <span
                            key={item.name}
                            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border text-xs transition-colors ${
                              item.checked
                                ? "bg-white border-[#A8A29E]"
                                : "bg-transparent border-[#E7E5E4] text-[#A8A29E]"
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleEquipment(tier.id, item.name)}
                                className="w-3 h-3 accent-[#1C1917]"
                              />
                              {item.name}
                            </label>
                            <button
                              type="button"
                              onClick={() => removeEquipment(tier.id, item.name)}
                              aria-label={`Remove ${item.name}`}
                              className="text-[#A8A29E] hover:text-[#C2542F] transition-colors leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        {!isAddingHere && (
                          <button
                            type="button"
                            onClick={() => setAdding({ tierId: tier.id, text: "" })}
                            className="px-3 py-1.5 rounded-full border border-dashed border-[#A8A29E] text-xs text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors"
                          >
                            + Add equipment
                          </button>
                        )}
                      </div>

                      {isAddingHere && (
                        <div className="flex gap-2 mt-3">
                          <input
                            autoFocus
                            value={adding.text}
                            onChange={(e) => setAdding({ tierId: tier.id, text: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addEquipment(tier.id);
                              }
                              if (e.key === "Escape") setAdding({ tierId: null, text: "" });
                            }}
                            placeholder="e.g. Night vision device"
                            className="flex-1 max-w-xs rounded-lg bg-white border border-[#E7E5E4] px-3 py-2 text-xs placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:outline-none"
                          />
                          <Button size="sm" onClick={() => addEquipment(tier.id)}>
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAdding({ tierId: null, text: "" })}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
