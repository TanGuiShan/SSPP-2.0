// services/firebase/catalog.service.js
// Publishes a provider's PUBLIC browse card so schools can find them.
//
// A unit/ambassador account lives in users/{uid} (private profile). Schools
// can't read other users, so we mirror the browsable, non-sensitive fields
// into a public catalog:
//   units       -> formations/{providerId}
//   ambassadors -> ambassadors/{providerId}
// keyed by the providerId claimed at sign-up. The security rules let a provider
// write only their own doc (ownerUid == their uid).

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";

// The unit sign-up stores mobility as a tier id; browse expects the
// sharing / sharing_booth vocabulary. Map between them.
function normalizeMobility(m) {
  if (m === "sharing" || m === "sharing_booth") return m;
  if (m === "tier1" || m === "tier2") return "sharing_booth";
  if (m === "tier3") return "sharing";
  return "sharing";
}

// Selected availability dates -> a from/to range the browse date filter uses.
function dateRange(availability) {
  const dates = availability?.dates ?? [];
  if (!dates.length) return {};
  const sorted = dates
    .map((d) => new Date(d.year, d.month, d.day))
    .sort((a, b) => a - b);
  const fmt = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;
  return { availableFrom: fmt(sorted[0]), availableTo: fmt(sorted[sorted.length - 1]) };
}

function unitDoc(ownerUid, p) {
  return {
    ownerUid,
    name: p.unitName || p.unit || p.name || "",
    formation: p.formation || "",
    location: p.location || "",
    mobility: normalizeMobility(p.mobility),
    engagementTypes: Array.isArray(p.engagementTypes) ? p.engagementTypes : [],
    topics: Array.isArray(p.topics) ? p.topics : [],
    levelsPreferred: Array.isArray(p.levelsPreferred) ? p.levelsPreferred : [],
    about: p.about || "",
    image: p.photoURL || "",
    imageKey: p.imageKey || "",
    availability: p.availability ?? null,
    ...dateRange(p.availability),
    updatedAt: serverTimestamp(),
  };
}

function ambassadorDoc(ownerUid, p) {
  return {
    ownerUid,
    rank: p.rank || "",
    name: p.fullName || p.name || "",
    appointment: p.appointment || "",
    formation: p.formation || "",
    camp: p.camp || "",
    mobility: normalizeMobility(p.mobility),
    engagementTypes: Array.isArray(p.engagementTypes) ? p.engagementTypes : [],
    topics: Array.isArray(p.topics) ? p.topics : [],
    levelsPreferred: Array.isArray(p.levelsPreferred)
      ? p.levelsPreferred
      : Array.isArray(p.preferredSchoolLevels)
      ? p.preferredSchoolLevels
      : [],
    about: p.about || p.remarks || "",
    photo: p.photoURL || "",
    availability: p.availability ?? null,
    ...dateRange(p.availability),
    updatedAt: serverTimestamp(),
  };
}

/**
 * Publish (upsert) a provider's public browse card from their profile data.
 * @param {{ role: string, providerId: string, ownerUid: string, profile: object }} args
 */
export async function publishProviderCatalog({ role, providerId, ownerUid, profile }) {
  if (!providerId || !ownerUid) return;
  const isAmbassador = role === "army-ambassador";
  const col = isAmbassador ? "ambassadors" : "formations";
  const data = isAmbassador ? ambassadorDoc(ownerUid, profile) : unitDoc(ownerUid, profile);
  await setDoc(doc(db, col, String(providerId)), data, { merge: true });
}
