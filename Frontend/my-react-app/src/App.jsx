// App.jsx
// This file decides which auth page to show.

import { useState } from 'react'
import AuthCard from './components/AuthCard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import './App.css'

const PAGES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
  PENDING: 'pending',
  SUCCESS: 'success',
}

export default function App() {
  const [page, setPage] = useState(PAGES.LOGIN)
  const [pendingEmail, setPendingEmail] = useState('')

  function goToLogin() {
    window.history.replaceState(null, '', '/')
    setPage(PAGES.LOGIN)
  }

  // Backend verification emails point to:
  // http://localhost:5173/verify-email?token=...
  // This handles that path without needing React Router.
  if (window.location.pathname === '/verify-email') {
    return (
      <AuthCard>
        <VerifyEmailPage onBackToLogin={goToLogin} />
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      {page === PAGES.LOGIN && (
        <LoginPage onNavigate={setPage} />
      )}

      {page === PAGES.REGISTER && (
        <RegisterPage
          onNavigate={setPage}
          onPendingEmail={setPendingEmail}
        />
      )}

      {page === PAGES.FORGOT && (
        <ForgotPasswordPage
          onNavigate={setPage}
          onPendingEmail={setPendingEmail}
        />
      )}

      {page === PAGES.PENDING && (
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
          <h1 className="auth-title">Check your inbox</h1>
          <p className="auth-sub">
            We sent a link to <strong>{pendingEmail}</strong>.<br />
            Click it to verify your address and continue.
          </p>
          <p className="auth-hint">Didn't get it? Check spam or</p>
          <button
            type="button"
            className="btn-link"
            onClick={() => setPage(PAGES.LOGIN)}
          >
            Return to sign in
          </button>
        </div>
      )}

      {page === PAGES.SUCCESS && (
        <LoginSuccessPage onLogout={goToLogin} />
      )}

    </AuthCard>
  )
}
