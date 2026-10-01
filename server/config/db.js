const mongoose = require('mongoose')

async function connectDB() {
  const mongoUrl = process.env.Mongo_URL
  if (!mongoUrl || /<[^>]+>/.test(mongoUrl)) {
    throw new Error('Mongo_URL is missing or still contains placeholder values. Configure server/.env with a valid MongoDB connection string.')
  }

  await mongoose.connect(mongoUrl)
}

module.exports = connectDB