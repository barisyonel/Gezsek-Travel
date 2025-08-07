const express = require('express');
const router = express.Router();
const Search = require('../models/Search');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Purchase = require('../models/Purchase');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const InstagramTour = require('../models/InstagramTour');
const auth = require('../middleware/auth');

// Get all saved searches (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      status,
      search,
      createdBy
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const searches = await Search.find(query)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email')
      .sort({ 'analytics.lastUsed': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Search.countDocuments(query);

    res.json({
      searches,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get searches error:', error);
    res.status(500).json({ message: 'Aramalar alınırken hata oluştu' });
  }
});

// Get search by ID (admin)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const search = await Search.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email');

    if (!search) {
      return res.status(404).json({ message: 'Arama bulunamadı' });
    }

    res.json(search);
  } catch (error) {
    console.error('Get search error:', error);
    res.status(500).json({ message: 'Arama alınırken hata oluştu' });
  }
});

// Create search (admin)
router.post('/admin', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      category,
      query,
      settings,
      permissions,
      tags
    } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({ 
        message: 'İsim ve tür alanları zorunludur' 
      });
    }

    const searchData = {
      name,
      description,
      type,
      category: category || 'basic',
      query: query || {},
      settings: settings || {},
      createdBy: req.user._id,
      permissions: permissions || {},
      tags: tags || []
    };

    const search = new Search(searchData);
    await search.save();

    const populatedSearch = await Search.findById(search._id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email');

    res.status(201).json(populatedSearch);
  } catch (error) {
    console.error('Create search error:', error);
    res.status(500).json({ message: 'Arama oluşturulurken hata oluştu' });
  }
});

// Update search (admin)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const search = await Search.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('permissions.viewAccess', 'name email')
    .populate('permissions.editAccess', 'name email');

    if (!search) {
      return res.status(404).json({ message: 'Arama bulunamadı' });
    }

    res.json(search);
  } catch (error) {
    console.error('Update search error:', error);
    res.status(500).json({ message: 'Arama güncellenirken hata oluştu' });
  }
});

// Delete search (admin)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const search = await Search.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!search) {
      return res.status(404).json({ message: 'Arama bulunamadı' });
    }

    res.json({ message: 'Arama silindi' });
  } catch (error) {
    console.error('Delete search error:', error);
    res.status(500).json({ message: 'Arama silinirken hata oluştu' });
  }
});

// Execute search (admin)
router.post('/admin/:id/execute', auth, async (req, res) => {
  try {
    const search = await Search.findById(req.params.id);
    if (!search) {
      return res.status(404).json({ message: 'Arama bulunamadı' });
    }

    const startTime = Date.now();
    const results = await executeSearch(search);
    const executionTime = Date.now() - startTime;

    // Update search analytics
    search.analytics.usageCount += 1;
    search.analytics.lastUsed = new Date();
    search.analytics.averageExecutionTime = 
      (search.analytics.averageExecutionTime * (search.analytics.usageCount - 1) + executionTime) / search.analytics.usageCount;
    
    search.results = {
      totalCount: results.total,
      lastExecuted: new Date(),
      executionTime
    };

    await search.save();

    res.json({
      results: results.data,
      total: results.total,
      executionTime,
      search: search
    });
  } catch (error) {
    console.error('Execute search error:', error);
    res.status(500).json({ message: 'Arama yapılırken hata oluştu' });
  }
});

// Quick search (admin)
router.post('/admin/quick', auth, async (req, res) => {
  try {
    const { type, searchTerm, filters, sortBy, pagination } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Arama türü gereklidir' });
    }

    const startTime = Date.now();
    const results = await executeQuickSearch(type, searchTerm, filters, sortBy, pagination);
    const executionTime = Date.now() - startTime;

    res.json({
      results: results.data,
      total: results.total,
      executionTime
    });
  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ message: 'Hızlı arama yapılırken hata oluştu' });
  }
});

// Get search suggestions (admin)
router.get('/admin/suggestions/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { term } = req.query;

    let suggestions = [];

    switch (type) {
      case 'tour':
        suggestions = await Tour.find({
          title: { $regex: term, $options: 'i' }
        })
        .select('title category location')
        .limit(10);
        break;
      case 'user':
        suggestions = await User.find({
          name: { $regex: term, $options: 'i' }
        })
        .select('name email role')
        .limit(10);
        break;
      case 'blog':
        suggestions = await Blog.find({
          title: { $regex: term, $options: 'i' }
        })
        .select('title category tags')
        .limit(10);
        break;
      default:
        suggestions = [];
    }

    res.json(suggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Öneriler alınırken hata oluştu' });
  }
});

// Get search analytics (admin)
router.get('/admin/analytics/overview', auth, async (req, res) => {
  try {
    const totalSearches = await Search.countDocuments({ isDeleted: false });
    const activeSearches = await Search.countDocuments({
      status: 'active',
      isDeleted: false
    });
    const popularSearches = await Search.countDocuments({
      'analytics.usageCount': { $gt: 50 },
      isDeleted: false
    });
    const recentSearches = await Search.countDocuments({
      'analytics.lastUsed': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isDeleted: false
    });

    // Type distribution
    const typeStats = await Search.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Search.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Most used searches
    const mostUsedSearches = await Search.find({ isDeleted: false })
      .populate('createdBy', 'name email')
      .sort({ 'analytics.usageCount': -1 })
      .limit(5);

    res.json({
      totalSearches,
      activeSearches,
      popularSearches,
      recentSearches,
      typeStats,
      categoryStats,
      mostUsedSearches
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({ message: 'Analitik veriler alınırken hata oluştu' });
  }
});

// Get search types (admin)
router.get('/admin/types', auth, async (req, res) => {
  try {
    const types = [
      { value: 'tour', label: 'Turlar', icon: '🗺️' },
      { value: 'user', label: 'Kullanıcılar', icon: '👥' },
      { value: 'blog', label: 'Blog', icon: '📝' },
      { value: 'purchase', label: 'Satın Almalar', icon: '💰' },
      { value: 'message', label: 'Mesajlar', icon: '💬' },
      { value: 'notification', label: 'Bildirimler', icon: '🔔' },
      { value: 'instagram', label: 'Instagram', icon: '📸' },
      { value: 'custom', label: 'Özel', icon: '⚙️' }
    ];

    res.json(types);
  } catch (error) {
    console.error('Get search types error:', error);
    res.status(500).json({ message: 'Arama türleri alınırken hata oluştu' });
  }
});

// Get search categories (admin)
router.get('/admin/categories', auth, async (req, res) => {
  try {
    const categories = [
      { value: 'basic', label: 'Temel', icon: '🔍' },
      { value: 'advanced', label: 'Gelişmiş', icon: '⚡' },
      { value: 'saved', label: 'Kaydedilmiş', icon: '💾' },
      { value: 'quick', label: 'Hızlı', icon: '⚡' },
      { value: 'analytics', label: 'Analitik', icon: '📊' }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get search categories error:', error);
    res.status(500).json({ message: 'Arama kategorileri alınırken hata oluştu' });
  }
});

// Helper function to execute search
async function executeSearch(search) {
  const { type, query } = search;
  const { searchTerm, filters, sortBy, pagination } = query;

  let Model;
  let pipeline = [];

  switch (type) {
    case 'tour':
      Model = Tour;
      pipeline = buildTourPipeline(searchTerm, filters?.tourFilters, sortBy, pagination);
      break;
    case 'user':
      Model = User;
      pipeline = buildUserPipeline(searchTerm, filters?.userFilters, sortBy, pagination);
      break;
    case 'blog':
      Model = Blog;
      pipeline = buildBlogPipeline(searchTerm, filters?.blogFilters, sortBy, pagination);
      break;
    case 'purchase':
      Model = Purchase;
      pipeline = buildPurchasePipeline(searchTerm, filters?.purchaseFilters, sortBy, pagination);
      break;
    case 'message':
      Model = Message;
      pipeline = buildMessagePipeline(searchTerm, filters?.messageFilters, sortBy, pagination);
      break;
    case 'notification':
      Model = Notification;
      pipeline = buildNotificationPipeline(searchTerm, filters?.notificationFilters, sortBy, pagination);
      break;
    case 'instagram':
      Model = InstagramTour;
      pipeline = buildInstagramPipeline(searchTerm, filters?.instagramFilters, sortBy, pagination);
      break;
    default:
      return { data: [], total: 0 };
  }

  const results = await Model.aggregate(pipeline);
  const total = results.length > 0 ? results[0].totalCount || 0 : 0;

  return {
    data: results,
    total
  };
}

// Helper function to execute quick search
async function executeQuickSearch(type, searchTerm, filters, sortBy, pagination) {
  const search = {
    type,
    query: {
      searchTerm,
      filters,
      sortBy,
      pagination
    }
  };

  return await executeSearch(search);
}

// Pipeline builders
function buildTourPipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.category && filters.category.length > 0) {
      matchStage.category = { $in: filters.category };
    }

    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        matchStage.price = { $gte: filters.priceRange.min };
      }
      if (filters.priceRange.max !== undefined) {
        matchStage.price = { ...matchStage.price, $lte: filters.priceRange.max };
      }
    }

    if (filters.duration) {
      if (filters.duration.min !== undefined) {
        matchStage.duration = { $gte: filters.duration.min };
      }
      if (filters.duration.max !== undefined) {
        matchStage.duration = { ...matchStage.duration, $lte: filters.duration.max };
      }
    }

    if (filters.location && filters.location.length > 0) {
      matchStage.location = { $in: filters.location };
    }

    if (filters.isActive !== undefined) {
      matchStage.isActive = filters.isActive;
    }

    if (filters.rating) {
      if (filters.rating.min !== undefined) {
        matchStage.rating = { $gte: filters.rating.min };
      }
      if (filters.rating.max !== undefined) {
        matchStage.rating = { ...matchStage.rating, $lte: filters.rating.max };
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      matchStage.tags = { $in: filters.tags };
    }

    if (filters.createdDate) {
      if (filters.createdDate.start) {
        matchStage.createdAt = { $gte: new Date(filters.createdDate.start) };
      }
      if (filters.createdDate.end) {
        matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(filters.createdDate.end) };
      }
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

function buildUserPipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.role && filters.role.length > 0) {
      matchStage.role = { $in: filters.role };
    }

    if (filters.isActive !== undefined) {
      matchStage.isActive = filters.isActive;
    }

    if (filters.registrationDate) {
      if (filters.registrationDate.start) {
        matchStage.createdAt = { $gte: new Date(filters.registrationDate.start) };
      }
      if (filters.registrationDate.end) {
        matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(filters.registrationDate.end) };
      }
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

function buildBlogPipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.category && filters.category.length > 0) {
      matchStage.category = { $in: filters.category };
    }

    if (filters.isPublished !== undefined) {
      matchStage.isPublished = filters.isPublished;
    }

    if (filters.tags && filters.tags.length > 0) {
      matchStage.tags = { $in: filters.tags };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

function buildPurchasePipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.status && filters.status.length > 0) {
      matchStage.status = { $in: filters.status };
    }

    if (filters.totalPrice) {
      if (filters.totalPrice.min !== undefined) {
        matchStage.totalPrice = { $gte: filters.totalPrice.min };
      }
      if (filters.totalPrice.max !== undefined) {
        matchStage.totalPrice = { ...matchStage.totalPrice, $lte: filters.totalPrice.max };
      }
    }

    if (filters.purchaseDate) {
      if (filters.purchaseDate.start) {
        matchStage.createdAt = { $gte: new Date(filters.purchaseDate.start) };
      }
      if (filters.purchaseDate.end) {
        matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(filters.purchaseDate.end) };
      }
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Lookup related data
  pipeline.push({
    $lookup: {
      from: 'tours',
      localField: 'tourId',
      foreignField: '_id',
      as: 'tour'
    }
  });

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  });

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { 'tour.title': { $regex: searchTerm, $options: 'i' } },
          { 'user.name': { $regex: searchTerm, $options: 'i' } },
          { 'user.email': { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

function buildMessagePipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { subject: { $regex: searchTerm, $options: 'i' } },
          { message: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.status && filters.status.length > 0) {
      matchStage.status = { $in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      matchStage.priority = { $in: filters.priority };
    }

    if (filters.category && filters.category.length > 0) {
      matchStage.category = { $in: filters.category };
    }

    if (filters.isUrgent !== undefined) {
      matchStage.isUrgent = filters.isUrgent;
    }

    if (filters.isSpam !== undefined) {
      matchStage.isSpam = filters.isSpam;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

function buildNotificationPipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { message: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.type && filters.type.length > 0) {
      matchStage.type = { $in: filters.type };
    }

    if (filters.category && filters.category.length > 0) {
      matchStage.category = { $in: filters.category };
    }

    if (filters.status && filters.status.length > 0) {
      matchStage.status = { $in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      matchStage.priority = { $in: filters.priority };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

function buildInstagramPipeline(searchTerm, filters, sortBy, pagination) {
  const pipeline = [];

  // Search term
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  // Filters
  if (filters) {
    const matchStage = {};

    if (filters.category && filters.category.length > 0) {
      matchStage.category = { $in: filters.category };
    }

    if (filters.isActive !== undefined) {
      matchStage.isActive = filters.isActive;
    }

    if (filters.isFeatured !== undefined) {
      matchStage.isFeatured = filters.isFeatured;
    }

    if (filters.likes) {
      if (filters.likes.min !== undefined) {
        matchStage.likes = { $gte: filters.likes.min };
      }
      if (filters.likes.max !== undefined) {
        matchStage.likes = { ...matchStage.likes, $lte: filters.likes.max };
      }
    }

    if (filters.comments) {
      if (filters.comments.min !== undefined) {
        matchStage.comments = { $gte: filters.comments.min };
      }
      if (filters.comments.max !== undefined) {
        matchStage.comments = { ...matchStage.comments, $lte: filters.comments.max };
      }
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
  }

  // Count total
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortBy ? { [sortBy.field]: sortBy.order === 'desc' ? -1 : 1 } : { createdAt: -1 } },
        { $skip: (pagination?.page - 1) * (pagination?.limit || 20) },
        { $limit: pagination?.limit || 20 }
      ],
      totalCount: [{ $count: 'count' }]
    }
  });

  return pipeline;
}

module.exports = router; 