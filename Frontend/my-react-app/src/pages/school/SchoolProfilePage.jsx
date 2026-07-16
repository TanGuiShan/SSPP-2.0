import React from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";

export default function SchoolProfilePage() {
  const { values, handleChange } = useForm({
    schoolName: "Swiss Cottage Secondary School",
    pocName: "Tan Gui Shan",
    address: "3 Bukit Batok Street 34, Singapore 659322",
    phone: "+65 9123 4567",
  });

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saved", values);
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="School account details"
        subtitle="Details an admin uses to follow up on engagements"
      />

      <div className="card p-8 max-w-2xl">
        <form onSubmit={handleSave}>
          <Input label="School name" required value={values.schoolName} onChange={handleChange("schoolName")} />
          <Input label="Point of contact" required value={values.pocName} onChange={handleChange("pocName")} />
          <Input label="School address" required value={values.address} onChange={handleChange("address")} />
          <Input label="Phone number" required value={values.phone} onChange={handleChange("phone")} />

          <Button type="submit" fullWidth size="lg" className="mt-2">Save changes</Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E7E5E4]">
          <p className="text-sm text-[#78716C] mb-3">
            Deleting removes your school, its interest forms, and its match history. This can't be undone.
          </p>
          <Button variant="danger" fullWidth size="lg">Delete account</Button>
        </div>
      </div>
    </>
  );
}