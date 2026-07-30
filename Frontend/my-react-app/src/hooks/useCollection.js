// hooks/useCollection.js
// Live array of documents from a Firestore collection, as { id, ...data }.
// Updates in real time and returns [] until the first snapshot arrives (or if
// the read is denied). Used to replace the old static data/*.js catalogs.

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase/client";

export function useCollection(name) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.warn(`Firestore "${name}" subscription error:`, err)
    );
    return () => unsub();
  }, [name]);

  return docs;
}

/** Live array of docs matching a single equality filter, e.g. role == "school". */
export function useCollectionWhere(name, field, op, value) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, name), where(field, op, value));
    const unsub = onSnapshot(
      q,
      (snap) => setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.warn(`Firestore "${name}" query error:`, err)
    );
    return () => unsub();
  }, [name, field, op, value]);

  return docs;
}

export default useCollection;
