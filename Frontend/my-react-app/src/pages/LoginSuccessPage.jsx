// pages/LoginSuccessPage.jsx
// Simple page shown after a verified user logs in successfully.

import { logoutUser } from '../api/auth'

export default function LoginSuccessPage({ onLogout }) {
  function handleLogout() {
    logoutUser()
    onLogout()
  }

  return (
    <div className="auth-form auth-confirm">
      <div className="confirm-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="20" className="confirm-icon-bg" />
          <path
            d="M11 21L17 27L29 13"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="confirm-icon-check"
          />
        </svg>
      </div>

      <h1 className="auth-title">Login successful</h1>
      <p className="auth-sub">
        Your account is verified and you are now logged in.
      </p>

      <button
        type="button"
        className="btn-primary"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  )
}
