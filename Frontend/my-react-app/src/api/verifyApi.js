// api/verifyApi.js
// Email + mobile verification.
//
// ─────────────────────────────────────────────────────────────────────
// DEMO MODE (active): no backend exists yet, so sendCode() pretends to
// send and verifyCode() accepts the fixed code below. To go live, comment
// out each DEMO block and uncomment the REAL block above it.
// ─────────────────────────────────────────────────────────────────────

// Uncomment when the REAL fetch blocks below are enabled:
// const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

// Any code entered in demo mode must match this to pass.
export const DEMO_CODE = "123456";

/**
 * Send a verification code to an email address or mobile number.
 * @param {"email"|"mobile"} channel
 * @param {string} destination - the email address or phone number
 */
export async function sendCode(channel, destination) {
  // ── REAL (uncomment when the backend is ready) ──────────────────────
  // const res = await fetch(`${API_BASE}/verify/send`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ channel, destination }),
  // });
  // if (!res.ok) {
  //   const { message } = await res.json().catch(() => ({}));
  //   throw new Error(message || "Could not send the code. Try again.");
  // }
  // return res.json(); // => { sent: true, expiresInSeconds: 600 }

  // ── DEMO (comment out when going live) ─────────────────────────────
  await delay(600);
  console.info(`[demo] Code for ${channel} ${destination} is ${DEMO_CODE}`);
  return { sent: true, expiresInSeconds: 600 };
}

/**
 * Check a code the user typed in.
 * @param {"email"|"mobile"} channel
 * @param {string} destination
 * @param {string} code
 */
export async function verifyCode(channel, destination, code) {
  // ── REAL (uncomment when the backend is ready) ──────────────────────
  // const res = await fetch(`${API_BASE}/verify/check`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ channel, destination, code }),
  // });
  // if (!res.ok) {
  //   const { message } = await res.json().catch(() => ({}));
  //   throw new Error(message || "That code isn't right.");
  // }
  // return res.json(); // => { verified: true }

  // ── DEMO (comment out when going live) ─────────────────────────────
  await delay(500);
  if (code.trim() !== DEMO_CODE) {
    throw new Error(`That code isn't right. (Demo code is ${DEMO_CODE})`);
  }
  return { verified: true };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
