const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  birthDate: { type: Date },
  gender: { type: String },
  verified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  verificationCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 