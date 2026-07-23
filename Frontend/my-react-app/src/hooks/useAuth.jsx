/* eslint-disable react-refresh/only-export-components */
// hooks/useAuth.jsx
// Session/auth context shared across the whole app.
//
// Roles: "school" | "army-unit" | "army-ambassador" | "admin"
// The two army roles share a layout and most pages, but are separate roles so
// route guards, profile pages and (later) the school's browse view can treat
// them differently without a rewrite.

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "sspp.user";

export const ARMY_ROLES = ["army-unit", "army-ambassador"];
export const isArmyRole = (role) => ARMY_ROLES.includes(role);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // ── REAL (uncomment when the backend is ready) ──────────────────────
  // async function login({ email, password }) {
  //   const { user: authUser } = await loginUser({ email, password });
  //   setUser(authUser); // role comes from the server, not the client
  // }

  // ── DEMO ───────────────────────────────────────────────────────────
  // No backend session yet, so login just records who the user says they are.
  function login({ email, role, schoolName }) {
    const resolvedSchoolName =
      schoolName || (role === "school" ? "Swiss Cottage Secondary School" : undefined);
    setUser({ email, role, schoolName: resolvedSchoolName });
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isArmy: isArmyRole(user?.role),
    isAmbassador: user?.role === "army-ambassador",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default useAuth;
