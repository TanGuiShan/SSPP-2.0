// utils/domain.js
// Decides whether a sign-up email belongs to a government domain (direct
// access) or an outside one (volunteer — needs admin approval first).
//
// Rule (confirmed): *.gov.sg and *.edu.sg are government. Everything else is
// a volunteer and must be approved by an admin before they can use the app.
//
// ── REAL ──────────────────────────────────────────────────────────────
// In production the allowlist should live server-side and the *enforcement*
// (refusing a session until approved) must be the backend's job — the checks
// here only shape the UI. Keep this list in sync with the server, or better,
// have the server return the account's approval status at login.

const GOV_SUFFIXES = [".gov.sg", ".edu.sg"];

/** Lowercased domain part of an email, or "" if malformed. */
export function emailDomain(email) {
  const at = (email || "").trim().toLowerCase().lastIndexOf("@");
  return at === -1 ? "" : email.trim().toLowerCase().slice(at + 1);
}

/** True if the email is on a government domain (school or defence). */
export function isGovEmail(email) {
  const domain = emailDomain(email);
  if (!domain) return false;
  return GOV_SUFFIXES.some((suffix) => domain === suffix.slice(1) || domain.endsWith(suffix));
}

/**
 * Account tier implied by the email:
 *   "gov"       -> direct access after email verification
 *   "volunteer" -> verify, then wait for admin approval
 */
export function accountTier(email) {
  return isGovEmail(email) ? "gov" : "volunteer";
}
