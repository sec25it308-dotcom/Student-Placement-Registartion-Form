const Registration = require('../models/Registration')

async function createRegistration(req, res, next) {
  try {
    const registration = await Registration.create(req.body)
    res.status(201).json(registration)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A registration already exists for this student ID' })
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        message: error.name === 'ValidationError' ? 'Please check the registration details' : 'Invalid registration data',
        errors: error.errors ? Object.fromEntries(Object.entries(error.errors).map(([field, issue]) => [field, issue.message])) : undefined,
      })
    }

    return next(error)
  }
}

async function getRegistrations(req, res, next) {
  try {
    const registrations = await Registration.find().sort({ submittedAt: -1 }).lean()
    res.json(registrations)
  } catch (error) {
    next(error)
  }
}

module.exports = { createRegistration, getRegistrations }