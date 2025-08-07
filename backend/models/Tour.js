const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Yaz Turları', 'Kültür Turları', 'Gemi Turları', 'Kıbrıs Turları', 'Doğa Turları', 'Günübirlik Turlar']
  },
  highlights: {
    type: String
  },
  dates: {
    type: String
  },
  maxParticipants: {
    type: Number,
    default: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema); 