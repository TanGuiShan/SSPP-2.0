import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupLayout from "../../layouts/SignupLayout";
import FormSection from "../../components/common/FormSection";
import { Input, Select, ComboBox } from "../../components/common/Input";
import { MultiSelect } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import {
  ENGAGEMENT_TYPES,
  FORMATIONS,
  SCHOOL_APPOINTMENTS,
  SCHOOL_LEVELS,
  schoolOptionsForLevel,
  mobilityFromEngagementTypes,
} from "../../data/options";

export default function SchoolSignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const { values, handleChange, setField, setValues } = useForm({
    engagementTypes: [],
    fullName: "",
    appointment: "",
    email: "",
    mobile: "",
    academicLevel: "",
    schoolName: "",
    address: "",
    postalCode: "",
    unitsPreferred: [],
    password: "",
    confirm: "",
  });

  // Kindergartens don't have a fixed name list, so their name is free text —
  // every other level picks from a dropdown (see schoolOptionsForLevel).
  const isKindergarten = values.academicLevel === "kindergarten";
  const schoolOptions = schoolOptionsForLevel(values.academicLevel);

  // Changing the level invalidates whatever name was picked from the OLD
  // level's list, so clear it rather than leave a stale value selected.
  const handleLevelChange = (e) =>
    setValues((v) => ({ ...v, academicLevel: e.target.value, schoolName: "" }));

  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (values.engagementTypes.length === 0) return setError("Choose at least one engagement type.");
    if (!values.academicLevel) return setError("Select your school's academic level.");
    if (!values.schoolName.trim()) return setError("Enter your school's name.");
    if (!emailVerified) return setError("Verify your email before continuing.");
    if (!mobileVerified) return setError("Verify your mobile number before continuing.");
    if (values.password.length < 8) return setError("Password needs at least 8 characters.");
    if (values.password !== values.confirm) return setError("Passwords don't match.");
    if (values.unitsPreferred.length === 0) return setError("Pick at least one preferred formation.");

    setError("");

    try {
      // Creates the Firebase account + users/{uid} profile. Schools don't claim
      // a provider — they own the interest forms/matches they create, stamped
      // with their uid at submit time. Gov (.edu.sg) domains are approved on
      // the spot; other domains land on the pending-approval screen.
      const result = await signup({
        email: values.email,
        password: values.password,
        role: "school",
        profile: {
          engagementTypes: values.engagementTypes,
          mobility: mobilityFromEngagementTypes(values.engagementTypes),
          fullName: values.fullName,
          appointment: values.appointment,
          academicLevel: values.academicLevel,
          schoolName: values.schoolName,
          address: values.address,
          postalCode: values.postalCode,
          unitsPreferred: values.unitsPreferred,
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
      title="School account"
      subtitle="Tell us about your school so we can match you with the right formations"
    >
      <form onSubmit={handleSubmit}>
        <FormSection
          step="1"
          title="Engagement type"
          description="What kinds of engagement are you looking for? Pick as many as apply — you can request a different type per booking later."
        >
          <MultiSelect
            required
            options={ENGAGEMENT_TYPES}
            value={values.engagementTypes}
            onChange={(v) => setField("engagementTypes", v)}
          />
        </FormSection>

        <FormSection step="2" title="Point of contact" description="Who should we deal with for bookings?">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input
              label="Full name"
              required
              placeholder="e.g. Tan Gui Shan"
              value={values.fullName}
              onChange={handleChange("fullName")}
            />
            <Select
              label="Appointment"
              required
              placeholder="Select your appointment"
              options={SCHOOL_APPOINTMENTS}
              value={values.appointment}
              onChange={handleChange("appointment")}
            />
          </div>

          <VerifiedField
            channel="email"
            type="email"
            label="Email"
            required
            placeholder="you@school.edu.sg"
            value={values.email}
            onChange={handleChange("email")}
            onVerifiedChange={setEmailVerified}
          />

          <VerifiedField
            channel="mobile"
            type="tel"
            label="Mobile number"
            required
            placeholder="+65 9123 4567"
            value={values.mobile}
            onChange={handleChange("mobile")}
            onVerifiedChange={setMobileVerified}
          />
        </FormSection>

        <FormSection step="3" title="School details">
          <Select
            label="Academic level"
            required
            placeholder="Select academic level"
            options={SCHOOL_LEVELS}
            value={values.academicLevel}
            onChange={handleLevelChange}
          />

          {isKindergarten ? (
            <Input
              label="School name"
              required
              placeholder="e.g. SWISS COTTAGE KINDERGARTEN"
              hintText="Enter in upper case."
              value={values.schoolName}
              onChange={(e) => setField("schoolName", e.target.value.toUpperCase())}
            />
          ) : (
            <ComboBox
              label="School name"
              required
              placeholder={
                values.academicLevel ? "Search or select your school" : "Select academic level first"
              }
              options={schoolOptions ?? []}
              value={values.schoolName}
              onChange={(v) => setField("schoolName", v)}
            />
          )}

          <Input
            label="School address"
            required
            placeholder="e.g. 3 Bukit Batok Street 34"
            value={values.address}
            onChange={handleChange("address")}
          />
          <Input
            label="Postal code"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="659322"
            value={values.postalCode}
            onChange={handleChange("postalCode")}
            className="max-w-[180px]"
          />
        </FormSection>

        <FormSection
          step="4"
          title="Formations preferred"
          description="Pick as many as you'd be interested in. We use this to suggest matches — it doesn't lock you in."
        >
          <MultiSelect
            required
            options={FORMATIONS}
            value={values.unitsPreferred}
            onChange={(v) => setField("unitsPreferred", v)}
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

        <Button type="submit" fullWidth size="lg">Create school account</Button>
        <p className="text-xs text-[#A8A29E] text-center mt-4">
          Your account needs admin approval before you can book engagements.
        </p>
      </form>
    </SignupLayout>
  );
}
