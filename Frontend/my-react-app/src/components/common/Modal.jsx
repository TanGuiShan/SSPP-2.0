import React, { useEffect } from "react";
import { CloseIcon } from "../../assets/icons";

export default function Modal({ open, onClose, title, subtitle, children, variant = "drawer" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isDrawer = variant === "drawer";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-[#1C1917]/40 animate-[fadeIn_.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={
          isDrawer
            ? "relative h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-[slideIn_.2s_ease-out]"
            : "relative m-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8"
        }
      >
        <div className={isDrawer ? "p-8" : ""}>
          <div className="flex items-start justify-between mb-6">
            <div>
              {title && <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>}
              {subtitle && <p className="text-sm text-[#78716C] mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <CloseIcon width={22} height={22} />
            </button>
          </div>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}