const express = require('express')
const { createRegistration, getRegistrations } = require('../controllers/registrationController')

const router = express.Router()

router.route('/').get(getRegistrations).post(createRegistration)

module.exports = router