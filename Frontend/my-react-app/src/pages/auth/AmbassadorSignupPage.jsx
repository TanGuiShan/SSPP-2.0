import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupLayout from "../../layouts/SignupLayout";
import FormSection from "../../components/common/FormSection";
import { Input, Select } from "../../components/common/Input";
import { MultiSelect, RadioCards } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import {
  MOBILITY_OPTIONS,
  FORMATIONS,
  SCHOOL_LEVELS,
  RANKS,
  TOPICS,
  tiersFor,
} from "../../data/options";

export default function AmbassadorSignupPage() {
  const navigate = useNavigate();

  const { values, handleChange, setField } = useForm({
    mobility: "",
    rank: "",
    fullName: "",
    appointment: "",
    formation: "",
    topics: [],
    email: "",
    mobile: "",
    levelsPreferred: [],
    password: "",
    confirm: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [error, setError] = useState("");

  // Ambassadors cap at Tier 2 — Tier 3 needs a unit.
  const unlockedTiers = values.mobility ? tiersFor("ambassador", values.mobility) : [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!values.mobility) return setError("Choose what you can offer.");
    if (!emailVerified) return setError("Verify your email before continuing.");
    if (!mobileVerified) return setError("Verify your mobile number before continuing.");
    if (values.topics.length === 0) return setError("Pick at least one topic of interest.");
    if (values.levelsPreferred.length === 0) return setError("Pick at least one school level.");
    if (values.password.length < 8) return setError("Password needs at least 8 characters.");
    if (values.password !== values.confirm) return setError("Passwords don't match.");

    setError("");

    // ── REAL (uncomment when the backend is ready) ────────────────────
    // await registerAmbassador({ ...values, emailVerified, mobileVerified });

    // ── DEMO ─────────────────────────────────────────────────────────
    console.log("Ambassador signup", values);
    navigate("/login");
  };

  return (
    <SignupLayout
      title="Army ambassador account"
      subtitle="Sign up as an individual. Schools can pick you on your own or as part of a team."
    >
      <form onSubmit={handleSubmit}>
        <FormSection
          step="1"
          title="What can you offer?"
          description="Booth setup is possible as an ambassador — schools may pair you with others to make up a team."
        >
          <RadioCards
            name="mobility"
            required
            options={MOBILITY_OPTIONS}
            value={values.mobility}
            onChange={(v) => setField("mobility", v)}
          />

          {unlockedTiers.length > 0 && (
            <div className="rounded-lg bg-[#F5F5F4] p-4 mt-1">
              <p className="text-xs font-medium text-[#44403C] mb-2">
                This unlocks {unlockedTiers.length} tier{unlockedTiers.length > 1 ? "s" : ""}:
              </p>
              <ul className="space-y-1">
                {unlockedTiers.map((t) => (
                  <li key={t.id} className="text-xs text-[#78716C]">
                    <span className="text-[#1C1917] font-medium">{t.name}</span> — {t.description}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#A8A29E] mt-2.5 pt-2.5 border-t border-[#E7E5E4]">
                Tier 3 (hands-on) isn't available to ambassadors — it needs a unit's equipment and supervision.
              </p>
            </div>
          )}
        </FormSection>

        <FormSection step="2" title="About you">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
          </div>

          <VerifiedField
            channel="email"
            type="email"
            label="Email"
            required
            placeholder="you@defence.gov.sg"
            value={values.email}
            onChange={handleChange("email")}
            onVerifiedChange={setEmailVerified}
          />

          <VerifiedField
            channel="mobile"
            type="tel"
            label="Mobile number"
            required
            placeholder="+65 8123 4567"
            value={values.mobile}
            onChange={handleChange("mobile")}
            onVerifiedChange={setMobileVerified}
          />
        </FormSection>

        <FormSection
          step="3"
          title="Topics you can share on"
          description="Schools browse and filter ambassadors by topic, so pick what you're comfortable speaking about."
        >
          <MultiSelect
            required
            options={TOPICS}
            value={values.topics}
            onChange={(v) => setField("topics", v)}
          />
        </FormSection>

        <FormSection
          step="4"
          title="School levels preferred"
          description="Which levels would you like to engage?"
        >
          <MultiSelect
            required
            options={SCHOOL_LEVELS}
            value={values.levelsPreferred}
            onChange={(v) => setField("levelsPreferred", v)}
          />
        </FormSection>

        <FormSection step="5" title="Set a password">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input
              label="Password"
              required
              type="password"
              placeholder="Min. 8 characters"
              value={values.password}
              onChange={handleChange("password")}
            />
            <Input
              label="Confirm password"
              required
              type="password"
              placeholder="Re-enter password"
              value={values.confirm}
              onChange={handleChange("confirm")}
            />
          </div>
        </FormSection>

        {error && (
          <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg">Create ambassador account</Button>
        <p className="text-xs text-[#A8A29E] text-center mt-4">
          Your account needs admin approval before schools can see your profile.
        </p>
      </form>
    </SignupLayout>
  );
}
