// pages/RegisterPage.jsx
// Handles new user sign-up:
//  1. Collect email, password, confirm password
//  2. Validate (format, strength, match)
//  3. Call the API → backend creates Neo4j node + sends verify email
//  4. On success → show the "check your inbox" screen
//
// Props:
//   onNavigate(page)          - switches to another page
//   onPendingEmail(email)     - tells App.jsx which email to display
//                               on the confirmation screen

import FormInput        from '../components/FormInput'
import PasswordStrength from '../components/PasswordStrength'
import useAuth, { validateEmail } from '../hooks/useAuth'
import { registerUser } from '../api/auth'

export default function RegisterPage({ onNavigate, onPendingEmail }) {
  const {
    email,           setEmail,
    password,        setPassword,
    confirmPassword, setConfirmPassword,
    showPassword,    setShowPassword,
    loading, error,  setError,
    withLoading,
  } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()

    // ── Validate before hitting the network ──────────────────────
    if (!validateEmail(email)) {
      setError('This email address looks invalid or is not accepted.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const result = await withLoading(() => registerUser({ email, password }))

    if (result) {
      // Pass the email up so the confirmation screen can show it,
      // then navigate to the pending screen
      onPendingEmail(email)
      onNavigate('pending')
    }
  }

  const showToggle = (
    <button
      type="button"
      className="show-toggle"
      onClick={() => setShowPassword(v => !v)}
    >
      {showPassword ? 'Hide' : 'Show'}
    </button>
  )

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-title">Create account</h1>
      <p className="auth-sub">Get started — it's free</p>

      <FormInput
        id="reg-email"
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <FormInput
        id="reg-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        rightLabel={showToggle}
      />

      {/* Live strength bar — only appears once user starts typing */}
      {password && <PasswordStrength password={password} />}

      <FormInput
        id="reg-confirm"
        label="Confirm password"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Re-enter password"
        autoComplete="new-password"
      />

      {error && <p className="auth-error" role="alert">{error}</p>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Create account'}
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
