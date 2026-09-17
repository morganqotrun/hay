import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Hay! Private Social Journal API',
    timestamp: new Date().toISOString()
  })
})

// Basic Info & Version endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Hay! API',
    version: '1.0.0',
    description: 'Backend service for Hay! Private Social Journal App'
  })
})

// Export app for serverless / testing
export default app

// Run server only when executed directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Hay! backend running on http://localhost:${PORT}`)
  })
}
