// services/firebase/demo.service.js
//
// One-click demo data for the Browse catalog: sample units (formations) and
// ambassadors so a school logging in has real cards to browse and book. Admin
// only — the security rules already let an admin write formations/ambassadors.
//
// Idempotent: existing ids are skipped, so re-running never duplicates and never
// overwrites a real provider that has since claimed one of these catalog ids.
// Every seeded doc carries `demo: true` so it's easy to spot (or clear) later.

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import { formations as DEMO_FORMATIONS } from "../../data/formations";
import { demoAmbassadors as DEMO_AMBASSADORS } from "../../data/demo/ambassadors";

function formationDoc(ownerUid, f) {
  return {
    ownerUid,
    name: f.name,
    formation: f.formation,
    location: f.location,
    mobility: f.mobility,
    topics: f.topics ?? [],
    levelsPreferred: f.levelsPreferred ?? [],
    about: f.about ?? "",
    image: "", // bundled images resolve by imageKey on the client; keep the doc lean
    imageKey: f.imageKey ?? "",
    availableFrom: f.availableFrom ?? "",
    availableTo: f.availableTo ?? "",
    demo: true,
    updatedAt: serverTimestamp(),
  };
}

function ambassadorDoc(ownerUid, a) {
  return {
    ownerUid,
    rank: a.rank,
    name: a.name,
    appointment: a.appointment,
    formation: a.formation,
    camp: a.camp,
    mobility: a.mobility,
    topics: a.topics ?? [],
    levelsPreferred: a.levelsPreferred ?? [],
    about: a.about ?? "",
    photo: "",
    availability: a.availability ?? null, // per-date preferred slots (surfaced on the card)
    availableFrom: a.availableFrom ?? "",
    availableTo: a.availableTo ?? "",
    demo: true,
    updatedAt: serverTimestamp(),
  };
}

// Write only the ids that don't already exist in `col`. Returns count added.
async function seedMissing(col, items, toDoc, ownerUid) {
  const snap = await getDocs(collection(db, col));
  const existing = new Set(snap.docs.map((d) => d.id));
  const missing = items.filter((it) => !existing.has(it.id));
  if (missing.length === 0) return 0;

  const batch = writeBatch(db);
  for (const it of missing) batch.set(doc(db, col, it.id), toDoc(ownerUid, it));
  await batch.commit();
  return missing.length;
}

/**
 * Seed demo units + ambassadors into the Browse catalogs.
 * @param {string} ownerUid  the seeding admin's uid (stamped as ownerUid)
 * @returns {Promise<{formationsAdded:number, ambassadorsAdded:number}>}
 */
export async function seedDemoProviders(ownerUid) {
  const formationsAdded = await seedMissing("formations", DEMO_FORMATIONS, formationDoc, ownerUid);
  const ambassadorsAdded = await seedMissing("ambassadors", DEMO_AMBASSADORS, ambassadorDoc, ownerUid);
  return { formationsAdded, ambassadorsAdded };
}
