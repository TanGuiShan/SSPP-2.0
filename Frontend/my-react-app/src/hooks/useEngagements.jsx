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
import {
  subscribeEngagements,
  saveInterestFormAndMatch,
} from "../api/engagementsFirestore";
import { useAuth } from "./useAuth";

const EngagementContext = createContext(null);

const STORAGE_KEY = "sspp.engagements.v3"; // v3: unlinked from local seed — Firestore is the source of truth

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

  const roster = match.roster ?? [];
  const confirmed = roster.filter((r) => r.confirmed).length;

  // OPEN request: the school posts it, providers VOLUNTEER, and the SCHOOL then
  // confirms the ones it wants. "Open" with no volunteers; "Awaiting
  // confirmation" once at least one has volunteered; "Confirmed" once the
  // school has confirmed enough of them.
  if (match.isOpen) {
    const need = match.volunteersNeeded ?? 1;
    if (roster.length === 0) return { ...match, status: "Open" };
    if (confirmed >= need) return { ...match, status: "Confirmed" };
    return { ...match, status: "Awaiting confirmation" };
  }

  return { ...match, status: isFullyConfirmed(match) ? "Confirmed" : "Awaiting confirmation" };
}

// Display target built from the CONFIRMED roster members — an open request only
// gets a concrete provider once the school has confirmed volunteers.
function targetFromConfirmed(match) {
  const confirmed = (match.roster ?? []).filter((r) => r.confirmed);
  if (confirmed.length === 0) return match.target ?? null;
  if (confirmed.length === 1 && confirmed[0].kind === "unit") {
    const u = confirmed[0];
    return { kind: "unit", unit: { id: u.id, name: u.name, location: u.location } };
  }
  if (confirmed.length === 1) {
    return { kind: "ambassador", ambassador: { ...confirmed[0] } };
  }
  return { kind: "team", team: confirmed.map((r) => ({ ...r })) };
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

// A provider may withdraw from a request they volunteered for only while the
// event is still more than a month away. Inside that window only an admin can
// remove them.
export const WITHDRAW_LOCK_DAYS = 30;

export function canWithdrawVolunteer(match) {
  if (!match?.date) return false;
  const daysUntil = (new Date(match.date).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
  return daysUntil > WITHDRAW_LOCK_DAYS;
}

/**
 * Does this interest form / match belong to the given school? The Firestore
 * rules let any approved user READ all engagements (providers need to see open
 * requests), so the SCHOOL views must scope to their own records client-side —
 * otherwise a school sees every school's engagements. Prefer the stamped
 * schoolUid; fall back to the school name for optimistic/legacy records that
 * haven't round-tripped through Firestore yet.
 */
export function ownedBySchool(record, user) {
  if (!record || !user) return false;
  return record.schoolUid
    ? record.schoolUid === user.uid
    : record.school === user.schoolName;
}

export function EngagementProvider({ children }) {
  const { user } = useAuth();

  const [state, setState] = useState(
    () => readStored() ?? { interestForms: [], matches: [] }
  );

  const [isConnected, setIsConnected] = useState(false);

  // Stamp the ownership fields the Firestore security rules check, then save.
  //   schoolUid         — the creating school's auth uid (set once, preserved)
  //   rosterProviderIds — flat list of the provider ids on the roster, so a
  //                       rule can test membership (rules can't iterate objects)
  // Both the form and its match get the same rosterProviderIds so their rules
  // stay in sync when a provider confirms and both docs are written together.
  function persist(form, match) {
    const rosterProviderIds = (match?.roster ?? form?.roster ?? []).map((r) => r.id);
    const stamp = (d) =>
      d && { ...d, schoolUid: d.schoolUid ?? user?.uid, rosterProviderIds };
    saveInterestFormAndMatch(stamp(form), stamp(match));
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    // Firestore is the single source of truth for engagements — no local seed.
    // Subscribe for live sync across users/sessions and mirror it exactly,
    // including when a collection is empty.
    const unsub = subscribeEngagements(
      (remoteData) => {
        setIsConnected(true);
        setState(remoteData);
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
      persist(createdForm, createdMatch);
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
      persist(createdForm, createdMatch);
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
      persist(updatedForm, updatedMatch);
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
        // Keep accepting volunteers until the school has confirmed enough.
        const confirmed = (m.roster ?? []).filter((r) => r.confirmed).length;
        if (confirmed >= (m.volunteersNeeded ?? 1)) return m;             // already staffed

        const roster = [
          ...(m.roster ?? []),
          { ...provider, confirmed: false, confirmedAt: null, volunteered: true },
        ];

        // The provider is only a volunteer until the school confirms them, so
        // the target stays unset here (see confirmVolunteer).
        return withDerivedStatus({ ...m, roster });
      });

      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = syncForm(s.interestForms, matchId, updatedMatch?.status);
      updatedForm = interestForms.find((f) => f.matchId === matchId);

      return { matches, interestForms };
    });

    if (updatedMatch || updatedForm) {
      persist(updatedForm, updatedMatch);
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

  // School confirms a volunteer it wants. Once enough are confirmed the match
  // becomes Confirmed (see withDerivedStatus).
  function confirmVolunteer(matchId, providerId) {
    let updatedMatch = null;
    let updatedForm = null;
    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const roster = (m.roster ?? []).map((r) =>
          r.id === providerId
            ? { ...r, confirmed: true, confirmedAt: new Date().toISOString() }
            : r
        );
        const next = withDerivedStatus({ ...m, roster });
        return { ...next, target: targetFromConfirmed(next) };
      });
      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = syncForm(s.interestForms, matchId, updatedMatch?.status);
      updatedForm = interestForms.find((f) => f.matchId === matchId);
      return { matches, interestForms };
    });
    if (updatedMatch || updatedForm) persist(updatedForm, updatedMatch);
  }

  // Admin-only: remove a volunteer from a request. Providers can't withdraw
  // once they've volunteered — only an admin can pull them out.
  function removeVolunteer(matchId, providerId) {
    let updatedMatch = null;
    let updatedForm = null;
    setState((s) => {
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const roster = (m.roster ?? []).filter((r) => r.id !== providerId);
        const next = withDerivedStatus({ ...m, roster });
        return { ...next, target: targetFromConfirmed(next) };
      });
      updatedMatch = matches.find((m) => m.id === matchId);
      const interestForms = syncForm(s.interestForms, matchId, updatedMatch?.status);
      updatedForm = interestForms.find((f) => f.matchId === matchId);
      return { matches, interestForms };
    });
    if (updatedMatch || updatedForm) persist(updatedForm, updatedMatch);
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
      persist(updatedForm, updatedMatch);
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
      persist(updatedForm, updatedMatch);
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
      persist(updatedForm, updatedMatch);
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
      persist(updatedForm, updatedMatch);
    }
  }

  function resetDemo() {
    // No local seed any more. Clears the local view; the live Firestore
    // subscription immediately repopulates from the database.
    setState({ interestForms: [], matches: [] });
  }

  const value = {
    isConnected,
    interestForms: state.interestForms,
    matches: state.matches,
    submitInterest,
    submitOpenRequest,
    updateOpenRequest,
    volunteerForRequest,
    confirmVolunteer,
    removeVolunteer,
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
