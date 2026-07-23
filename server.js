import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'
import authRoutes from './Backend/routes/auth.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startServer() {
  const app = express()
  const PORT = process.env.PORT || 3000

  app.use(cors({
    origin: true,
    credentials: true
  }))

  app.use(express.json())

  // Routes
  app.use('/auth', authRoutes)

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() })
  })

  const frontendDir = path.join(__dirname, 'Frontend/my-react-app')

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: frontendDir,
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distDir = path.join(frontendDir, 'dist')
    app.use(express.static(distDir))
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
