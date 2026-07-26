import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "../services/firebase/client";

const INTEREST_FORMS_COL = "interestForms";
const MATCHES_COL = "matches";

/**
 * Clean data for Firestore storage (ensure no undefined values).
 */
function sanitize(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitize(value);
    }
  }
  return clean;
}

/**
 * Seeds initial forms and matches into Firestore if empty.
 */
export async function seedFirestoreIfNeeded(seedForms = [], seedMatches = []) {
  try {
    const matchesRef = collection(db, MATCHES_COL);
    const snapshot = await getDocs(matchesRef);

    if (snapshot.empty) {
      console.log("Seeding Firestore with initial engagement & match records...");
      const batch = writeBatch(db);

      for (const form of seedForms) {
        const ref = doc(db, INTEREST_FORMS_COL, String(form.id));
        batch.set(ref, sanitize(form));
      }

      for (const match of seedMatches) {
        const ref = doc(db, MATCHES_COL, String(match.id));
        batch.set(ref, sanitize(match));
      }

      await batch.commit();
      console.log("Firestore seeded successfully.");
    }
  } catch (err) {
    console.warn("Firestore seed failed:", err);
  }
}

/**
 * Subscribe to real-time updates for interest forms and matches.
 */
export function subscribeEngagements(onData, onError) {
  let forms = [];
  let matches = [];
  let formsLoaded = false;
  let matchesLoaded = false;

  const notify = () => {
    if (formsLoaded && matchesLoaded) {
      onData({ interestForms: forms, matches });
    }
  };

  const unsubForms = onSnapshot(
    collection(db, INTEREST_FORMS_COL),
    (snapshot) => {
      forms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      formsLoaded = true;
      notify();
    },
    (err) => {
      console.warn("Firestore forms subscription error:", err);
      if (onError) onError(err);
    }
  );

  const unsubMatches = onSnapshot(
    collection(db, MATCHES_COL),
    (snapshot) => {
      matches = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      matchesLoaded = true;
      notify();
    },
    (err) => {
      console.warn("Firestore matches subscription error:", err);
      if (onError) onError(err);
    }
  );

  return () => {
    unsubForms();
    unsubMatches();
  };
}

/**
 * Save an interest form record to Firestore.
 */
export async function saveInterestFormDoc(form) {
  try {
    const ref = doc(db, INTEREST_FORMS_COL, String(form.id));
    await setDoc(ref, sanitize(form), { merge: true });
  } catch (err) {
    console.error("Error saving interest form to Firestore:", err);
  }
}

/**
 * Save a match record to Firestore.
 */
export async function saveMatchDoc(match) {
  try {
    const ref = doc(db, MATCHES_COL, String(match.id));
    await setDoc(ref, sanitize(match), { merge: true });
  } catch (err) {
    console.error("Error saving match to Firestore:", err);
  }
}

/**
 * Batch save interest form and match together.
 */
export async function saveInterestFormAndMatch(form, match) {
  try {
    const batch = writeBatch(db);
    if (form) {
      const formRef = doc(db, INTEREST_FORMS_COL, String(form.id));
      batch.set(formRef, sanitize(form), { merge: true });
    }
    if (match) {
      const matchRef = doc(db, MATCHES_COL, String(match.id));
      batch.set(matchRef, sanitize(match), { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error("Error saving engagement record to Firestore:", err);
  }
}

/**
 * Reset Firestore collections with fresh seed data.
 */
export async function resetEngagementsFirestore(seedForms = [], seedMatches = []) {
  try {
    const batch = writeBatch(db);

    for (const form of seedForms) {
      const ref = doc(db, INTEREST_FORMS_COL, String(form.id));
      batch.set(ref, sanitize(form));
    }

    for (const match of seedMatches) {
      const ref = doc(db, MATCHES_COL, String(match.id));
      batch.set(ref, sanitize(match));
    }

    await batch.commit();
  } catch (err) {
    console.error("Error resetting Firestore demo data:", err);
  }
}
