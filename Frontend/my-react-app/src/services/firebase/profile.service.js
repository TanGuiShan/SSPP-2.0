// services/firebase/profile.service.js
//
// The users/{uid} document: role, approval status, and whatever profile
// fields that role needs. This is what turns a Firebase Auth account into
// an SSPP user — an account with no profile has no role and can do nothing.
//
// If roles or the approval queue misbehave, open this file.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";

const USERS = "users";
const PROVIDERS = "providers";

/**
 * Claim a provider identity at sign-up. The document id IS the catalog id, so
 * the security rules reject a second account claiming the same id (create only
 * succeeds when the doc is new and you are its ownerUid). This is what ties a
 * unit/ambassador account to the roster ids that appear on matches.
 */
export async function claimProvider(providerId, { ownerUid, kind, name }) {
  try {
    await setDoc(doc(db, PROVIDERS, String(providerId)), {
      ownerUid,
      kind: kind ?? null,
      name: name ?? "",
      claimedAt: serverTimestamp(),
    });
  } catch {
    throw new Error(
      "That unit has already been registered by another account. " +
        "If this is your unit, contact an administrator."
    );
  }
}

/**
 * Create the profile that accompanies a new account.
 *
 * `approved` is passed in from the domain check. The security rule ALSO
 * verifies it against the email domain, so this can't be used to self-approve
 * — if the two disagree, Firestore rejects the write.
 */
export async function createProfile(uid, { email, role, approved, ...rest }) {
  const profile = {
    email,
    role,
    approved: Boolean(approved),
    createdAt: serverTimestamp(),
    ...rest,
  };
  await setDoc(doc(db, USERS, uid), profile);
  return profile;
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

/**
 * Update your own profile. Role and approval are deliberately NOT accepted
 * here — the security rule blocks changing them, and silently dropping them
 * client-side gives a clearer error than a rules rejection.
 */
export async function updateProfile(uid, changes) {
  const { role, approved, email, createdAt, ...safe } = changes;
  await updateDoc(doc(db, USERS, uid), safe);
}

/** Volunteers waiting for an admin. Admin-only — the rules enforce that. */
export async function listPendingUsers() {
  const q = query(collection(db, USERS), where("approved", "==", false));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

/** Admin approves a volunteer. Only admins can write this field. */
export async function approveUser(uid) {
  await updateDoc(doc(db, USERS, uid), {
    approved: true,
    approvedAt: serverTimestamp(),
  });
}

/**
 * Admin rejects a volunteer. We keep the record rather than deleting it, so
 * there's a trail and the person isn't silently re-prompted to sign up.
 */
export async function rejectUser(uid, reason = "") {
  await updateDoc(doc(db, USERS, uid), {
    approved: false,
    rejected: true,
    rejectionReason: reason,
    rejectedAt: serverTimestamp(),
  });
}
