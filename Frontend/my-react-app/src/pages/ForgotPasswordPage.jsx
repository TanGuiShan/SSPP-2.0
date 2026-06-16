// pages/ForgotPasswordPage.jsx
// Simple single-field form: user enters their email,
// backend sends a password-reset link.
//
// Props:
//   onNavigate(page)      - switches to another page
//   onPendingEmail(email) - shares the email with the confirmation screen

import FormInput from '../components/FormInput'
import useAuth, { validateEmail } from '../hooks/useAuth'
import { forgotPassword } from '../api/auth'

export default function ForgotPasswordPage({ onNavigate, onPendingEmail }) {
  const {
    email,   setEmail,
    loading, error, setError,
    withLoading,
  } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const result = await withLoading(() => forgotPassword({ email }))

    if (result) {
      onPendingEmail(email)
      onNavigate('pending')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-title">Reset password</h1>
      <p className="auth-sub">We'll send a reset link to your inbox</p>

      <FormInput
        id="forgot-email"
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />

      {error && <p className="auth-error" role="alert">{error}</p>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Send reset link'}
      </button>

      <button
        type="button"
        className="btn-link"
        onClick={() => onNavigate('login')}
      >
        ← Back to sign in
      </button>
    </form>
  )
}
