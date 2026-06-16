// server.js
// This is the first file Node runs. It:
//   1. Loads all middleware (cors, json parsing)
//   2. Mounts the route files
//   3. Starts listening for requests on PORT

import express  from 'express'
import cors     from 'cors'
import dotenv   from 'dotenv'
import authRoutes from './routes/auth.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ───────────────────────────────────────────────
// cors() allows your React app (port 5173) to call this server
// (port 4000) — browsers block this by default for security.
app.use(cors({
  origin: 'http://localhost:5173', // your Vite dev server
  credentials: true
}))

// express.json() parses incoming request bodies as JSON
// Without this, req.body would always be undefined
app.use(express.json())

// ── Routes ───────────────────────────────────────────────────
// All auth endpoints live under /auth
// e.g. POST /auth/register, POST /auth/login
app.use('/auth', authRoutes)

// ── Health check ─────────────────────────────────────────────
// Hit http://localhost:4000/health in your browser to confirm
// the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})