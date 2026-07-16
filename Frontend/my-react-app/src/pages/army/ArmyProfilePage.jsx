import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, TextArea } from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";

const TIERS = [
  {
    id: "tier1",
    name: "Tier 1 — Talk / Briefing",
    description: "Classroom session, no equipment moved off-camp",
    equipment: ["Slide deck", "Uniform display"],
  },
  {
    id: "tier2",
    name: "Tier 2 — Static Display",
    description: "Vehicles and equipment brought to the school",
    equipment: ["Light strike vehicle", "Comms set", "Personal weapons"],
  },
  {
    id: "tier3",
    name: "Tier 3 — Hands-on Experience",
    description: "Students handle equipment under supervision",
    equipment: ["Simulator", "Obstacle course kit", "Field pack"],
  },
];

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

  const toggleTier = (id) =>
    setSelectedTiers((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <>
      <PageHeader
        eyebrow="My Unit Profile"
        title="My Unit Profile"
        subtitle="Manage your unit information and engagement preferences"
        action={<Button onClick={() => console.log(values, selectedTiers)}>Save changes</Button>}
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
          Select the tiers your unit can provide, then choose the equipment available for each
        </p>

        {TIERS.map((tier) => {
          const active = selectedTiers.includes(tier.id);
          return (
            <div
              key={tier.id}
              className={`rounded-lg border p-5 mb-3 last:mb-0 transition-colors ${
                active ? "border-[#1C1917] bg-[#FAFAF9]" : "border-[#E7E5E4]"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleTier(tier.id)}
                  className="mt-1 w-4 h-4 accent-[#1C1917]"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#1C1917]">{tier.name}</p>
                  <p className="text-sm text-[#78716C] mt-0.5">{tier.description}</p>

                  {active && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tier.equipment.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E7E5E4] text-xs cursor-pointer hover:border-[#A8A29E]"
                        >
                          <input type="checkbox" defaultChecked className="w-3 h-3 accent-[#1C1917]" />
                          {item}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
}