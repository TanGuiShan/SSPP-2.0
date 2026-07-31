// utils/formationImages.js
// Optional convenience: resolve a Firestore formation doc's `imageKey` (e.g.
// "armoured") to one of the images bundled in assets/images/*.avif, so your
// Firestore data can reuse the built-in unit pictures without hosting them.
// A doc may instead provide a full `image` URL, which takes precedence.

const images = import.meta.glob("../assets/images/*.avif", {
  eager: true,
  query: "?url",
  import: "default",
});

export function formationImage(key) {
  if (!key) return "";
  return images[`../assets/images/${key}.avif`] ?? "";
}
