// hooks/useTiers.jsx
//
// Live engagement tiers. Subscribes to the Firestore `tiers` collection and
// hydrates the shared list in data/options.js IN PLACE via setTiers(), so every
// existing synchronous caller (getTier, tiersFor, `import { TIERS }`) reflects
// the live config without being rewritten.
//
// When the collection is empty or unreachable (e.g. test mode, or before it's
// seeded) it falls back to DEFAULT_TIERS — the app never renders tier-less.
//
// Components that need to RE-RENDER on tier edits (the admin Tier Config page)
// read `tiers` from this hook's state; everyone else just benefits from the
// hydrated module cache on their next render.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/client";
import { DEFAULT_TIERS, setTiers, tiersForFrom } from "../data/options";

const TiersContext = createContext(null);

const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);

export function TiersProvider({ children }) {
  const [tiers, setTiersState] = useState(DEFAULT_TIERS);
  const [usingDefaults, setUsingDefaults] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "tiers"),
      (snap) => {
        setLoading(false);
        if (snap.empty) {
          setTiers(DEFAULT_TIERS); // resets the module cache to defaults
          setTiersState(DEFAULT_TIERS);
          setUsingDefaults(true);
          return;
        }
        const live = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder);
        setTiers(live); // hydrate the shared TIERS array in place
        setTiersState(live);
        setUsingDefaults(false);
      },
      (err) => {
        // Non-fatal: keep the built-in defaults so the app still works.
        console.warn("Firestore \"tiers\" subscription warning:", err);
        setLoading(false);
        setTiers(DEFAULT_TIERS);
        setTiersState(DEFAULT_TIERS);
        setUsingDefaults(true);
      }
    );
    return () => unsub();
  }, []);

  // Reactive helpers bound to state, so a component that reads them re-renders
  // the instant a tier is edited (not just on its next incidental render).
  const value = useMemo(
    () => ({
      tiers,
      usingDefaults,
      loading,
      getTier: (id) => tiers.find((t) => t.id === id),
      tiersFor: (providerType, opts) => tiersForFrom(tiers, providerType, opts),
    }),
    [tiers, usingDefaults, loading]
  );

  return <TiersContext.Provider value={value}>{children}</TiersContext.Provider>;
}

const FALLBACK = {
  tiers: DEFAULT_TIERS,
  usingDefaults: true,
  loading: false,
  getTier: (id) => DEFAULT_TIERS.find((t) => t.id === id),
  tiersFor: (providerType, opts) => tiersForFrom(DEFAULT_TIERS, providerType, opts),
};

export function useTiers() {
  // Lenient fallback so a stray consumer never crashes if the provider is absent.
  return useContext(TiersContext) ?? FALLBACK;
}

export default useTiers;
