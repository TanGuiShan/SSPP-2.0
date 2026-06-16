// hooks/useAuth.js
// A "custom hook" bundles reusable stateful logic into one place.
//
// What's a hook?
// In React, hooks are functions that start with "use" and can hold
// state and side-effects. Built-in ones: useState, useEffect.
// Custom hooks let YOU create your own with the same power.
//
// Why useAuth?
// LoginPage and RegisterPage both need: loading state, error state,
// show/hide password toggle, and email validation. Instead of
// copy-pasting that logic into both pages, we write it once here.
// Each page calls useAuth() and gets everything it needs.

import { useState } from 'react'

// ── Email validation ───────────────────────────────────────────────
// Two checks:
//  1. Basic format  (must have @, a dot in the domain, no spaces)
//  2. Blocklist     (reject known disposable/throwaway domains)
// The backend will do a deeper check (MX record lookup, etc.)
// This is just the fast first line of defence in the browser.
const BLOCKED_DOMAINS = [
  'mailinator.com',
  'trashmail.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwam.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
]

export function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false
  const domain = email.split('@')[1]?.toLowerCase()
  return !BLOCKED_DOMAINS.includes(domain)
}

// ── The hook itself ────────────────────────────────────────────────
export default function useAuth() {
  // Shared state that any auth page might need
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  // Clears error + password fields when switching between pages.
  // Email is kept so the user doesn't have to retype it.
  function resetForm() {
    setError('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }

  // Wraps an async API call with loading + error handling.
  // Pages call this instead of managing loading/error themselves.
  //
  // Usage:
  //   const result = await withLoading(() => loginUser({ email, password }))
  //   if (result) { /* success */ }
  async function withLoading(asyncFn) {
    setError('')
    setLoading(true)
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      // err.message comes from the api/auth.js throw
      setError(err.message || 'Something went wrong. Please try again.')
      return null
    } finally {
      // Always turn off the spinner, even if it threw
      setLoading(false)
    }
  }

  // Expose everything pages need
  return {
    email,           setEmail,
    password,        setPassword,
    confirmPassword, setConfirmPassword,
    showPassword,    setShowPassword,
    loading,
    error,           setError,
    resetForm,
    withLoading,
  }
}
