// services/firebase/inventory.service.js
//
// The `inventory` collection: admin-managed incentive stock. One doc per item,
// keyed by the item id (inv-001, …). Only admins can read or write it — the
// security rules enforce that (`match /inventory/{id} { allow read, write: if isAdmin() }`).
//
// `total` is the procured batch. reserved / gaveOut / available are DERIVED at
// runtime (see data/inventory.js), never stored — restocking just raises total.

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./client";
import { inventoryBase } from "../../data/inventory";

const INVENTORY = "inventory";

/**
 * Upload the inventory list from data/inventory.js into Firestore, one doc per
 * item at inventory/{id} with { name, category, total }.
 *
 * Idempotent by design: items that already exist are SKIPPED, so re-running
 * never clobbers a total that's since been restocked. Returns how many new
 * items were written.
 */
export async function seedInventory(items = inventoryBase) {
  const snap = await getDocs(collection(db, INVENTORY));
  const existing = new Set(snap.docs.map((d) => d.id));
  const missing = items.filter((it) => !existing.has(it.id));
  if (missing.length === 0) return { added: 0, skipped: items.length };

  const batch = writeBatch(db);
  for (const it of missing) {
    batch.set(doc(db, INVENTORY, it.id), {
      name: it.name,
      category: it.category,
      total: it.total,
    });
  }
  await batch.commit();
  return { added: missing.length, skipped: items.length - missing.length };
}

/** Restock: raise an item's procured total by `addQty`. Available recomputes. */
export async function restockItem(id, addQty) {
  const qty = Math.max(0, Number(addQty) || 0);
  if (qty === 0) return;
  await updateDoc(doc(db, INVENTORY, id), { total: increment(qty) });
}
