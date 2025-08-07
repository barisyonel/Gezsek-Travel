const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tour: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tour', 
    required: true 
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  images: [{ 
    type: String 
  }],
  // Detaylı değerlendirme kriterleri
  criteria: {
    guide: { type: Number, min: 1, max: 5 },
    transportation: { type: Number, min: 1, max: 5 },
    accommodation: { type: Number, min: 1, max: 5 },
    food: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  // Etiketler
  tags: [{
    type: String,
    enum: ['Harika Rehber', 'Mükemmel Organizasyon', 'Güzel Manzara', 'Lezzetli Yemek', 'Rahat Ulaşım', 'Temiz Konaklama', 'İyi Fiyat', 'Eğlenceli', 'Eğitici', 'Romantik', 'Aile Dostu', 'Macera']
  }],
  helpful: { 
    type: Number, 
    default: 0 
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isApproved: { 
    type: Boolean, 
    default: true 
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  // Admin yanıtı
  adminReply: {
    content: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  }
}, { timestamps: true });

// Aynı kullanıcının aynı rezervasyon için birden fazla yorum yapmasını engelle
reviewSchema.index({ reservation: 1 }, { unique: true });

// Ortalama rating hesaplama
reviewSchema.statics.calculateAverageRating = async function(tourId) {
  const result = await this.aggregate([
    { $match: { tour: tourId, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? { average: result[0].avgRating, count: result[0].count } : { average: 0, count: 0 };
};

// Kriter ortalamalarını hesapla
reviewSchema.statics.calculateCriteriaAverages = async function(tourId) {
  const result = await this.aggregate([
    { $match: { tour: tourId, isApproved: true } },
    { $group: {
      _id: null,
      guide: { $avg: '$criteria.guide' },
      transportation: { $avg: '$criteria.transportation' },
      accommodation: { $avg: '$criteria.accommodation' },
      food: { $avg: '$criteria.food' },
      value: { $avg: '$criteria.value' }
    }}
  ]);
  
  return result.length > 0 ? result[0] : {
    guide: 0, transportation: 0, accommodation: 0, food: 0, value: 0
  };
};

module.exports = mongoose.model('Review', reviewSchema); 