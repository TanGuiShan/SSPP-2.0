import { useState } from 'react'
import './App.css'

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
  VERIFY_EMAIL: 'verify_email',
  VERIFY_PENDING: 'verify_pending',
}

function validateEmail(email) {
  // Basic format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false
  // Block obvious disposable/suspicious domains
  const blocked = ['mailinator.com', 'trashmail.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com', 'yopmail.com']
  const domain = email.split('@')[1]?.toLowerCase()
  return !blocked.includes(domain)
}

export default function App() {
  const [view, setView] = useState(VIEWS.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const reset = (nextView) => {
    setError('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setView(nextView)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }
    setLoading(true)
    // Simulated auth call
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setError('No account found. Please register or check your credentials.')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
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
    setLoading(true)
    // Simulate backend email validation + account creation
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setPendingEmail(email)
    setView(VIEWS.VERIFY_PENDING)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setPendingEmail(email)
    setView(VIEWS.VERIFY_PENDING)
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <span className="logo-ring" />
            <span className="logo-dot" />
          </div>
          <span className="auth-brand-name">Nucleus</span>
        </div>

        {view === VIEWS.LOGIN && (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to continue</p>
            <div className="field-group">
              <label htmlFor="login-email" className="field-label">Email</label>
              <input
                id="login-email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="login-password" className="field-label">
                Password
                <button type="button" className="show-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign in'}
            </button>
            <button type="button" className="btn-link" onClick={() => { setError(''); reset(VIEWS.FORGOT) }}>
              Forgot password?
            </button>
            <div className="auth-divider"><span>New here?</span></div>
            <button type="button" className="btn-secondary" onClick={() => reset(VIEWS.REGISTER)}>
              Create an account
            </button>
          </form>
        )}

        {view === VIEWS.REGISTER && (
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">Get started — it's free</p>
            <div className="field-group">
              <label htmlFor="reg-email" className="field-label">Email</label>
              <input
                id="reg-email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="reg-password" className="field-label">
                Password
                <button type="button" className="show-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="reg-confirm" className="field-label">Confirm password</label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            {password && (
              <PasswordStrength password={password} />
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create account'}
            </button>
            <button type="button" className="btn-link" onClick={() => reset(VIEWS.LOGIN)}>
              ← Back to sign in
            </button>
          </form>
        )}

        {view === VIEWS.FORGOT && (
          <form className="auth-form" onSubmit={handleForgot} noValidate>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-sub">We'll send a reset link to your inbox</p>
            <div className="field-group">
              <label htmlFor="forgot-email" className="field-label">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Send reset link'}
            </button>
            <button type="button" className="btn-link" onClick={() => reset(VIEWS.LOGIN)}>
              ← Back to sign in
            </button>
          </form>
        )}

        {view === VIEWS.VERIFY_PENDING && (
          <div className="auth-form auth-confirm">
            <div className="confirm-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" className="confirm-icon-bg" />
                <path d="M10 20.5L17 27.5L30 13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="confirm-icon-check" />
              </svg>
            </div>
            <h1 className="auth-title">Check your inbox</h1>
            <p className="auth-sub">
              We sent a link to <strong>{pendingEmail}</strong>.<br />
              Click it to verify your address and continue.
            </p>
            <p className="auth-hint">Didn't get it? Check spam or</p>
            <button type="button" className="btn-link" onClick={() => reset(VIEWS.LOGIN)}>
              Return to sign in
            </button>
          </div>
        )}
      </div>
      <p className="auth-footer">© {new Date().getFullYear()} Nucleus. All rights reserved.</p>
    </div>
  )
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const cls = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong']

  return (
    <div className="strength-bar-wrap" aria-label={`Password strength: ${labels[score]}`}>
      <div className="strength-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`strength-seg ${i <= score ? cls[score] : ''}`} />
        ))}
      </div>
      {score > 0 && <span className={`strength-label ${cls[score]}`}>{labels[score]}</span>}
    </div>
  )
}
