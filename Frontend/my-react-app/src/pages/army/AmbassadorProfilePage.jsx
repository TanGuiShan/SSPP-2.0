import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, TextArea, Select } from "../../components/common/Input";
import { MultiSelect, RadioCards } from "../../components/common/MultiSelect";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import {
  MOBILITY_OPTIONS,
  FORMATIONS,
  SCHOOL_LEVELS,
  RANKS,
  TOPICS,
} from "../../data/options";

export default function AmbassadorProfilePage() {
  const { values, handleChange, setField } = useForm({
    rank: "",
    fullName: "",
    appointment: "",
    formation: "",
    camp: "",
    contactEmail: "",
    contactNumber: "",
    about: "",
    mobility: "sharing",
    topics: [],
    levelsPreferred: [],
  });

  const [saved, setSaved] = useState(false);
  // Ambassadors cap at Tier 2 — Tier 3 needs a unit.
  // A solo ambassador can only do sharing-only (Tier 3). Booth (Tier 2) needs
  // a team of 4+ — that's decided by the school when they assemble a team,
  // not here. So we always show the solo capability on this page.
  const handleSave = () => {
    console.log("Saved ambassador profile", values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageHeader
        eyebrow="My Profile"
        title="My Profile"
        subtitle="Schools browse and filter ambassadors on what you set here"
        action={<Button onClick={handleSave}>Save changes</Button>}
      />

      {saved && (
        <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mb-5">
          Profile saved.
        </div>
      )}

      <div className="card p-8 mb-6">
        <h2 className="text-lg font-semibold mb-6 pb-4 border-b border-[#E7E5E4]">
          Personal information
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0 text-center">
            <div className="w-32 h-32 rounded-full bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-xs text-[#A8A29E]">
              Photo
            </div>
            <button className="text-xs text-[#2563EB] mt-3 hover:underline">Change photo</button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Select
              label="Rank"
              required
              placeholder="Select rank"
              options={RANKS}
              value={values.rank}
              onChange={handleChange("rank")}
            />
            <Input
              label="Full name"
              required
              placeholder="e.g. Muhammad Hafiz"
              value={values.fullName}
              onChange={handleChange("fullName")}
            />
            <Input
              label="Appointment"
              required
              placeholder="e.g. Platoon Sergeant"
              value={values.appointment}
              onChange={handleChange("appointment")}
            />
            <Select
              label="Formation"
              required
              placeholder="Select formation"
              options={FORMATIONS}
              value={values.formation}
              onChange={handleChange("formation")}
            />
            <Input
              label="Camp / location"
              placeholder="e.g. Sungei Gedong Camp"
              value={values.camp}
              onChange={handleChange("camp")}
            />
            <Input
              label="Contact email"
              required
              type="email"
              placeholder="you@defence.gov.sg"
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
          rows={4}
          placeholder="A short introduction schools will see — your experience, what you enjoy sharing about..."
          value={values.about}
          onChange={handleChange("about")}
        />
      </div>

      <div className="card p-8 mb-6">
        <h2 className="text-lg font-semibold mb-1">What you can offer</h2>
        <p className="text-sm text-[#78716C] mb-5">
          Sets the engagement tiers you appear under when schools search
        </p>

        <RadioCards
          name="mobility"
          options={MOBILITY_OPTIONS}
          value={values.mobility}
          onChange={(v) => setField("mobility", v)}
        />

        <div className="rounded-lg bg-[#F5F5F4] p-4">
          <p className="text-xs font-medium text-[#44403C] mb-2">How tiers work for you:</p>
          <ul className="space-y-1">
            <li className="text-xs text-[#78716C]">
              <span className="text-[#1C1917] font-medium">On your own</span> — sharing-only
              sessions (Tier 3).
            </li>
            <li className="text-xs text-[#78716C]">
              <span className="text-[#1C1917] font-medium">In a team of 4 or more</span> — the
              school can also book a booth setup (Tier 2).
            </li>
          </ul>
          <p className="text-xs text-[#A8A29E] mt-2.5 pt-2.5 border-t border-[#E7E5E4]">
            Tier 1 (hands-on) is units only.
          </p>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-lg font-semibold mb-1">Topics and preferences</h2>
        <p className="text-sm text-[#78716C] mb-5">Schools filter on both of these</p>

        <MultiSelect
          label="Topics I can share on"
          required
          options={TOPICS}
          value={values.topics}
          onChange={(v) => setField("topics", v)}
        />

        <MultiSelect
          label="School levels preferred"
          required
          options={SCHOOL_LEVELS}
          value={values.levelsPreferred}
          onChange={(v) => setField("levelsPreferred", v)}
        />
      </div>
    </>
  );
}
