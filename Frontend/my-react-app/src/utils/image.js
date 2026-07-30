// utils/image.js
// Turn a user-selected image File into a small, compressed JPEG data URL that
// can be stored directly in a Firestore document — no Storage bucket needed.
//
// The image is drawn onto a canvas, scaled so its longest side is at most
// `maxSize` px, and exported as JPEG at `quality`. A 256px JPEG is typically
// 10–40 KB, well under Firestore's 1 MB per-document limit.

export function fileToResizedDataUrl(file, { maxSize = 256, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Please choose an image file (JPG, PNG, etc.)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That image could not be loaded."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
