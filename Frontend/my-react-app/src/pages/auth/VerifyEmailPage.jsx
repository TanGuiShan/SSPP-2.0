// pages/VerifyEmailPage.jsx
// This page runs when the user opens:
// http://localhost:5173/verify-email?token=...
// It reads the token from the URL, calls the backend, then shows success/error.

import { useEffect, useState } from 'react'
import { verifyEmail } from '../api/auth'

export default function VerifyEmailPage({ onBackToLogin }) {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    async function runVerification() {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing. Please use the link from your email.')
        return
      }

      try {
        const data = await verifyEmail(token)
        setStatus('success')
        setMessage(data.message || 'Your email has been verified successfully. You can now log in.')
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'Email verification failed. Please try again.')
      }
    }

    runVerification()
  }, [])

  return (
    <div className="auth-form auth-confirm">
      {status === 'loading' && (
        <>
          <div className="btn-spinner" aria-hidden="true" />
          <h1 className="auth-title">Verifying email</h1>
          <p className="auth-sub">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
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

          <h1 className="auth-title">Email verified</h1>
          <p className="auth-sub">{message}</p>

          <button type="button" className="btn-primary" onClick={onBackToLogin}>
            Continue to sign in
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="auth-title">Verification failed</h1>
          <p className="auth-sub">{message}</p>

          <button type="button" className="btn-primary" onClick={onBackToLogin}>
            Back to sign in
          </button>
        </>
      )}
    </div>
  )
}
