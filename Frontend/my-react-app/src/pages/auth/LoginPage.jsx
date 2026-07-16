// pages/LoginPage.jsx
// Handles the sign-in form. Clean and simple — all it does is:
//  1. Collect email + password
//  2. Validate them
//  3. Call the API
//  4. On success → navigate to the app (placeholder for now)
//
// Props:
//   onNavigate(page) - called when user wants to switch pages
//                      e.g. onNavigate('register')

import FormInput  from '../components/FormInput'
import useAuth, { validateEmail } from '../hooks/useAuth'
import { loginUser } from '../api/auth'

export default function LoginPage({ onNavigate }) {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error, setError,
    withLoading,
  } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser reloading the page

    // Client-side validation first (fast, no network needed)
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    // withLoading() handles: spinner on, call API, catch errors,
    // spinner off. We just check if it returned a result.
    const result = await withLoading(() => loginUser({ email, password }))

    if (result) {
      // TODO: redirect to your main app dashboard
      // e.g. navigate('/dashboard')  with React Router
      console.log('Logged in! Token stored. Redirect here.')
    }
  }

  // The "Show/Hide" button passed into FormInput's rightLabel slot
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
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-sub">Sign in to continue</p>

      <FormInput
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <FormInput
        id="login-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        rightLabel={showToggle}
      />

      {/* Only renders when there's an error */}
      {error && <p className="auth-error" role="alert">{error}</p>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : 'Sign in'}
      </button>

      <button
        type="button"
        className="btn-link"
        onClick={() => onNavigate('forgot')}
      >
        Forgot password?
      </button>

      <div className="auth-divider"><span>New here?</span></div>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => onNavigate('register')}
      >
        Create an account
      </button>
    </form>
  )
}
