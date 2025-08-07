const express = require('express');
const router = express.Router();
const InstagramTour = require('../models/InstagramTour');
const auth = require('../middleware/auth');

// Get all Instagram tours (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    const tours = await InstagramTour.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await InstagramTour.countDocuments(query);

    res.json({
      tours,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured Instagram tours
router.get('/featured', async (req, res) => {
  try {
    const tours = await InstagramTour.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .limit(6);

    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Instagram tour by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const tour = await InstagramTour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Instagram tour not found' });
    }

    // Increment views
    tour.views += 1;
    await tour.save();

    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes - require authentication
router.use(auth);

// Get all Instagram tours (admin)
router.get('/admin/all', async (req, res) => {
  try {
    const tours = await InstagramTour.find().sort({ order: 1, createdAt: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new Instagram tour (admin)
router.post('/admin', async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      image,
      instagramUrl,
      hashtags,
      suggestedHashtags,
      category,
      location,
      price,
      duration,
      isActive,
      isFeatured,
      order,
      scheduledDate,
      tags,
      metadata
    } = req.body;

    // Validate required fields
    if (!title || !description || !image || !instagramUrl) {
      return res.status(400).json({ message: 'Title, description, image and Instagram URL are required' });
    }

    const tour = new InstagramTour({
      title,
      description,
      shortDescription: shortDescription || '',
      image,
      instagramUrl,
      hashtags: hashtags || [],
      suggestedHashtags: suggestedHashtags || [],
      category: category || 'Instagram Ozel',
      location: location || '',
      price: price || '',
      duration: duration || '',
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      order: order || 0,
      scheduledDate: scheduledDate || null,
      tags: tags || [],
      metadata: metadata || {}
    });

    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Instagram tour (admin)
router.put('/admin/:id', async (req, res) => {
  try {
    const tour = await InstagramTour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Instagram tour not found' });
    }

    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      tour[key] = updateFields[key];
    });

    await tour.save();
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Instagram tour (admin)
router.delete('/admin/:id', async (req, res) => {
  try {
    const tour = await InstagramTour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Instagram tour not found' });
    }

    await tour.remove();
    res.json({ message: 'Instagram tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Instagram tour stats (admin)
router.patch('/admin/:id/stats', async (req, res) => {
  try {
    const { likes, views, comments, shares } = req.body;
    const tour = await InstagramTour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Instagram tour not found' });
    }

    if (likes !== undefined) tour.likes = likes;
    if (views !== undefined) tour.views = views;
    if (comments !== undefined) tour.comments = comments;
    if (shares !== undefined) tour.shares = shares;

    // Calculate engagement
    tour.engagement = tour.likes + tour.comments + tour.shares;

    await tour.save();
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reorder Instagram tours (admin)
router.post('/admin/reorder', async (req, res) => {
  try {
    const { tourIds } = req.body;
    
    if (!Array.isArray(tourIds)) {
      return res.status(400).json({ message: 'Tour IDs array is required' });
    }

    for (let i = 0; i < tourIds.length; i++) {
      await InstagramTour.findByIdAndUpdate(tourIds[i], { order: i + 1 });
    }

    res.json({ message: 'Instagram tours reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Instagram tour analytics (admin)
router.get('/admin/analytics', async (req, res) => {
  try {
    const totalTours = await InstagramTour.countDocuments();
    const activeTours = await InstagramTour.countDocuments({ isActive: true });
    const featuredTours = await InstagramTour.countDocuments({ isFeatured: true });
    
    const totalLikes = await InstagramTour.aggregate([
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    
    const totalViews = await InstagramTour.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const topTours = await InstagramTour.find({ isActive: true })
      .sort({ engagement: -1 })
      .limit(5)
      .select('title engagement likes views');

    res.json({
      totalTours,
      activeTours,
      featuredTours,
      totalLikes: totalLikes[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      topTours
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 