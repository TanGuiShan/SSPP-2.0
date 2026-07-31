import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, Select } from "../../components/common/Input";
import { MultiSelect } from "../../components/common/MultiSelect";
import VerifiedField from "../../components/common/VerifiedField";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useForm } from "../../hooks/useForm";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/firebase/profile.service";
import { TEST_MODE } from "../../config/testMode";
import AvatarUpload from "../../components/common/AvatarUpload";
import {
  ENGAGEMENT_TYPES,
  FORMATIONS,
  SCHOOL_APPOINTMENTS,
  mobilityFromEngagementTypes,
} from "../../data/options";

export default function SchoolProfilePage() {
  const { user, applyProfileChanges } = useAuth();

  // Starts empty and is filled from the signed-in user's Firestore profile
  // once it loads (see the effect below). Field names mirror SchoolSignupPage.
  const { values, handleChange, setField, setValues } = useForm({
    engagementTypes: [],
    fullName: "",
    appointment: "",
    email: "",
    mobile: "",
    schoolName: "",
    address: "",
    postalCode: "",
    unitsPreferred: [],
    photoURL: "",
  });

  // Populate the form from the user's saved profile when it arrives.
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({
      ...v,
      // Older accounts only saved a single `mobility` string — wrap it into
      // the array so they still show a selection instead of a blank field.
      engagementTypes: user.engagementTypes ?? (user.mobility ? [user.mobility] : []),
      fullName: user.fullName ?? "",
      appointment: user.appointment ?? "",
      email: user.email ?? "",
      mobile: user.mobile ?? "",
      schoolName: user.schoolName ?? "",
      address: user.address ?? "",
      postalCode: user.postalCode ?? "",
      unitsPreferred: user.unitsPreferred ?? [],
      photoURL: user.photoURL ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Contact details arrive already verified — editing either revokes the tick
  // and forces a re-verify, so an account can't end up with an unverified
  // email by editing it after signup.
  const [emailVerified, setEmailVerified] = useState(true);
  const [mobileVerified, setMobileVerified] = useState(true);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const deleteModal = useModal();

  const handleSave = async (e) => {
    e.preventDefault();

    if (!emailVerified) return setError("Re-verify your email before saving.");
    if (!mobileVerified) return setError("Re-verify your mobile number before saving.");
    if (values.engagementTypes.length === 0)
      return setError("Choose at least one engagement type.");
    if (values.unitsPreferred.length === 0)
      return setError("Pick at least one preferred formation.");

    setError("");

    // updateProfile ignores role, approval and email (those can't change here).
    const changes = {
      engagementTypes: values.engagementTypes,
      mobility: mobilityFromEngagementTypes(values.engagementTypes),
      fullName: values.fullName,
      appointment: values.appointment,
      mobile: values.mobile,
      schoolName: values.schoolName,
      address: values.address,
      postalCode: values.postalCode,
      unitsPreferred: values.unitsPreferred,
      photoURL: values.photoURL,
    };

    try {
      // Persist to Firestore (test mode has no real account, so it skips the
      // write), then update the in-memory user so the change shows right away.
      if (!TEST_MODE && user?.uid) {
        await updateProfile(user.uid, changes);
      }
      applyProfileChanges(changes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      window.scrollTo({ top: 0, behavior: "smooth" }); // show the "Profile saved" message
    } catch (err) {
      setError(err.message ?? "Could not save your profile. Please try again.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="School profile"
        subtitle="Details an admin uses to follow up on engagements"
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

      <form onSubmit={handleSave} className="max-w">
        <div className="card p-8 mb-5">
          <h2 className="text-lg font-semibold mb-6 pb-4 border-b border-[#E7E5E4]">
            School details
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            <AvatarUpload
              value={values.photoURL}
              onChange={(url) => setField("photoURL", url)}
              shape="square"
              label="Change logo"
              fallback="School logo"
            />

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
              />
            </div>
          </div>
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

          <MultiSelect
            label="Engagement types"
            required
            options={ENGAGEMENT_TYPES}
            value={values.engagementTypes}
            onChange={(v) => setField("engagementTypes", v)}
          />

          <MultiSelect
            label="Formations preferred"
            required
            options={FORMATIONS}
            value={values.unitsPreferred}
            onChange={(v) => setField("unitsPreferred", v)}
          />
        </div>

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
