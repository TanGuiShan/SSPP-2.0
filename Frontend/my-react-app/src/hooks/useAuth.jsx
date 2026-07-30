// hooks/useAuth.jsx
//
// Session state, now backed by Firebase Auth instead of localStorage.
//
// The public surface is UNCHANGED — user, isAuthenticated, isArmy,
// isAmbassador, login, logout — so no page needs editing. Two things are new:
//   `loading`  — true until Firebase has restored the session on page load
//   `signup`, `resetPassword`, `needsApproval` — for the auth pages
//
// Roles: "school" | "army-unit" | "army-ambassador" | "admin"

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signIn,
  signUp,
  signOutUser,
  resetPassword as resetPasswordService,
  watchAuth,
} from "../services/firebase/auth.service";
import { TEST_MODE } from "../config/testMode";

const AuthContext = createContext(null);

export const ARMY_ROLES = ["army-unit", "army-ambassador"];
export const isArmyRole = (role) => ARMY_ROLES.includes(role);

// Demo sign-in without Firebase, for local UI work. Never active in a build
// where VITE_TEST_MODE isn't "true".
const DEMO_STORAGE_KEY = "sspp.demoUser";

function readDemoUser() {
  if (!TEST_MODE) return null;
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readDemoUser());
  // Start "loading" so the app doesn't flash the login page before Firebase
  // has had a chance to restore an existing session.
  const [loading, setLoading] = useState(!TEST_MODE);

  useEffect(() => {
    if (TEST_MODE) {
      setLoading(false);
      return undefined;
    }

    const unsub = watchAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /**
   * Sign in. In test mode this skips Firebase entirely and just records the
   * role the demo picker chose, so the UI can be worked on offline.
   */
  async function login(credentials) {
    if (TEST_MODE) {
      const demoUser = {
        uid: "demo-user",
        email: credentials.email ?? "demo@sspp.local",
        role: credentials.role ?? "school",
        approved: true,
        emailVerified: true,
        schoolName:
          credentials.schoolName ??
          (credentials.role === "school" ? "Swiss Cottage Secondary School" : undefined),
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }

    const signedIn = await signIn(credentials);
    setUser(signedIn);
    return signedIn;
  }

  async function signup(params) {
    if (TEST_MODE) return { ...params, approved: true };
    return signUp(params);
  }

  async function logout() {
    if (TEST_MODE) {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setUser(null);
      return;
    }
    await signOutUser();
    setUser(null);
  }

  /**
   * Merge saved profile changes into the in-memory user so the UI reflects an
   * edit immediately. onAuthStateChanged only fires on sign-in/out, not on a
   * Firestore doc write, so without this the app keeps showing the old values
   * until a full page reload.
   */
  function applyProfileChanges(changes) {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...changes };
      if (TEST_MODE) {
        try {
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore storage errors */
        }
      }
      return next;
    });
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isArmy: isArmyRole(user?.role),
    isAmbassador: user?.role === "army-ambassador",
    // A volunteer who's verified their email but is still waiting on an admin.
    needsApproval: Boolean(user) && user.approved === false,
    login,
    signup,
    logout,
    applyProfileChanges,
    resetPassword: resetPasswordService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default useAuth;
