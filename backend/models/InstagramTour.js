const mongoose = require('mongoose');

const instagramTourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  shortDescription: {
    type: String,
    maxlength: 200,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  instagramUrl: {
    type: String,
    required: true
  },
  hashtags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  suggestedHashtags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Yaz Turlari', 'Kultur Turlari', 'Gemi Turlari', 'Kibris Turlari', 'Gunubirlik Turlar', 'Doga Turlari', 'Instagram Ozel'],
    default: 'Instagram Ozel'
  },
  location: {
    type: String,
    trim: true
  },
  price: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  engagement: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  postDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    caption: String,
    altText: String,
    colorScheme: String,
    mood: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for engagement rate
instagramTourSchema.virtual('engagementRate').get(function() {
  if (this.views === 0) return 0;
  return ((this.likes + this.comments + this.shares) / this.views * 100).toFixed(2);
});

// Index for better performance
instagramTourSchema.index({ isActive: 1, order: 1 });
instagramTourSchema.index({ category: 1 });
instagramTourSchema.index({ hashtags: 1 });

module.exports = mongoose.model('InstagramTour', instagramTourSchema); 