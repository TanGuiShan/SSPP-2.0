import { useRef, useState } from "react";
import { fileToResizedDataUrl } from "../../utils/image";

/**
 * Profile picture / logo uploader. Resizes the chosen image in the browser and
 * hands back a small JPEG data URL via onChange — that string is stored
 * directly in the user's Firestore profile, so no Storage bucket is required.
 *
 * props:
 *   value     current image data URL (or "" for none)
 *   onChange  (dataUrl: string) => void   ("" when removed)
 *   shape     "circle" | "square"
 *   label     button text, e.g. "Change photo"
 *   fallback  text shown when there is no image, e.g. "Photo"
 */
export default function AvatarUpload({
  value,
  onChange,
  shape = "circle",
  label = "Change photo",
  fallback = "Photo",
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const rounded = shape === "circle" ? "rounded-full" : "rounded-lg";

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the user re-pick the same file later
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, { maxSize: 256, quality: 0.8 });
      onChange?.(dataUrl);
    } catch (err) {
      setError(err.message ?? "Could not use that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0 text-center">
      <div
        className={`w-32 h-32 ${rounded} bg-[#F5F5F4] border border-[#E7E5E4] overflow-hidden flex items-center justify-center text-xs text-[#A8A29E]`}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          fallback
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-[#2563EB] mt-3 hover:underline"
      >
        {busy ? "Processing…" : label}
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="block mx-auto text-xs text-[#B91C1C] mt-1 hover:underline"
        >
          Remove
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-[#B91C1C] mt-2 max-w-[8rem]">{error}</p>}
    </div>
  );
}
