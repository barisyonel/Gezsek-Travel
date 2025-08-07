const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();

// Tüm blog yazılarını getir (filtreleme ve sayfalama ile)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      featured,
      admin = false
    } = req.query;

    const filter = admin === 'true' ? {} : { isPublished: true };
    
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Tekil blog yazısı getir
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Yazı bulunamadı.' });
    }

    // Görüntülenme sayısını artır
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// (Admin için) Yeni blog yazısı ekle
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      content, 
      excerpt,
      author, 
      img, 
      images,
      category,
      tags,
      featured
    } = req.body;
    
    const blog = await Blog.create({ 
      title, 
      content, 
      excerpt,
      author, 
      img, 
      images,
      category,
      tags,
      featured: featured || false
    });
    
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Admin için tüm blog yazılarını getir
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// (Admin için) Blog yazısını güncelle
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Yazı bulunamadı.' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// (Admin için) Blog yazısını sil
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Yazı bulunamadı.' });
    }
    
    res.json({ message: 'Yazı başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 