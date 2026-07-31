import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupLayout from "../../layouts/SignupLayout";
import FormSection from "../../components/common/FormSection";
import { Input, Select } from "../../components/common/Input";
import { MultiSelect } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import { formations } from "../../data/formations";
import {
  ENGAGEMENT_TYPES,
  FORMATIONS,
  SCHOOL_LEVELS,
  RANKS,
  TOPICS,
  mobilityFromEngagementTypes,
} from "../../data/options";
import { useTiers } from "../../hooks/useTiers";

// Real army units a signing-up account can claim as its identity. The chosen
// id is stored on the profile and reserved in providers/{id}, so later a match
// whose roster contains that id can be confirmed by this account.
const UNIT_OPTIONS = formations.map((f) => ({ value: f.id, label: f.name }));

export default function UnitSignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { tiersFor } = useTiers();

  const { values, handleChange, setField } = useForm({
    engagementTypes: [],
    rank: "",
    fullName: "",
    appointment: "",
    unit:"",
    formation: "",
    catalogUnitId: "",
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
  // what picking these engagement types actually means for them.
  const derivedMobility = mobilityFromEngagementTypes(values.engagementTypes);
  const unlockedTiers = values.engagementTypes.length
    ? tiersFor("unit", { mobility: derivedMobility })
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (values.engagementTypes.length === 0) return setError("Choose what your unit can offer.");
    if (!values.catalogUnitId) return setError("Select which unit you are registering.");
    if (!emailVerified) return setError("Verify your email before continuing.");
    if (!mobileVerified) return setError("Verify your mobile number before continuing.");
    if (values.topics.length === 0) return setError("Pick at least one topic of interest.");
    if (values.levelsPreferred.length === 0) return setError("Pick at least one school level.");
    if (values.password.length < 8) return setError("Password needs at least 8 characters.");
    if (values.password !== values.confirm) return setError("Passwords don't match.");

    setError("");

    try {
      // Creates the Firebase account + users/{uid} profile, and claims the
      // chosen unit id in providers/{id}. Gov domains are approved on the spot;
      // other domains land on the pending-approval screen.
      const result = await signup({
        email: values.email,
        password: values.password,
        role: "army-unit",
        providerId: values.catalogUnitId,
        providerKind: "unit",
        providerName:
          formations.find((f) => f.id === values.catalogUnitId)?.name ?? values.unit,
        profile: {
          fullName: values.fullName,
          rank: values.rank,
          appointment: values.appointment,
          unit: values.unit,
          formation: values.formation,
          engagementTypes: values.engagementTypes,
          mobility: derivedMobility,
          topics: values.topics,
          levelsPreferred: values.levelsPreferred,
          mobile: values.mobile,
        },
      });
      navigate(result?.approved ? "/login" : "/pending-approval");
    } catch (err) {
      setError(err.message);
    }
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
          description="Pick as many as apply. This sets the engagement tiers available to you — you can still choose a lower tier for any individual booking."
        >
          <MultiSelect
            required
            options={ENGAGEMENT_TYPES}
            value={values.engagementTypes}
            onChange={(v) => setField("engagementTypes", v)}
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
            <Select
              label="Which unit are you registering?"
              required
              placeholder="Select your unit"
              options={UNIT_OPTIONS}
              value={values.catalogUnitId}
              onChange={handleChange("catalogUnitId")}
              hintText="Links your account to the unit schools book. One account per unit."
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
