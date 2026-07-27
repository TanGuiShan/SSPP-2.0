// services/firebase/client.js
//
// The ONLY file that imports from firebase/*. Everything else imports from
// here, so if the SDK changes there's one place to fix.
//
// Config comes from environment variables, never a committed file:
//   .env.development -> demo project      (git-ignored)
//   .env.production  -> production        (git-ignored)
// Vite picks the right one automatically, so you can't deploy to prod with
// demo keys by accident.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

// Fail loudly at startup rather than mysteriously on the first query.
const missing = required.filter((k) => !import.meta.env[k]);
if (missing.length) {
  throw new Error(
    `Firebase config missing: ${missing.join(", ")}. ` +
      `Copy .env.example to .env.development and fill in your project's values.`
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/** "demo" | "prod" — drives the environment banner. */
export const ENV_LABEL = import.meta.env.VITE_ENV_LABEL ?? "demo";
export const IS_PROD = ENV_LABEL === "prod";

if (!IS_PROD && typeof console !== "undefined") {
  console.info(
    `%cSSPP connected to ${firebaseConfig.projectId} (${ENV_LABEL})`,
    "color:#2459a9;font-weight:bold"
  );
}

export default app;
