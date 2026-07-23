import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, Select } from "../../components/common/Input";
import { MultiSelect, RadioCards } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useForm } from "../../hooks/useForm";
import { useModal } from "../../hooks/useModal";
import {
  MOBILITY_OPTIONS,
  FORMATIONS,
  SCHOOL_APPOINTMENTS,
} from "../../data/options";

export default function SchoolProfilePage() {
  // Mirrors the fields collected in SchoolSignupPage — same shape, so this can
  // be swapped to load from the API without restructuring.
  const { values, handleChange, setField } = useForm({
    mobility: "sharing_booth",
    fullName: "Tan Gui Shan",
    appointment: "hod",
    email: "tan_guishan@swisscottage.edu.sg",
    mobile: "+65 9123 4567",
    schoolName: "Swiss Cottage Secondary School",
    address: "3 Bukit Batok Street 34",
    postalCode: "659322",
    unitsPreferred: ["armoured", "infantry", "signal"],
  });

  // Contact details arrive already verified — editing either revokes the tick
  // and forces a re-verify, so an account can't end up with an unverified
  // email by editing it after signup.
  const [emailVerified, setEmailVerified] = useState(true);
  const [mobileVerified, setMobileVerified] = useState(true);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const deleteModal = useModal();

  const handleSave = (e) => {
    e.preventDefault();

    if (!emailVerified) return setError("Re-verify your email before saving.");
    if (!mobileVerified) return setError("Re-verify your mobile number before saving.");
    if (values.unitsPreferred.length === 0)
      return setError("Pick at least one preferred formation.");

    setError("");

    // ── REAL (uncomment when the backend is ready) ────────────────────
    // await updateSchoolProfile(values);

    // ── DEMO ─────────────────────────────────────────────────────────
    console.log("Saved school profile", values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    window.scrollTo({ top: 0, behavior: "smooth"}); // Scroll to the top so the "Profile saved" message is visible
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="School account details"
        subtitle="Details an admin uses to follow up on engagements"
        // action={<Button onClick={handleSave}>Save changes</Button>}
      />

      {saved && (
        <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mb-5 max-w-2xl">
          Profile saved.
        </div>
      )}

      <form onSubmit={handleSave} className="max-w">
        <div className="card p-8 mb-5">
          <h2 className="text-lg font-semibold mb-6 pb-4 border-b border-[#E7E5E4]">
            School details
          </h2>

          <Input
            label="School name"
            required
            value={values.schoolName}
            onChange={handleChange("schoolName")}
          />
          <Input
            label="School address"
            required
            value={values.address}
            onChange={handleChange("address")}
          />
          <Input
            label="Postal code"
            required
            inputMode="numeric"
            maxLength={6}
            value={values.postalCode}
            onChange={handleChange("postalCode")}
            className="max-w-[180px]"
          />
        </div>

        <div className="card p-8 mb-5">
          <h2 className="text-lg font-semibold mb-1">Point of contact</h2>
          <p className="text-sm text-[#78716C] mb-6">
            Changing your email or mobile means verifying it again
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input
              label="Full name"
              required
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
            initiallyVerified
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
            initiallyVerified
          />
        </div>

        <div className="card p-8 mb-5">
          <h2 className="text-lg font-semibold mb-1">Engagement preferences</h2>
          <p className="text-sm text-[#78716C] mb-6">
            Used to suggest matches — you can still request a different type per booking
          </p>

          <RadioCards
            label="Engagement type"
            name="mobility"
            options={MOBILITY_OPTIONS}
            value={values.mobility}
            onChange={(v) => setField("mobility", v)}
          />

          <MultiSelect
            label="Formations preferred"
            required
            options={FORMATIONS}
            value={values.unitsPreferred}
            onChange={(v) => setField("unitsPreferred", v)}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg"
          onclick={handleSave}
        >
          Save changes
        </Button>
      </form>

      <div className="card p-8 mt-5 max-w border-[#F5C6C6]">
        <h2 className="text-lg font-semibold mb-1 text-[#B91C1C]">Delete account</h2>
        <p className="text-sm text-[#78716C] mb-5">
          Removes your school, its interest forms, and its match history. This can't be undone.
        </p>
        <Button 
          variant="danger" 
          onClick={() => deleteModal.openModal()}
        >
          Delete account
        </Button>
      </div>

      <Modal
        open={deleteModal.open}
        onClose={deleteModal.closeModal}
        title="Delete account?"
        subtitle={values.schoolName}
        variant="centered"
      >
        <p className="text-sm text-[#57534E] mb-6">
          This removes your school profile, every interest form you've submitted, and your match
          history. Engagements already confirmed will be cancelled and the units notified. This
          can't be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={deleteModal.closeModal}>
            Keep account
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              console.log("Delete account", values.schoolName);
              deleteModal.closeModal();
              window.location.href = "/login"; // Redirect to login after deletion
            }}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </>
  );
}
