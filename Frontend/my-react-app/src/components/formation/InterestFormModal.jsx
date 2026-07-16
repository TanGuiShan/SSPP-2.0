import React, { useState } from "react";
import Modal from "../common/Modal";
import { Input, TextArea, Select } from "../common/Input";
import Button from "../common/Button";

const ENGAGEMENT_TYPES = [
  { value: "tier1", label: "Tier 1 – Talk / Briefing" },
  { value: "tier2", label: "Tier 2 – Static Display" },
  { value: "tier3", label: "Tier 3 – Hands-on Experience" },
];

export default function InterestFormModal({ open, onClose, formation, onSubmit }) {
  const [form, setForm] = useState({ date: "", type: "", participants: "", notes: "" });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ ...form, formation });
    setForm({ date: "", type: "", participants: "", notes: "" });
  };

  return (
    <Modal open={open} onClose={onClose} title="Interest Form" variant="drawer">
      {formation && (
        <div className="mb-6">
          <p className="text-base font-semibold text-[#1C1917]">{formation.name}</p>
          <p className="text-sm text-[#78716C]">{formation.location}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <Input
          label="Preferred Date"
          required
          type="date"
          value={form.date}
          onChange={update("date")}
        />
        <Select
          label="Preferred Type of Engagement"
          required
          placeholder="Select engagement type"
          options={ENGAGEMENT_TYPES}
          value={form.type}
          onChange={update("type")}
        />
        <Input
          label="Number of Participants"
          required
          type="number"
          min="1"
          placeholder="Enter number of participants"
          value={form.participants}
          onChange={update("participants")}
        />
        <TextArea
          label="Additional Information"
          placeholder="Any specific request or information..."
          value={form.notes}
          onChange={update("notes")}
        />
        <div className="flex gap-3 mt-2">
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