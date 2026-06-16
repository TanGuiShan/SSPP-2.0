// routes/auth.js
// Each function here handles one HTTP endpoint.
// The pattern is always the same:
//   1. Validate the input
//   2. Check the database
//   3. Do the work (hash, insert, send email...)
//   4. Return a response
import nodemailer from 'nodemailer'
import express  from 'express'
import bcrypt   from 'bcrypt'
import jwt      from 'jsonwebtoken'
import crypto   from 'crypto'       // built into Node, no install needed
import { sql, pool, poolConnect } from '../db.js'
import authGuard from '../middleware/authGuard.js'

const router = express.Router()

// ── Helper: generate a secure random token ───────────────────
// Used for email verification and password reset links
function generateToken() {
  return crypto.randomBytes(48).toString('hex')
}

// ── Helper: send emails ──────────────────────────────────────
// We'll flesh this out when we configure nodemailer
async function sendEmail({ to, subject, html }) {
  // TODO: implement with nodemailer
  // For now, log to console so you can test without email
  console.log(`📧 Email to: ${to}`)
  console.log(`   Subject:  ${subject}`)
  console.log(`   Body:     ${html}`)

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}

// ────────────────────────────────────────────────────────────
// POST /auth/register
// Creates a new user account + sends verification email
// ────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password } = req.body

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  }

  try {
    await poolConnect // make sure DB is connected

    // 2. Check if email is already registered
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM users WHERE email = @email')

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // 3. Hash the password (never store plain text)
    // 12 = "salt rounds" — higher = more secure but slower
    const password_hash = await bcrypt.hash(password, 12)

    // 4. Insert the new user
    const result = await pool.request()
      .input('email',         sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, password_hash)
      .query(`
        INSERT INTO users (email, password_hash)
        OUTPUT INSERTED.id
        VALUES (@email, @password_hash)
      `)

    const userId = result.recordset[0].id

    // 5. Create a verification token (expires in 24 hours)
    const token     = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await pool.request()
      .input('user_id',    sql.Int,      userId)
      .input('token',      sql.NVarChar, token)
      .input('type',       sql.NVarChar, 'verify')
      .input('expires_at', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO email_tokens (user_id, token, type, expires_at)
        VALUES (@user_id, @token, @type, @expires_at)
      `)

    // 6. Send verification email
    await sendEmail({
      to:      email,
      subject: 'Verify your Nucleus account',
      html:    `
        <p>Welcome! Click the link below to verify your email:</p>
        <a href="http://localhost:5173/verify-email?token=${token}">
          Verify my email
        </a>
        <p>This link expires in 24 hours.</p>
      `
    })

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.'
    })

  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

// ────────────────────────────────────────────────────────────
// GET /auth/verify-email?token=xxx
// Called when user clicks the link in their email
// ────────────────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({ message: 'Token is missing.' })
  }

  try {
    await poolConnect

    // 1. Find the token in the database
    const result = await pool.request()
      .input('token', sql.NVarChar, token)
      .query(`
        SELECT * FROM email_tokens
        WHERE token = @token AND type = 'verify'
      `)

    const record = result.recordset[0]

    // 2. Check it exists and hasn't expired
    if (!record) {
      return res.status(400).json({ message: 'Invalid or already used token.' })
    }
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: 'This link has expired. Please register again.' })
    }

    // 3. Mark the user as verified
    await pool.request()
      .input('user_id', sql.Int, record.user_id)
      .query('UPDATE users SET is_verified = 1 WHERE id = @user_id')

    // 4. Delete the used token (one-time use)
    await pool.request()
      .input('token', sql.NVarChar, token)
      .query('DELETE FROM email_tokens WHERE token = @token')

    res.json({ message: 'Email verified successfully. You can now log in.' })

  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

// ────────────────────────────────────────────────────────────
// POST /auth/login
// Checks credentials, returns a JWT token on success
// ────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    await poolConnect

    // 1. Find the user
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email')

    const user = result.recordset[0]

    // 2. User not found — use a vague message on purpose
    //    (don't tell attackers whether the email exists)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // 3. Check email is verified
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' })
    }

    // 4. Compare the password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // 5. Issue a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, // payload — stored inside the token
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // 6. Save session to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await pool.request()
      .input('user_id',    sql.Int,      user.id)
      .input('token',      sql.NVarChar, token)
      .input('expires_at', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES (@user_id, @token, @expires_at)
      `)

    res.json({
      message: 'Logged in successfully.',
      token,  // frontend stores this and sends it with future requests
      user: { id: user.id, email: user.email }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

// ────────────────────────────────────────────────────────────
// POST /auth/forgot-password
// Sends a password reset link to the email
// ────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body

  try {
    await poolConnect

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM users WHERE email = @email')

    // Always return the same message whether the email exists or not.
    // This prevents attackers from discovering which emails are registered.
    if (result.recordset.length === 0) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    const userId = result.recordset[0].id
    const token     = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing reset tokens for this user first
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`DELETE FROM email_tokens WHERE user_id = @user_id AND type = 'reset'`)

    await pool.request()
      .input('user_id',    sql.Int,      userId)
      .input('token',      sql.NVarChar, token)
      .input('type',       sql.NVarChar, 'reset')
      .input('expires_at', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO email_tokens (user_id, token, type, expires_at)
        VALUES (@user_id, @token, @type, @expires_at)
      `)

    await sendEmail({
      to:      email,
      subject: 'Reset your Nucleus password',
      html:    `
        <p>Click the link below to reset your password:</p>
        <a href="http://localhost:5173/reset-password?token=${token}">
          Reset my password
        </a>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `
    })

    res.json({ message: 'If that email exists, a reset link has been sent.' })

  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

// ────────────────────────────────────────────────────────────
// POST /auth/logout
// Protected route — requires a valid token
// ────────────────────────────────────────────────────────────
router.post('/logout', authGuard, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  try {
    await poolConnect

    await pool.request()
      .input('token', sql.NVarChar, token)
      .query('DELETE FROM sessions WHERE token = @token')

    res.json({ message: 'Logged out successfully.' })

  } catch (err) {
    console.error('Logout error:', err)
    res.status(500).json({ message: 'Server error.' })
  }
})

export default router