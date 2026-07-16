import React from "react";
import { Link } from "react-router-dom";

/**
 * Shell for the long scrolling signup forms. Unlike AuthLayout (which is a
 * narrow centred card for login), this is a wide scrolling page since the
 * role forms have 8+ fields grouped into sections.
 */
export default function SignupLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[#E7E5E4] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <span className="text-lg font-semibold tracking-tight">SSPP</span>
          <Link to="/register" className="text-sm text-[#44403C] underline">
            ← Change account type
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-[#78716C] mt-2">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
