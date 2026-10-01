const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const cors = require('cors')
const express = require('express')
const connectDB = require('./config/db')
const registrationRoutes = require('./routes/registrationRoutes')

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))
app.use('/api/registrations', registrationRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use((error, req, res, next) => {
  console.error('Request failed:', error.message)
  res.status(500).json({ message: 'The server could not complete the request' })
})

async function startServer() {
  await connectDB()
  app.listen(port, () => console.log(`Registration API listening on port ${port}`))
}

startServer().catch(() => {
  console.error('Could not connect to MongoDB. Check the Mongo_URL configuration and database access.')
  process.exit(1)
})