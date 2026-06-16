// AuthCard.jsx
// The white card that wraps every auth page (login, register, etc.)
// and shows the brand logo at the top.
//
// Why a separate component?
// Every auth page needs the same card shell + brand header.
// Putting it here means if you ever want to change the logo or
// card style, you change it in ONE place, not in every page file.
//
// Props:
//   children - whatever page content goes inside the card

export default function AuthCard({ children }) {
  return (
    <div className="auth-root">
      <div className="auth-card">

        {/* ── Brand header ── */}
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <span className="logo-ring" />
            <span className="logo-dot" />
          </div>
          <span className="auth-brand-name">Nucleus</span>
        </div>

        {/* ── Page-specific content goes here ── */}
        {children}

      </div>
      <p className="auth-footer">© {new Date().getFullYear()} Nucleus. All rights reserved.</p>
    </div>
  )
}
