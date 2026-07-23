import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupLayout from "../../layouts/SignupLayout";
import FormSection from "../../components/common/FormSection";
import { Input, Select } from "../../components/common/Input";
import { MultiSelect, RadioCards } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import { accountTier } from "../../utils/domain";
import { SKIP_DOMAIN_CHECK } from "../../config/testMode";
import {
  UNIT_MOBILITY_OPTIONS,
  FORMATIONS,
  SCHOOL_LEVELS,
  RANKS,
  TOPICS,
  tiersFor,
} from "../../data/options";

export default function UnitSignupPage() {
  const navigate = useNavigate();

  const { values, handleChange, setField } = useForm({
    mobility: "",
    rank: "",
    fullName: "",
    appointment: "",
    unit:"",
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

  // Tiers unlocked by the declared capability — shown so the user can see
  // what picking each mobility option actually means for them.
  const unlockedTiers = values.mobility ? tiersFor("unit", { mobility: values.mobility }) : [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!values.mobility) return setError("Choose what your unit can offer.");
    if (!emailVerified) return setError("Verify your email before continuing.");
    if (!mobileVerified) return setError("Verify your mobile number before continuing.");
    if (values.topics.length === 0) return setError("Pick at least one topic of interest.");
    if (values.levelsPreferred.length === 0) return setError("Pick at least one school level.");
    if (values.password.length < 8) return setError("Password needs at least 8 characters.");
    if (values.password !== values.confirm) return setError("Passwords don't match.");

    setError("");

    // ── REAL (uncomment when the backend is ready) ────────────────────
    // await registerUnit({ ...values, emailVerified, mobileVerified });

    // ── DEMO ─────────────────────────────────────────────────────────
    console.log("Unit signup", values);

    // Gov domains (*.gov.sg / *.edu.sg) get in straight away. Volunteers from
    // any other domain verify, then wait for admin approval.
    // ── REAL: the backend decides this and refuses a session until approved.
    const tier = SKIP_DOMAIN_CHECK ? "gov" : accountTier(values.email);
    navigate(tier === "gov" ? "/login" : "/pending-approval");
  };

  return (
    <SignupLayout
      title="Army unit account"
      subtitle="Register your unit so schools can find and book you"
    >
      <form onSubmit={handleSubmit}>
        <FormSection
          step="1"
          title="What can your unit offer?"
          description="This sets the engagement tiers available to you. You can still choose a lower tier for any individual booking."
        >
          <RadioCards
            name="mobility"
            required
            options={UNIT_MOBILITY_OPTIONS}
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
            </div>
          )}
        </FormSection>

        <FormSection step="2" title="Point of contact">
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
              placeholder="e.g. Tan Wei Ming"
              value={values.fullName}
              onChange={handleChange("fullName")}
            />
            <Input
              label="Appointment"
              required
              placeholder="e.g. Company Commander"
              value={values.appointment}
              onChange={handleChange("appointment")}
            />
            <Input
              label="Unit"
              required
              placeholder="e.g. 3 SIR"
              value={values.unit}
              onChange={handleChange("unit")}
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
            placeholder="unit@defence.gov.sg"
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
          title="Topics of interest"
          description="What can your unit speak on? Schools filter by this."
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
          description="Which levels does your unit want to engage?"
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

        <Button type="submit" fullWidth size="lg">Create unit account</Button>
        <p className="text-xs text-[#A8A29E] text-center mt-4">
          Your account needs admin approval before schools can see your unit.
        </p>
      </form>
    </SignupLayout>
  );
}
