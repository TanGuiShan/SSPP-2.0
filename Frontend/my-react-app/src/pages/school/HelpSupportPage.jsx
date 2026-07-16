import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Input, TextArea } from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useForm } from "../../hooks/useForm";

export default function HelpSupportPage() {
  const { values, handleChange, reset } = useForm({ subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Query submitted", values);
    setSubmitted(true);
    reset();
  };

  return (
    <>
      <PageHeader
        eyebrow="Help & Support"
        title="Submit a query to admin"
        subtitle="An admin reviews and emails you back within 10 working days"
      />

      <div className="card p-8 max-w-2xl">
        {submitted && (
          <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mb-6">
            Query submitted. Watch your inbox for a reply.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Subject"
            required
            placeholder="e.g. Need help with interest form"
            value={values.subject}
            onChange={handleChange("subject")}
          />
          <TextArea
            label="Message"
            required
            rows={7}
            placeholder="Write your query here..."
            value={values.message}
            onChange={handleChange("message")}
          />
          <Button type="submit" fullWidth size="lg">Submit query</Button>
        </form>
      </div>
    </>
  );
}