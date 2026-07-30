// services/firebase/feedback.service.js
//
// The `feedback` collection: messages sent from the Contact/Feedback page. Any
// visitor (signed in or not) can create one; only admins can read them (see the
// security rules). Whatever the user is — school, army, admin, or logged out —
// their note lands in the same inbox for an admin to triage.

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";

/**
 * Record a feedback / contact message.
 * @param {{name?:string, email?:string, category?:string, message:string, meta?:object}} input
 */
export async function submitFeedback({ name, email, category, message, meta = {} }) {
  await addDoc(collection(db, "feedback"), {
    name: (name ?? "").trim(),
    email: (email ?? "").trim(),
    category: category || "other",
    message: message.trim(),
    ...meta, // uid / role when the sender is signed in
    status: "new",
    createdAt: serverTimestamp(),
  });
}
