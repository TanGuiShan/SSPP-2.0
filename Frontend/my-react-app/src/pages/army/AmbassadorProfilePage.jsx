import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, TextArea, Select } from "../../components/common/Input";
import { MultiSelect } from "../../components/common/MultiSelect";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/firebase/profile.service";
import { publishProviderCatalog } from "../../services/firebase/catalog.service";
import { TEST_MODE } from "../../config/testMode";
import AvatarUpload from "../../components/common/AvatarUpload";
import {
  AMBASSADOR_ENGAGEMENT_TYPES,
  FORMATIONS,
  SCHOOL_LEVELS,
  RANKS,
  TOPICS,
  mobilityFromEngagementTypes,
} from "../../data/options";

export default function AmbassadorProfilePage() {
  const { user, applyProfileChanges } = useAuth();

  const { values, handleChange, setField, setValues } = useForm({
    rank: "",
    fullName: "",
    appointment: "",
    formation: "",
    camp: "",
    contactEmail: "",
    contactNumber: "",
    about: "",
    engagementTypes: [],
    topics: [],
    levelsPreferred: [],
    photoURL: "",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Populate from the signed-in ambassador's saved profile once it loads.
  // Signup stores contact under email/mobile and levels under
  // preferredSchoolLevels; later saves round-trip by their own key.
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({
      ...v,
      rank: user.rank ?? "",
      fullName: user.fullName ?? "",
      appointment: user.appointment ?? "",
      formation: user.formation ?? "",
      camp: user.camp ?? "",
      contactEmail: user.email ?? "",
      contactNumber: user.contactNumber ?? user.mobile ?? "",
      about: user.about ?? user.remarks ?? "",
      // Older accounts only saved a single `mobility` string — wrap it into
      // the array so they still show a selection instead of a blank field.
      engagementTypes: user.engagementTypes ?? (user.mobility ? [user.mobility] : []),
      topics: user.topics ?? [],
      levelsPreferred: user.levelsPreferred ?? user.preferredSchoolLevels ?? [],
      photoURL: user.photoURL ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);
  // Ambassadors cap at Tier 2 — Tier 3 needs a unit.
  // A solo ambassador can only do sharing-only (Tier 3). Booth (Tier 2) needs
  // a team of 4+ — that's decided by the school when they assemble a team,
  // not here. So we always show the solo capability on this page.
  const handleSave = async () => {
    setError("");
    if (values.engagementTypes.length === 0) {
      return setError("Choose at least one thing you can offer on site.");
    }

    const changes = { ...values, mobility: mobilityFromEngagementTypes(values.engagementTypes) };

    try {
      if (!TEST_MODE && user?.uid) {
        await updateProfile(user.uid, changes);
        if (user.providerId) {
          // Publish/refresh the public browse card schools see.
          await publishProviderCatalog({
            role: user.role,
            providerId: user.providerId,
            ownerUid: user.uid,
            profile: { ...user, ...changes },
          });
        }
      }
      applyProfileChanges(changes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message ?? "Could not save your profile. Please try again.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Ambassador profile"
        subtitle="Schools browse and filter ambassadors on what you set here"
        action={<Button onClick={handleSave}>Save changes</Button>}
      />

      {saved && (
        <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mb-5">
          Profile saved.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      <div className="card p-8 mb-6">
        <h2 className="text-lg font-semibold mb-6 pb-4 border-b border-[#E7E5E4]">
          Personal information
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <AvatarUpload
            value={values.photoURL}
            onChange={(url) => setField("photoURL", url)}
            shape="circle"
            label="Change photo"
            fallback="Photo"
          />

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

        <MultiSelect
          required
          hint="Pick every kind you're able to do."
          options={AMBASSADOR_ENGAGEMENT_TYPES}
          value={values.engagementTypes}
          onChange={(v) => setField("engagementTypes", v)}
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
