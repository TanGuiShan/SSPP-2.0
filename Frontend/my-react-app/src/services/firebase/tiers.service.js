// services/firebase/tiers.service.js
//
// The `tiers` collection: engagement-tier config, one doc per tier keyed by id
// (tier1, …, or a custom id). Publicly readable (the signup forms need them
// before login); only admins may write — the security rules enforce that.
//
// Tier logic lives in requiresBooth / isHandsOn — tiersFor() filters on them, so
// the edit form must always set them. maxParticipants / equipment are display.

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./client";
import { DEFAULT_TIERS } from "../../data/options";

const TIERS = "tiers";

/**
 * Upload the built-in tiers into Firestore, one doc per tier. Idempotent:
 * existing ids are skipped so an admin's edits are never overwritten by a
 * re-seed. Returns how many were newly written.
 */
export async function seedTiers(tiers = DEFAULT_TIERS) {
  const snap = await getDocs(collection(db, TIERS));
  const existing = new Set(snap.docs.map((d) => d.id));
  const missing = tiers.filter((t) => !existing.has(t.id));
  if (missing.length === 0) return { added: 0 };

  const batch = writeBatch(db);
  for (const t of missing) {
    const { id, ...data } = t;
    batch.set(doc(db, TIERS, id), data);
  }
  await batch.commit();
  return { added: missing.length };
}

/** Create or replace a tier. `id` is the doc id; the rest is the tier body. */
export async function saveTier(id, { id: _ignore, ...data }) {
  await setDoc(doc(db, TIERS, String(id)), data);
}

export async function deleteTier(id) {
  await deleteDoc(doc(db, TIERS, String(id)));
}
