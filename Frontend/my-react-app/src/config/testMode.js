// config/testMode.js
// A single switch for demo/testing that skips the slow or backend-dependent
// gates: email/mobile verification and the government-domain sign-up rule.
//
// Turn it on by putting this in a `.env.local` at the project root:
//     VITE_TEST_MODE=true
// and restart the dev server. With it off (the default), the app behaves as
// it will in production.
//
// Never ship a build with this on — the checks below make that visible.

export const TEST_MODE = import.meta.env.VITE_TEST_MODE === "true";

// In test mode, verification auto-passes and any email domain is allowed.
export const SKIP_VERIFICATION = TEST_MODE;
export const SKIP_DOMAIN_CHECK = TEST_MODE;

// A small banner uses this so nobody demos a build without realising the
// gates are off.
export const TEST_MODE_LABEL = TEST_MODE ? "TEST MODE — verification & domain checks bypassed" : "";

if (TEST_MODE && typeof console !== "undefined") {
  console.warn(
    "%cSSPP TEST MODE ON — verification and gov-domain checks are bypassed. Do not use for production.",
    "color:#B45309;font-weight:bold"
  );
}
