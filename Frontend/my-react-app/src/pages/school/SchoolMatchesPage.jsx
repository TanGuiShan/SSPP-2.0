import React from "react";
import PageHeader from "../../components/common/PageHeader";
import MatchCard from "../../components/match/MatchCard";
import { schoolMatches } from "../../data/matches";

export default function SchoolMatchesPage() {
  return (
    <>
      <PageHeader
        eyebrow="My Matches"
        title="Approved and pending engagements"
        subtitle="Once an admin approves, confirmed engagement details appear below"
      />

      {schoolMatches.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-sm text-[#78716C]">
            No matches yet. Submit an interest form to get started.
          </p>
        </div>
      ) : (
        schoolMatches.map((m) => (
          <MatchCard key={m.code} match={m} onAction={(x) => console.log("action", x)} />
        ))
      )}
    </>
  );
}