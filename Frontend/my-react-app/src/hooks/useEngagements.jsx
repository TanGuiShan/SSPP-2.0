/* eslint-disable react-refresh/only-export-components */
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

import { createContext, useContext, useEffect, useState } from "react";
import { seedInterestForms, seedMatches } from "../data/seed";
import {
  seedFirestoreIfNeeded,
  subscribeEngagements,
  saveInterestFormAndMatch,
  resetEngagementsFirestore,
} from "../api/engagementsFirestore";

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

  // An OPEN request has no provider yet — the school asked for N volunteers
  // and providers claim slots first-come. It stays "Open" until enough have
  // volunteered, at which point it becomes a normal match and follows the
  // usual Awaiting -> Confirmed flow.
  if (match.isOpen) {
    const filled = match.roster?.length ?? 0;
    if (filled < (match.volunteersNeeded ?? 1)) {
      return { ...match, status: "Open" };
    }
  }

  return { ...match, status: isFullyConfirmed(match) ? "Confirmed" : "Awaiting confirmation" };
}

/** Slots still to be filled on an open request. */
export function slotsRemaining(match) {
  if (!match?.isOpen) return 0;
  return Math.max(0, (match.volunteersNeeded ?? 1) - (match.roster?.length ?? 0));
}

/** Has an open request sat unfilled long enough to need admin help? */
export const OPEN_ESCALATION_DAYS = 7;

export function isEscalated(match, days = OPEN_ESCALATION_DAYS) {
  if (!match?.isOpen || match.status !== "Open") return false;
  const created = new Date(match.createdAt).getTime();
  return (Date.now() - created) / (24 * 60 * 60 * 1000) >= days;
}

export function EngagementProvider({ children }) {
  const [state, setState] = useState(
    () => readStored() ?? { interestForms: seedInterestForms, matches: seedMatches }
  );

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    // Seed Firestore with initial demo data if database is currently empty
    seedFirestoreIfNeeded(seedInterestForms, seedMatches);

    // Subscribe to Firestore for live synchronization across users/sessions
    const unsub = subscribeEngagements(
      (remoteData) => {
        setIsConnected(true);
        if (remoteData.interestForms?.length || remoteData.matches?.length) {
          setState(remoteData);
        }
      },
      (err) => {
        console.warn("Firestore listener warning:", err);
      }
    );

    return () => unsub();
  }, []);

  function submitInterest(payload) {
    let createdForm = null;
    let createdMatch = null;

    setState((s) => {
      const formId = nextId("IF", s.interestForms);
      const matchId = nextId("AWEE-2026-", s.matches);
      const roster = buildRoster(payload.target);

      createdForm = {
        id: formId,
        matchId,
        submittedAt: new Date().toISOString(),
        status: "Awaiting confirmation",
        ...payload,
      };

      createdMatch = withDerivedStatus({
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
        interestForms: [createdForm, ...s.interestForms],
        matches: [createdMatch, ...s.matches],
      };
    });

    if (createdForm && createdMatch) {
      saveInterestFormAndMatch(createdForm, createdMatch);
    }
  }

  /**
   * School submits an OPEN request — they couldn't find anyone suitable in
   * Browse, so they describe what they need and let providers come to them.
   *
   * No provider is chosen, so the roster starts empty and fills as providers
   * volunteer (first-come). `category` limits who sees it.
   */
  function submitOpenRequest(payload) {
    let createdForm = null;
    let createdMatch = null;

    setState((s) => {
      const formId = nextId("IF", s.interestForms);
      const matchId = nextId("AWEE-2026-", s.matches);

      createdForm = {
        id: formId,
        matchId,
        submittedAt: new Date().toISOString(),
        status: "Open",
        isOpen: true,
        ...payload,
      };

      createdMatch = withDerivedStatus({
        id: matchId,
        formId,
        school: payload.school,
        target: null,                 // nobody chosen yet
        isOpen: true,
        category: payload.category,   // unit | cert | individual_ambassador
        volunteersNeeded: payload.volunteersNeeded ?? 1,
        date: payload.date,
        timings: payload.timings,
        tier: payload.tier,
        participants: payload.participants,
        notes: payload.notes,
        roster: [],
        equipment: [],
        createdAt: new Date().toISOString(),
      });

      return {
        interestForms: [createdForm, ...s.interestForms],
        matches: [createdMatch, ...s.matches],
      };
    });

    if (createdForm && createdMatch) {
      saveInterestFormAndMatch(createdForm, createdMatch);
    }
  }

  /**
   * School edits an open request — e.g. widen the number of volunteers or
   * change the size. Freely editable while nobody has volunteered; once
   * someone has, the number needed can only go UP (you can't un-volunteer
   * someone who already committed).
   */
  function updateOpenRequest(matchId, changes) {
    let updatedMatch = null;
    let updatedForm = null;

    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId || !m.isOpen) return m;

        const filled = m.roster?.length ?? 0;
        const next = { ...m, ...changes };

        if (changes.volunteersNeeded != null) {
          // Never allow the target to drop below people already committed.
          next.volunteersNeeded = Math.max(changes.volunteersNeeded, filled);
        }
        return withDerivedStatus(next);
      });

      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = s.interestForms.map((f) =>
        f.matchId === matchId ? { ...f, ...changes, status: updatedMatch?.status } : f
      );
      updatedForm = interestForms.find((f) => f.matchId === matchId);

      return { matches, interestForms };
    });

    if (updatedMatch || updatedForm) {
      saveInterestFormAndMatch(updatedForm, updatedMatch);
    }
  }

  /**
   * A provider volunteers for an open request. First-come: they're added to
   * the roster immediately. When the last slot fills, the match stops being
   * open and enters the normal confirm flow.
   *
   * @param {object} provider - { id, kind, name, rank?, appointment?, location? }
   */
  function volunteerForRequest(matchId, provider) {
    let updatedMatch = null;
    let updatedForm = null;

    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId || !m.isOpen) return m;
        if ((m.roster ?? []).some((r) => r.id === provider.id)) return m; // already in
        if (slotsRemaining(m) === 0) return m;                            // full

        const roster = [
          ...(m.roster ?? []),
          { ...provider, confirmed: false, confirmedAt: null, volunteered: true },
        ];

        // Once full, describeTarget needs a real target to render.
        const stillOpen = roster.length < (m.volunteersNeeded ?? 1);
        const target = stillOpen
          ? null
          : roster.length === 1 && roster[0].kind === "unit"
          ? { kind: "unit", unit: { id: roster[0].id, name: roster[0].name, location: roster[0].location } }
          : roster.length === 1
          ? { kind: "ambassador", ambassador: { ...roster[0] } }
          : { kind: "team", team: roster.map((r) => ({ ...r })) };

        return withDerivedStatus({ ...m, roster, target });
      });

      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = syncForm(s.interestForms, matchId, updatedMatch?.status);
      updatedForm = interestForms.find((f) => f.matchId === matchId);

      return { matches, interestForms };
    });

    if (updatedMatch || updatedForm) {
      saveInterestFormAndMatch(updatedForm, updatedMatch);
    }
  }

  /**
   * Admin assigns a provider to an open request that nobody picked up.
   * This is the escalation path — admin is otherwise out of matching, but
   * steps in when a request has sat unfilled past OPEN_ESCALATION_DAYS.
   */
  function assignProvider(matchId, provider) {
    volunteerForRequest(matchId, { ...provider, assignedByAdmin: true });
  }

  function withdrawInterest(id) {
    let updatedForm = null;
    let updatedMatch = null;

    setState((s) => {
      const form = s.interestForms.find((f) => f.id === id);
      const interestForms = s.interestForms.map((f) =>
        f.id === id ? { ...f, status: "Withdrawn" } : f
      );
      const matches = s.matches.map((m) =>
        m.id === form?.matchId ? { ...m, status: "Cancelled" } : m
      );

      updatedForm = interestForms.find((f) => f.id === id);
      updatedMatch = matches.find((m) => m.id === form?.matchId);

      return { interestForms, matches };
    });

    if (updatedForm || updatedMatch) {
      saveInterestFormAndMatch(updatedForm, updatedMatch);
    }
  }

  function syncForm(forms, matchId, status) {
    return forms.map((f) => (f.matchId === matchId ? { ...f, status } : f));
  }

  function confirmAsUnit(matchId, equipment = []) {
    let updatedMatch = null;
    let updatedForm = null;

    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const roster = m.roster.map((r) =>
          r.kind === "unit" ? { ...r, confirmed: true, confirmedAt: new Date().toISOString() } : r
        );
        return withDerivedStatus({ ...m, roster, equipment });
      });
      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = syncForm(s.interestForms, matchId, updatedMatch?.status);
      updatedForm = interestForms.find((f) => f.matchId === matchId);

      return { matches, interestForms };
    });

    if (updatedMatch || updatedForm) {
      saveInterestFormAndMatch(updatedForm, updatedMatch);
    }
  }

  function confirmAsAmbassador(matchId, ambassadorId) {
    let updatedMatch = null;
    let updatedForm = null;

    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const roster = m.roster.map((r) =>
          r.id === ambassadorId ? { ...r, confirmed: true, confirmedAt: new Date().toISOString() } : r
        );
        return withDerivedStatus({ ...m, roster });
      });
      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = syncForm(s.interestForms, matchId, updatedMatch?.status);
      updatedForm = interestForms.find((f) => f.matchId === matchId);

      return { matches, interestForms };
    });

    if (updatedMatch || updatedForm) {
      saveInterestFormAndMatch(updatedForm, updatedMatch);
    }
  }

  function cancelMatch(id) {
    let updatedMatch = null;
    let updatedForm = null;

    setState((s) => {
      const matches = s.matches.map((m) => (m.id === id ? { ...m, status: "Cancelled" } : m));
      const interestForms = s.interestForms.map((f) =>
        f.matchId === id ? { ...f, status: "Cancelled" } : f
      );

      updatedMatch = matches.find((m) => m.id === id);
      updatedForm = interestForms.find((f) => f.matchId === id);

      return { matches, interestForms };
    });

    if (updatedMatch || updatedForm) {
      saveInterestFormAndMatch(updatedForm, updatedMatch);
    }
  }

  function resetDemo() {
    setState({ interestForms: seedInterestForms, matches: seedMatches });
    resetEngagementsFirestore(seedInterestForms, seedMatches);
  }

  const value = {
    isConnected,
    interestForms: state.interestForms,
    matches: state.matches,
    submitInterest,
    submitOpenRequest,
    updateOpenRequest,
    volunteerForRequest,
    assignProvider,
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
