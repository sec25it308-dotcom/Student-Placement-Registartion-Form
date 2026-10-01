const mongoose = require('mongoose')

const COMPANIES = [
  'Wipro',
  'HCLTech',
  'Accenture',
  'Infosys',
  'TCS',
  'Cognizant',
  'Capgemini',
  'IBM',
  'Deloitte',
  'Tech Mahindra',
]

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  studentId: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 40 },
  department: { type: String, required: true, trim: true, maxlength: 100 },
  year: { type: String, required: true, enum: ['1st year', '2nd year', '3rd year', '4th year'] },
  section: { type: String, required: true, trim: true, maxlength: 20 },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  phone: { type: String, required: true, match: /^[0-9]{10,15}$/ },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  fatherName: { type: String, required: true, trim: true, maxlength: 120 },
  motherName: { type: String, required: true, trim: true, maxlength: 120 },
  arrears: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isInteger, message: 'Standing arrears must be a whole number' },
  },
  companies: { type: [{ type: String, enum: COMPANIES }], default: [] },
  submittedAt: { type: Date, default: Date.now },
})

registrationSchema.pre('validate', function validateCompanies() {
  const hasFourUniqueCompanies = this.companies.length === 4
    && new Set(this.companies).size === 4

  if (this.arrears === 0 && !hasFourUniqueCompanies) {
    this.invalidate('companies', 'Eligible students must select exactly four different companies')
  } else if (this.arrears > 0 && this.companies.length > 0) {
    this.invalidate('companies', 'Students with standing arrears cannot select companies')
  }
})

module.exports = mongoose.model('Registration', registrationSchema)