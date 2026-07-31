// services/firebase/auth.service.js
//
// Everything to do with WHO the user is. If sign-in, sign-up, verification or
// password reset misbehaves, this is the only file to open.
//
// Firestore data access lives in the other services — this one deals purely
// with Firebase Auth, plus creating the matching profile document on sign-up
// (because an account without a profile has no role, so it can't do anything).

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "./client";
import { createProfile, getProfile, claimProvider } from "./profile.service";
import { accountTier } from "../../utils/domain";

/**
 * Turn Firebase's error codes into something a person can act on. Firebase
 * messages like "auth/invalid-credential" are useless in a UI.
 */
function friendlyError(error) {
  const code = error?.code ?? "";
  const map = {
    "auth/email-already-in-use": "That email is already registered. Try signing in instead.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/weak-password": "Password needs to be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/network-request-failed": "Can't reach the server. Check your connection.",
    "auth/requires-recent-login": "Please sign in again before changing your password.",
  };
  return new Error(map[code] ?? error?.message ?? "Something went wrong. Try again.");
}

/**
 * Create an account, send the verification email, and create the profile doc.
 *
 * The profile's `approved` flag is set from the email domain — gov staff are
 * in immediately, everyone else waits for an admin. The SECURITY RULE enforces
 * this too, so a modified client can't self-approve; this is just the honest
 * client-side half.
 *
 * @param {object} params
 * @param {"school"|"army-unit"|"army-ambassador"|"admin"} params.role
 * @param {object} params.profile  extra fields for the users/{uid} doc
 */
export async function signUp({
  email,
  password,
  role,
  providerId,
  providerKind,
  providerName,
  profile = {},
}) {
  // Track the auth account so we can roll it back if a later step fails.
  let createdUser = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = cred.user;
    const { uid } = cred.user;

    // Firebase sends this for free — no email provider needed. Non-fatal: a
    // failed verification email must not abort an otherwise-successful signup.
    try {
      await sendEmailVerification(cred.user);
    } catch {
      /* ignore — the user can resend from the app */
    }

    // Providers link to a catalog identity so the security rules can tie a
    // match's roster to an account. Units claim an existing catalog id;
    // ambassadors are new individuals, so they own their own uid.
    let resolvedProviderId = providerId;
    if (!resolvedProviderId && providerKind === "ambassador") {
      resolvedProviderId = uid;
    }
    if (resolvedProviderId) {
      await claimProvider(resolvedProviderId, {
        ownerUid: uid,
        kind: providerKind ?? null,
        name: providerName ?? "",
      });
    }

    const approved = accountTier(email) === "gov";
    await createProfile(uid, {
      email,
      role,
      approved,
      ...(resolvedProviderId ? { providerId: resolvedProviderId, providerKind } : {}),
      ...profile,
    });

    return { uid, email, role, approved, emailVerified: false, providerId: resolvedProviderId };
  } catch (error) {
    // If the auth account was created but claiming or profile-creation failed,
    // delete it so the email isn't locked to a broken (profile-less) account
    // and the user can try again cleanly. If createUser itself failed (e.g.
    // email already in use), createdUser is null and there's nothing to undo.
    if (createdUser) {
      try {
        await createdUser.delete();
      } catch {
        /* best effort — an orphan may still need manual cleanup in the console */
      }
    }
    throw friendlyError(error);
  }
}

/**
 * Sign in, then load the profile so we know the role. An account with no
 * profile document can't be used — that would mean signup half-completed.
 */
export async function signIn({ email, password }) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getProfile(cred.user.uid);

    if (!profile) {
      await signOut(auth);
      throw new Error(
        "Your account is missing its profile. Contact an administrator."
      );
    }

    return {
      uid: cred.user.uid,
      email: cred.user.email,
      emailVerified: cred.user.emailVerified,
      ...profile,
    };
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function signOutUser() {
  await signOut(auth);
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function resendVerification() {
  if (!auth.currentUser) throw new Error("You need to be signed in.");
  await sendEmailVerification(auth.currentUser);
}

/** Changing a password requires a recent sign-in, so re-authenticate first. */
export async function changePassword({ currentPassword, newPassword }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You need to be signed in.");

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  } catch (error) {
    throw friendlyError(error);
  }
}

/**
 * Watch the session. Fires on sign-in, sign-out, and on page load once
 * Firebase has restored the session from storage — which is why the app needs
 * a "loading" state before it knows whether anyone is signed in.
 *
 * @param {(user: object|null) => void} onChange
 * @returns {() => void} unsubscribe
 */
export function watchAuth(onChange) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      onChange(null);
      return;
    }

    try {
      const profile = await getProfile(fbUser.uid);
      onChange(
        profile
          ? {
              uid: fbUser.uid,
              email: fbUser.email,
              emailVerified: fbUser.emailVerified,
              ...profile,
            }
          : null
      );
    } catch {
      // Rules deny profile reads until signed in properly; treat as signed out
      // rather than leaving the app in a half-authenticated state.
      onChange(null);
    }
  });
}

export function currentUser() {
  return auth.currentUser;
}
