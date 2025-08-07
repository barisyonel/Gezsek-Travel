const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  participants: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  tourDate: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { type: String },
  specialRequests: { type: String },
  contactInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema); 