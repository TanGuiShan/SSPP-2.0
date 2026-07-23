
export default function TopHeader({ title, onMenuClick }) {
  return (
    <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[#1C1917] text-white">
      <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title || "SSPP"}</span>
      <button onClick={onMenuClick} aria-label="Menu" className="text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}