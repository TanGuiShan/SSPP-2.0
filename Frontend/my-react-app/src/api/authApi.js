// api/auth.js
// All HTTP calls to the Express backend live here.

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }

  return data
}

export async function registerUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return handleResponse(res)
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await handleResponse(res)

  if (data.token) {
    localStorage.setItem('token', data.token)
  }

  return data
}

export async function forgotPassword({ email }) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  return handleResponse(res)
}

export async function verifyEmail(token) {
  const res = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`)
  return handleResponse(res)
}

export function logoutUser() {
  localStorage.removeItem('token')
}

export function getToken() {
  return localStorage.getItem('token')
}
