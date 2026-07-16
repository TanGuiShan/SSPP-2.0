import React from "react";
import PageHeader from "../../components/common/PageHeader";
import FormationCard from "../../components/formation/FormationCard";
import InterestFormModal from "../../components/formation/InterestFormModal";
import { useModal } from "../../hooks/useModal";
import { formations } from "../../data/formations";

export default function BrowseFormationsPage() {
  const { open, payload, openModal, closeModal } = useModal();

  const handleSubmit = (data) => {
    // Wire to interestApi.submitInterestForm(data) once the backend is ready.
    console.log("Interest form submitted", data);
    closeModal();
  };

  return (
    <>
      <PageHeader
        eyebrow="My Interest Form"
        title="Browse Army Formation"
        subtitle="Explore available army formations for engagement"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.map((f) => (
          <FormationCard key={f.id} formation={f} onInterested={openModal} />
        ))}
      </div>

      <InterestFormModal
        open={open}
        formation={payload}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}