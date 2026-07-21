// hooks/useEngagements.jsx
// Shared state for the engagement flow.
//
// FLOW (provider-confirm, no admin in the loop):
//   1. School submits an interest form, having already chosen the provider
//      (a unit, a single ambassador, or a team). The form is created together
//      with a match in status "Awaiting confirmation".
//   2. The provider confirms. A unit is one confirmation. An ambassador team
//      is per-member: each ambassador confirms their own attendance.
//   3. When every required party has confirmed, the match becomes "Confirmed".
//   Providers cannot decline (government personnel don't pull out), so there's
//   no reject path — confirm is a mandatory acknowledgement that also locks
//   the date and, for units, triggers equipment reservation.
//
//   Admin is OUT of matching — they only monitor. (Out-of-domain signup
//   approval is separate, handled elsewhere.)
//
// ── REAL ────────────────────────────────────────────────────────────────
//   submitInterest       -> POST /interest-forms      (also creates the match)
//   withdrawInterest     -> DELETE /interest-forms/:id
//   confirmAsUnit        -> POST /matches/:id/confirm
//   confirmAsAmbassador  -> POST /matches/:id/confirm  { ambassadorId }
//   cancelMatch          -> POST /matches/:id/cancel
// ────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useState } from "react";
import { seedInterestForms, seedMatches } from "../data/seed";

const EngagementContext = createContext(null);

const STORAGE_KEY = "sspp.engagements.v2"; // bumped: shape changed for 4b

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.interestForms) || !Array.isArray(parsed?.matches)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function nextId(prefix, existing) {
  const numbers = existing
    .filter((x) => String(x.id).startsWith(prefix))
    .map((x) => Number(String(x.id).slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

// Build the roster (who must confirm) from a target.
function buildRoster(target) {
  if (!target) return [];
  if (target.kind === "team") {
    return target.team.map((m) => ({
      id: m.id,
      kind: "ambassador",
      name: m.name,
      rank: m.rank,
      appointment: m.appointment,
      confirmed: false,
      confirmedAt: null,
    }));
  }
  if (target.kind === "ambassador") {
    const a = target.ambassador;
    return [
      { id: a.id, kind: "ambassador", name: a.name, rank: a.rank, appointment: a.appointment, confirmed: false, confirmedAt: null },
    ];
  }
  const u = target.unit;
  return [{ id: u.id, kind: "unit", name: u.name, location: u.location, confirmed: false, confirmedAt: null }];
}

// A match is Confirmed once every roster member has confirmed.
export function isFullyConfirmed(match) {
  return match.roster?.length > 0 && match.roster.every((r) => r.confirmed);
}

export function confirmedCount(match) {
  return match.roster?.filter((r) => r.confirmed).length ?? 0;
}

function withDerivedStatus(match) {
  if (match.status === "Cancelled") return match;
  return { ...match, status: isFullyConfirmed(match) ? "Confirmed" : "Awaiting confirmation" };
}

export function EngagementProvider({ children }) {
  const [state, setState] = useState(
    () => readStored() ?? { interestForms: seedInterestForms, matches: seedMatches }
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function submitInterest(payload) {
    setState((s) => {
      const formId = nextId("IF", s.interestForms);
      const matchId = nextId("AWEE-2026-", s.matches);
      const roster = buildRoster(payload.target);

      const form = {
        id: formId,
        matchId,
        submittedAt: new Date().toISOString(),
        status: "Awaiting confirmation",
        ...payload,
      };

      const match = withDerivedStatus({
        id: matchId,
        formId,
        school: payload.school,
        target: payload.target,
        date: payload.date,
        timings: payload.timings,
        tier: payload.tier,
        participants: payload.participants,
        notes: payload.notes,
        roster,
        equipment: [],
        createdAt: new Date().toISOString(),
      });

      return {
        interestForms: [form, ...s.interestForms],
        matches: [match, ...s.matches],
      };
    });
  }

  function withdrawInterest(id) {
    setState((s) => {
      const form = s.interestForms.find((f) => f.id === id);
      return {
        interestForms: s.interestForms.map((f) =>
          f.id === id ? { ...f, status: "Withdrawn" } : f
        ),
        matches: s.matches.map((m) =>
          m.id === form?.matchId ? { ...m, status: "Cancelled" } : m
        ),
      };
    });
  }

  function syncForm(forms, matchId, status) {
    return forms.map((f) => (f.matchId === matchId ? { ...f, status } : f));
  }

  function confirmAsUnit(matchId, equipment = []) {
    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const roster = m.roster.map((r) =>
          r.kind === "unit" ? { ...r, confirmed: true, confirmedAt: new Date().toISOString() } : r
        );
        return withDerivedStatus({ ...m, roster, equipment });
      });
      const match = matches.find((m) => m.id === matchId);
      return { matches, interestForms: syncForm(s.interestForms, matchId, match.status) };
    });
  }

  function confirmAsAmbassador(matchId, ambassadorId) {
    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const roster = m.roster.map((r) =>
          r.id === ambassadorId ? { ...r, confirmed: true, confirmedAt: new Date().toISOString() } : r
        );
        return withDerivedStatus({ ...m, roster });
      });
      const match = matches.find((m) => m.id === matchId);
      return { matches, interestForms: syncForm(s.interestForms, matchId, match.status) };
    });
  }

  function cancelMatch(id) {
    setState((s) => ({
      matches: s.matches.map((m) => (m.id === id ? { ...m, status: "Cancelled" } : m)),
      interestForms: s.interestForms.map((f) =>
        f.matchId === id ? { ...f, status: "Cancelled" } : f
      ),
    }));
  }

  function resetDemo() {
    setState({ interestForms: seedInterestForms, matches: seedMatches });
  }

  const value = {
    interestForms: state.interestForms,
    matches: state.matches,
    submitInterest,
    withdrawInterest,
    confirmAsUnit,
    confirmAsAmbassador,
    cancelMatch,
    resetDemo,
  };

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export function useEngagements() {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error("useEngagements must be used within an EngagementProvider");
  return ctx;
}

export default useEngagements;
