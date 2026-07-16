// hooks/useEngagements.jsx
// Shared state for the interest form → approval → match flow.
//
// Everything the school submits, the admin approves, and both sides see lives
// here. Persisted to localStorage so a refresh (or switching roles to check
// the other side of the flow) doesn't wipe the demo.
//
// ── REAL ────────────────────────────────────────────────────────────────
// Replace the reducer bodies with API calls when the backend lands. The shape
// of the actions is deliberately close to what REST endpoints would be:
//   submitInterest  -> POST /interest-forms
//   withdrawInterest-> DELETE /interest-forms/:id
//   approveInterest -> POST /interest-forms/:id/approve  (creates a match)
//   rejectInterest  -> POST /interest-forms/:id/reject
// ────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useState } from "react";
import { seedInterestForms, seedMatches } from "../data/seed";

const EngagementContext = createContext(null);

const STORAGE_KEY = "sspp.engagements";

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Guard against a half-written or older-shaped blob
    if (!Array.isArray(parsed?.interestForms) || !Array.isArray(parsed?.matches)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Sequential, human-readable IDs — nicer in a demo than a uuid.
// Only looks at the digits *after* the prefix, so a prefix containing numbers
// ("AWEE-2026-") doesn't get swallowed into the counter.
function nextId(prefix, existing) {
  const numbers = existing
    .filter((x) => String(x.id).startsWith(prefix))
    .map((x) => Number(String(x.id).slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export function EngagementProvider({ children }) {
  const [state, setState] = useState(
    () => readStored() ?? { interestForms: seedInterestForms, matches: seedMatches }
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /**
   * School submits an interest form.
   * @param {object} payload - { target, date, timings, tier, participants, notes }
   *   `target` is either a unit, a single ambassador, or { team: [...] }.
   */
  function submitInterest(payload) {
    setState((s) => {
      const form = {
        id: nextId("IF", s.interestForms),
        submittedAt: new Date().toISOString(),
        status: "Pending",
        ...payload,
      };
      return { ...s, interestForms: [form, ...s.interestForms] };
    });
  }

  function withdrawInterest(id) {
    setState((s) => ({
      ...s,
      interestForms: s.interestForms.map((f) =>
        f.id === id ? { ...f, status: "Withdrawn" } : f
      ),
    }));
  }

  /** Admin approves a form — this is what creates the match both sides see. */
  function approveInterest(id) {
    setState((s) => {
      const form = s.interestForms.find((f) => f.id === id);
      if (!form) return s;

      const match = {
        id: nextId("AWEE-2026-", s.matches),
        formId: form.id,
        school: form.school,
        target: form.target,
        date: form.date,
        timings: form.timings,
        tier: form.tier,
        participants: form.participants,
        notes: form.notes,
        status: "Approved",
        approvedAt: new Date().toISOString(),
      };

      return {
        interestForms: s.interestForms.map((f) =>
          f.id === id ? { ...f, status: "Approved", matchId: match.id } : f
        ),
        matches: [match, ...s.matches],
      };
    });
  }

  function rejectInterest(id, reason = "") {
    setState((s) => ({
      ...s,
      interestForms: s.interestForms.map((f) =>
        f.id === id ? { ...f, status: "Rejected", rejectionReason: reason } : f
      ),
    }));
  }

  function cancelMatch(id) {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) => (m.id === id ? { ...m, status: "Cancelled" } : m)),
    }));
  }

  /** Wipe everything back to the seed data — handy when demoing. */
  function resetDemo() {
    setState({ interestForms: seedInterestForms, matches: seedMatches });
  }

  const value = {
    interestForms: state.interestForms,
    matches: state.matches,
    submitInterest,
    withdrawInterest,
    approveInterest,
    rejectInterest,
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
