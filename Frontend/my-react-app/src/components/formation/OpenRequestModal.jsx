import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { Input, TextArea, Select } from "../common/Input";
import { MultiSelect } from "../common/MultiSelect";
import Button from "../common/Button";
import { TIMING_SLOTS, tiersFor, MIN_OFFICERS_FOR_BOOTH } from "../../data/options";

/**
 * "I can't find anyone suitable" — the school describes what it needs and
 * providers come to them, rather than the school picking someone.
 *
 * The school chooses a CATEGORY (unit / CERT / individual ambassador) so the
 * request is only shown to the right group, and says how many volunteers it
 * needs. Providers then claim slots first-come.
 */

// Who the request is broadcast to. Kept here (not in options.js) because it
// describes an audience, not a provider's own capability.
export const REQUEST_CATEGORIES = [
  {
    value: "unit",
    label: "Army unit",
    description: "A formation that can bring equipment and run hands-on activities.",
  },
  {
    value: "cert",
    label: "Community Engagement Roving Team (CERT)",
    description: "A team of ambassadors — goes beyond assembly sharings.",
  },
  {
    value: "individual_ambassador",
    label: "Individual ambassadors",
    description: "One or more ambassadors for assembly sharings.",
  },
];

export default function OpenRequestModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    category: "",
    volunteersNeeded: "1",
    date: "",
    timings: [],
    tier: "",
    participants: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // A unit turns up as one provider; ambassador-based requests can need several.
  const isUnitRequest = form.category === "unit";

  // Tiers must respect the same ceilings as a targeted request:
  //   units        -> all three (hands-on needs a unit's equipment)
  //   ambassadors  -> never Tier 1; Tier 2 only once the team is big enough
  const requestedCount = Math.max(1, Number(form.volunteersNeeded) || 1);
  const availableTiers = form.category
    ? isUnitRequest
      ? tiersFor("unit", { mobility: "sharing_booth" })
      : tiersFor("ambassador", { groupSize: requestedCount })
    : [];

  // If the school changes category or lowers the headcount below the booth
  // threshold, a previously chosen tier can become invalid — clear it rather
  // than submit something the volunteers can't deliver.
  useEffect(() => {
    if (!form.tier || !form.category) return;
    if (!availableTiers.some((t) => t.id === form.tier)) {
      setForm((f) => ({ ...f, tier: "" }));
    }
  }, [form.tier, form.category, availableTiers]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.category) return setError("Choose who you're looking for.");
    if (!form.date) return setError("Pick a preferred date.");
    if (form.timings.length === 0) return setError("Pick at least one timing slot.");
    if (!form.tier) return setError("Choose an engagement tier.");
    if (!form.participants) return setError("Enter how many students will attend.");

    const needed = isUnitRequest ? 1 : Math.max(1, Number(form.volunteersNeeded) || 1);

    setError("");
    onSubmit?.({
      category: form.category,
      volunteersNeeded: needed,
      date: form.date,
      timings: form.timings,
      tier: form.tier,
      participants: form.participants,
      notes: form.notes,
    });

    setForm({
      category: "",
      volunteersNeeded: "1",
      date: "",
      timings: [],
      tier: "",
      participants: "",
      notes: "",
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Request an engagement" variant="drawer">
      <p className="sgds-modal-intro">
        Can't find someone suitable? Describe what you need and we'll show it to
        matching units and ambassadors, who can volunteer to take it on.
      </p>

      <form onSubmit={handleSubmit}>
        <p className="sgds-form-eyebrow">Who are you looking for?</p>

        <Select
          label="Type of provider"
          required
          placeholder="Select who you'd like to hear from"
          options={REQUEST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          value={form.category}
          onChange={update("category")}
        />

        {form.category && (
          <p className="sgds-field-note">
            {REQUEST_CATEGORIES.find((c) => c.value === form.category)?.description}
          </p>
        )}

        {form.category && !isUnitRequest && (
          <Input
            label="How many ambassadors do you need?"
            required
            type="number"
            min="1"
            max="20"
            hintText="They'll join first-come. You can raise this later if you need more."
            value={form.volunteersNeeded}
            onChange={update("volunteersNeeded")}
          />
        )}

        <div className="sgds-divider" />
        <p className="sgds-form-eyebrow">Availability</p>

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
          hint="Pick every slot that works."
          options={TIMING_SLOTS}
          value={form.timings}
          onChange={(v) => setForm((f) => ({ ...f, timings: v }))}
        />

        <div className="sgds-divider" />
        <p className="sgds-form-eyebrow">Engagement</p>

        <Select
          label="Engagement tier"
          required
          placeholder="Select engagement tier"
          options={availableTiers.map((t) => ({ value: t.id, label: t.name }))}
          value={form.tier}
          onChange={update("tier")}
        />

        {form.category && !isUnitRequest && (
          <p className="sgds-field-note">
            {requestedCount >= MIN_OFFICERS_FOR_BOOTH
              ? `With ${requestedCount} ambassadors, a booth setup (Tier 2) is available.`
              : `Tier 2 (booth) needs ${MIN_OFFICERS_FOR_BOOTH}+ ambassadors — asking for ${requestedCount}, so only sharing-only is available.`}
            {" "}Tier 1 (hands-on) is units only.
          </p>
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
          rows={3}
          placeholder="Anything that would help someone decide to take this on..."
          value={form.notes}
          onChange={update("notes")}
        />

        {error && (
          <div className="sgds-form-error" role="alert">
            {error}
          </div>
        )}

        <div className="sgds-modal-actions">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            Post request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
