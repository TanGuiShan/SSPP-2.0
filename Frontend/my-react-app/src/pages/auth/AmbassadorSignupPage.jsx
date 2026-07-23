import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupLayout from "../../layouts/SignupLayout";
import FormSection from "../../components/common/FormSection";
import { Input, TextArea, Select, ComboBox } from "../../components/common/Input";
import { MultiSelect, RadioCards } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";
import { accountTier } from "../../utils/domain";
import { SKIP_DOMAIN_CHECK } from "../../config/testMode";
import {
  MOBILITY_OPTIONS,
  MOBILITY_OF_ENGAGEMENT,
  SERVICE_SCHEME,
  FORMATIONS,
  SCHOOL_LEVELS,
  PRIMARY_SCHOOLS,
  SECONDARY_SCHOOLS,
  RANKS,
} from "../../data/options";

/**
 * Ambassador sign-up, mirroring the official CERT / Individual Ambassador
 * FormSG so the fields collected here match what the Army already asks for.
 *
 * Note: "topics" is deliberately NOT here — the official form doesn't ask for
 * it. Ambassadors set their topics later on their profile, which keeps the
 * school-side topic filter working without inventing a question the real form
 * doesn't have.
 */
export default function AmbassadorSignupPage() {
  const navigate = useNavigate();

  const { values, handleChange, setField } = useForm({
    // Personal details
    rank: "",
    fullName: "",
    serviceScheme: "",
    jobTitleCompany: "",
    appointment: "",
    unit: "",
    formation: "",
    primarySchool: "",
    secondarySchool: "",
    mobile: "",
    email: "",

    // Preferences
    preferredSchoolLevels: [],
    modalityOfEngagement: "",
    mobility: "",
    remarks: "",

    // Disclaimer + account
    disclaimer: false,
    password: "",
    confirm: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [error, setError] = useState("");

  // Civilian job only makes sense for those not currently serving full-time.
  const showJobTitle = ["nsmen", "nsalumni"].includes(values.serviceScheme);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!values.rank) return setError("Select your rank.");
    if (!values.fullName.trim()) return setError("Enter your name.");
    if (!values.serviceScheme) return setError("Select your service scheme.");
    if (!values.formation) return setError("Select your formation.");
    if (!emailVerified) return setError("Verify your email before continuing.");
    if (!mobileVerified) return setError("Verify your mobile number before continuing.");
    if (values.preferredSchoolLevels.length === 0)
      return setError("Pick at least one school level.");
    if (!values.modalityOfEngagement)
      return setError("Choose how you'd like to be engaged.");
    if (!values.mobility) return setError("Choose what you can offer.");
    if (!values.disclaimer)
      return setError("You need to accept the disclaimer to continue.");
    if (values.password.length < 8)
      return setError("Password needs at least 8 characters.");
    if (values.password !== values.confirm) return setError("Passwords don't match.");

    setError("");

    // ── REAL (uncomment when the backend is ready) ────────────────────
    // await registerAmbassador({ ...values, emailVerified, mobileVerified });

    // ── DEMO ─────────────────────────────────────────────────────────
    console.log("Ambassador signup", values);

    const tier = SKIP_DOMAIN_CHECK ? "gov" : accountTier(values.email);
    navigate(tier === "gov" ? "/login" : "/pending-approval");
  };

  return (
    <SignupLayout
      title="Army ambassador account"
      subtitle="For members of the SAF (Active / NSmen / NS Alumni) who want to engage students as an Individual Ambassador or as part of a Community Engagement Roving Team (CERT)."
    >
      <form onSubmit={handleSubmit}>
        <FormSection step="1" title="Personal details">
          <div className="sgds-form-grid">
            <Select
              label="Rank"
              required
              placeholder="Select rank"
              options={RANKS}
              value={values.rank}
              onChange={handleChange("rank")}
            />
            <Input
              label="Name"
              required
              placeholder="e.g. Phua Chu Kang"
              value={values.fullName}
              onChange={handleChange("fullName")}
            />
          </div>

          <Select
            label="Service scheme"
            required
            placeholder="Select service scheme"
            options={SERVICE_SCHEME}
            value={values.serviceScheme}
            onChange={handleChange("serviceScheme")}
          />

          {showJobTitle && (
            <Input
              label="Job title and company"
              placeholder="e.g. Project Manager, ABC Pte Ltd"
              hintText="Your civilian occupation."
              value={values.jobTitleCompany}
              onChange={handleChange("jobTitleCompany")}
            />
          )}

          <div className="sgds-form-grid">
            <Input
              label="Current appointment"
              placeholder="e.g. Platoon Sergeant"
              hintText='Input "-" if classified.'
              value={values.appointment}
              onChange={handleChange("appointment")}
            />
            <Input
              label="Current unit"
              placeholder="e.g. 3 SIR"
              hintText='Input "-" if classified.'
              value={values.unit}
              onChange={handleChange("unit")}
            />
          </div>

          <Select
            label="Formation"
            required
            placeholder="Select formation"
            options={FORMATIONS}
            value={values.formation}
            onChange={handleChange("formation")}
          />

          <ComboBox
            label="Primary school (alma mater)"
            placeholder="Search for your primary school"
            hintText='If you cannot find your institution, select "Other".'
            options={PRIMARY_SCHOOLS}
            value={values.primarySchool}
            onChange={(v) => setField("primarySchool", v)}
          />

          <ComboBox
            label="Secondary school (alma mater)"
            placeholder="Search for your secondary school"
            hintText='If you cannot find your institution, select "Other".'
            options={SECONDARY_SCHOOLS}
            value={values.secondarySchool}
            onChange={(v) => setField("secondarySchool", v)}
          />

          <VerifiedField
            channel="mobile"
            type="tel"
            label="Mobile number"
            required
            placeholder="9876 5432"
            value={values.mobile}
            onChange={handleChange("mobile")}
            onVerifiedChange={setMobileVerified}
          />

          <VerifiedField
            channel="email"
            type="email"
            label="Email address"
            required
            placeholder="you@defence.gov.sg"
            hintText="Personal or work email address."
            value={values.email}
            onChange={handleChange("email")}
            onVerifiedChange={setEmailVerified}
          />
        </FormSection>

        <FormSection step="2" title="Preferences">
          <MultiSelect
            label="School level"
            required
            hint="Pick every level you're happy to engage."
            options={SCHOOL_LEVELS}
            value={values.preferredSchoolLevels}
            onChange={(v) => setField("preferredSchoolLevels", v)}
          />

          <Select
            label="Modality of engagement"
            required
            placeholder="Select modality"
            hintText="CERTs operate as a team and go beyond assembly sharings. Individual Ambassadors focus on assembly sharings."
            options={MOBILITY_OF_ENGAGEMENT}
            value={values.modalityOfEngagement}
            onChange={handleChange("modalityOfEngagement")}
          />

          <RadioCards
            label="What can you offer on site?"
            name="mobility"
            required
            options={MOBILITY_OPTIONS}
            value={values.mobility}
            onChange={(v) => setField("mobility", v)}
          />

          <div className="sgds-radio-card-note">
            <p>
              <strong>On your own</strong> — sharing-only sessions (Tier 3).
            </p>
            <p>
              <strong>In a team of 4 or more</strong> — the school can also book a booth
              setup (Tier 2).
            </p>
            <p className="sgds-note-muted">
              Tier 1 (hands-on) is units only — it needs a unit's equipment and supervision.
            </p>
          </div>

          <TextArea
            label="Remarks"
            rows={3}
            placeholder="Anything else you'd like to share."
            hintText='Else input "-".'
            value={values.remarks}
            onChange={handleChange("remarks")}
          />
        </FormSection>

        <FormSection step="3" title="Disclaimer">
          <div className="sgds-disclaimer">
            <p>By continuing, you agree to:</p>
            <ol>
              <li>
                Be added into a WhatsApp / Telegram group chat with all Ambassadors for
                ease of communication.
              </li>
              <li>Be featured on media / social media by the Army or the School.</li>
            </ol>
          </div>

          <label className="sgds-consent-row">
            <input
              type="checkbox"
              checked={values.disclaimer}
              onChange={(e) => setField("disclaimer", e.target.checked)}
            />
            <span>
              I agree to the above. <span className="sgds-required-mark">*</span>
            </span>
          </label>
        </FormSection>

        <FormSection step="4" title="Set a password">
          <div className="sgds-form-grid">
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
          <div className="sgds-form-error" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg">
          Create ambassador account
        </Button>
        <p className="sgds-form-footnote">
          You can add the topics you're comfortable speaking on from your profile once
          you're signed in.
        </p>
      </form>
    </SignupLayout>
  );
}
