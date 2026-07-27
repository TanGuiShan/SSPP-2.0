import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import AvatarUpload from "../../components/common/AvatarUpload";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/firebase/profile.service";
import { TEST_MODE } from "../../config/testMode";

export default function AdminProfilePage() {
  const { user, applyProfileChanges } = useAuth();

  const { values, handleChange, setField, setValues } = useForm({
    fullName: "",
    appointment: "",
    email: "",
    mobile: "",
    photoURL: "",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Populate from the signed-in admin's saved profile once it loads.
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({
      ...v,
      fullName: user.fullName ?? "",
      appointment: user.appointment ?? "",
      email: user.email ?? "",
      mobile: user.mobile ?? "",
      photoURL: user.photoURL ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setError("");

    // updateProfile ignores role, approval and email (those can't change here).
    const changes = {
      fullName: values.fullName,
      appointment: values.appointment,
      mobile: values.mobile,
      photoURL: values.photoURL,
    };

    try {
      if (!TEST_MODE && user?.uid) {
        await updateProfile(user.uid, changes);
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
        title="Admin profile"
        subtitle="Your account details as an SSPP administrator"
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
        <div className="card p-8 mb-6">
          <h2 className="text-lg font-semibold mb-6 pb-4 border-b border-[#E7E5E4]">
            Account details
          </h2>

          <div className="mb-6">
            <AvatarUpload
              value={values.photoURL}
              onChange={(url) => setField("photoURL", url)}
              shape="circle"
              label="Change photo"
              fallback="Photo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input
              label="Full name"
              placeholder="e.g. Tan Gui Shan"
              value={values.fullName}
              onChange={handleChange("fullName")}
            />
            <Input
              label="Appointment"
              placeholder="e.g. Programme Administrator"
              value={values.appointment}
              onChange={handleChange("appointment")}
            />
            <Input
              label="Email"
              type="email"
              value={values.email}
              disabled
              hintText="Email can't be changed here."
            />
            <Input
              label="Mobile number"
              placeholder="+65 8123 4567"
              value={values.mobile}
              onChange={handleChange("mobile")}
            />
          </div>
        </div>
      </form>
    </>
  );
}
