const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author: { type: String, default: 'Gezsek Travel' },
  img: { type: String },
  images: [{ type: String }],
  category: { type: String },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  readTime: { type: Number }, // dakika cinsinden
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema); 