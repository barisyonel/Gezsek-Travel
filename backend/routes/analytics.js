const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Report = require('../models/Report');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Purchase = require('../models/Purchase');
const Security = require('../models/Security');
const auth = require('../middleware/auth');

// Get analytics statistics (admin)
router.get('/admin/statistics', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcıları erişebilir
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Basit istatistikler
    const totalAnalytics = await Analytics.countDocuments({ isDeleted: false });
    const activeAnalytics = await Analytics.countDocuments({ isDeleted: false, status: 'active' });
    const draftAnalytics = await Analytics.countDocuments({ isDeleted: false, status: 'draft' });

    res.json({
      totalAnalytics,
      activeAnalytics,
      draftAnalytics,
      message: 'Analitik istatistikleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get analytics statistics error:', error);
    res.status(500).json({ message: 'Analitik istatistikleri alınırken hata oluştu' });
  }
});

// Get all analytics (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      search
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (type) query.type = type;
    if (status) query.status = status;

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const analytics = await Analytics.find(query)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Analytics.countDocuments(query);

    res.json({
      analytics,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Analitikler alınırken hata oluştu' });
  }
});

// Get analytics by ID (admin)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!analytics || analytics.isDeleted) {
      return res.status(404).json({ message: 'Analitik bulunamadı' });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Analitik alınırken hata oluştu' });
  }
});

// Create analytics (admin)
router.post('/admin', auth, async (req, res) => {
  try {
    const {
      type,
      name,
      description,
      data,
      filters,
      visualization,
      schedule,
      tags
    } = req.body;

    // Validation
    if (!type || !name || !data) {
      return res.status(400).json({ 
        message: 'Tip, isim ve veri alanları zorunludur' 
      });
    }

    const analyticsData = {
      type,
      name,
      description,
      data,
      filters: filters || {},
      visualization: visualization || {},
      schedule: schedule || {},
      tags: tags || [],
      createdBy: req.user._id
    };

    const analytics = new Analytics(analyticsData);
    await analytics.save();

    const populatedAnalytics = await Analytics.findById(analytics._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedAnalytics);
  } catch (error) {
    console.error('Create analytics error:', error);
    res.status(500).json({ message: 'Analitik oluşturulurken hata oluştu' });
  }
});

// Update analytics (admin)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...req.body,
        lastModifiedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');

    if (!analytics) {
      return res.status(404).json({ message: 'Analitik bulunamadı' });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Update analytics error:', error);
    res.status(500).json({ message: 'Analitik güncellenirken hata oluştu' });
  }
});

// Delete analytics (admin)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!analytics) {
      return res.status(404).json({ message: 'Analitik bulunamadı' });
    }

    res.json({ message: 'Analitik silindi' });
  } catch (error) {
    console.error('Delete analytics error:', error);
    res.status(500).json({ message: 'Analitik silinirken hata oluştu' });
  }
});

// Generate user activity analytics (admin)
router.post('/admin/generate/user-activity', auth, async (req, res) => {
  try {
    const { dateRange, filters } = req.body;

    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    // Get user activity data
    const userActivity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get login activity
    const loginActivity = await Security.aggregate([
      {
        $match: {
          type: 'login_attempt',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          loginAttempts: { $sum: 1 },
          successfulLogins: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const analyticsData = {
      type: 'user_activity',
      name: 'User Activity Analytics',
      description: `User activity analysis from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: {
        userActivity,
        loginActivity,
        summary: {
          totalNewUsers: userActivity.reduce((sum, day) => sum + day.newUsers, 0),
          totalActiveUsers: userActivity.reduce((sum, day) => sum + day.activeUsers, 0),
          totalLoginAttempts: loginActivity.reduce((sum, day) => sum + day.loginAttempts, 0),
          totalSuccessfulLogins: loginActivity.reduce((sum, day) => sum + day.successfulLogins, 0)
        }
      },
      filters: {
        dateRange: { start: startDate, end: endDate },
        ...filters
      },
      createdBy: req.user._id
    };

    const analytics = new Analytics(analyticsData);
    await analytics.save();

    const populatedAnalytics = await Analytics.findById(analytics._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedAnalytics);
  } catch (error) {
    console.error('Generate user activity analytics error:', error);
    res.status(500).json({ message: 'Kullanıcı aktivite analitiği oluşturulurken hata oluştu' });
  }
});

// Generate tour analytics (admin)
router.post('/admin/generate/tour-analytics', auth, async (req, res) => {
  try {
    const { dateRange, filters } = req.body;

    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    // Get tour booking data
    const tourBookings = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'confirmed'] }
        }
      },
      {
        $lookup: {
          from: 'tours',
          localField: 'tourId',
          foreignField: '_id',
          as: 'tour'
        }
      },
      {
        $unwind: '$tour'
      },
      {
        $group: {
          _id: '$tourId',
          tourName: { $first: '$tour.title' },
          tourCategory: { $first: '$tour.category' },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get booking trends
    const bookingTrends = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const analyticsData = {
      type: 'tour_analytics',
      name: 'Tour Performance Analytics',
      description: `Tour performance analysis from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: {
        tourBookings,
        bookingTrends,
        summary: {
          totalBookings: tourBookings.reduce((sum, tour) => sum + tour.totalBookings, 0),
          totalRevenue: tourBookings.reduce((sum, tour) => sum + tour.totalRevenue, 0),
          averageRating: tourBookings.reduce((sum, tour) => sum + (tour.averageRating || 0), 0) / tourBookings.length,
          topPerformingTour: tourBookings[0]?.tourName || 'N/A'
        }
      },
      filters: {
        dateRange: { start: startDate, end: endDate },
        ...filters
      },
      createdBy: req.user._id
    };

    const analytics = new Analytics(analyticsData);
    await analytics.save();

    const populatedAnalytics = await Analytics.findById(analytics._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedAnalytics);
  } catch (error) {
    console.error('Generate tour analytics error:', error);
    res.status(500).json({ message: 'Tur analitiği oluşturulurken hata oluştu' });
  }
});

// Generate revenue analytics (admin)
router.post('/admin/generate/revenue-analytics', auth, async (req, res) => {
  try {
    const { dateRange, filters } = req.body;

    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();

    // Get revenue data
    const revenueData = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyRevenue: { $sum: '$totalPrice' },
          dailyBookings: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get revenue by category
    const revenueByCategory = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'confirmed'] }
        }
      },
      {
        $lookup: {
          from: 'tours',
          localField: 'tourId',
          foreignField: '_id',
          as: 'tour'
        }
      },
      {
        $unwind: '$tour'
      },
      {
        $group: {
          _id: '$tour.category',
          categoryRevenue: { $sum: '$totalPrice' },
          categoryBookings: { $sum: 1 }
        }
      },
      { $sort: { categoryRevenue: -1 } }
    ]);

    const analyticsData = {
      type: 'revenue_analytics',
      name: 'Revenue Analytics',
      description: `Revenue analysis from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      data: {
        revenueData,
        revenueByCategory,
        summary: {
          totalRevenue: revenueData.reduce((sum, day) => sum + day.dailyRevenue, 0),
          totalBookings: revenueData.reduce((sum, day) => sum + day.dailyBookings, 0),
          averageOrderValue: revenueData.reduce((sum, day) => sum + day.averageOrderValue, 0) / revenueData.length,
          topCategory: revenueByCategory[0]?._id || 'N/A'
        }
      },
      filters: {
        dateRange: { start: startDate, end: endDate },
        ...filters
      },
      createdBy: req.user._id
    };

    const analytics = new Analytics(analyticsData);
    await analytics.save();

    const populatedAnalytics = await Analytics.findById(analytics._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedAnalytics);
  } catch (error) {
    console.error('Generate revenue analytics error:', error);
    res.status(500).json({ message: 'Gelir analitiği oluşturulurken hata oluştu' });
  }
});

// Get analytics statistics (admin)
router.get('/admin/statistics', auth, async (req, res) => {
  try {
    const [
      analyticsStats,
      totalAnalytics,
      activeAnalytics,
      scheduledAnalytics
    ] = await Promise.all([
      Analytics.getAnalyticsStats(),
      Analytics.countDocuments({ isDeleted: false }),
      Analytics.countDocuments({ status: 'active', isDeleted: false }),
      Analytics.countDocuments({ 
        'schedule.isScheduled': true, 
        isDeleted: false 
      })
    ]);

    // Get recent analytics
    const recentAnalytics = await Analytics.find({ 
      isDeleted: false 
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      analyticsStats,
      summary: {
        totalAnalytics,
        activeAnalytics,
        scheduledAnalytics
      },
      recentAnalytics
    });
  } catch (error) {
    console.error('Get analytics statistics error:', error);
    res.status(500).json({ message: 'Analitik istatistikleri alınırken hata oluştu' });
  }
});

// Export analytics data (admin)
router.get('/admin/:id/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const analytics = await Analytics.findById(req.params.id);
    if (!analytics || analytics.isDeleted) {
      return res.status(404).json({ message: 'Analitik bulunamadı' });
    }

    let exportData;
    if (format === 'json') {
      exportData = {
        id: analytics._id,
        type: analytics.type,
        name: analytics.name,
        description: analytics.description,
        data: analytics.data,
        filters: analytics.filters,
        visualization: analytics.visualization,
        createdAt: analytics.createdAt,
        updatedAt: analytics.updatedAt
      };
    } else if (format === 'csv') {
      // Convert data to CSV format based on analytics type
      exportData = convertAnalyticsToCSV(analytics);
    }

    res.json({
      analytics: analytics.name,
      format,
      data: exportData
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Analitik dışa aktarılırken hata oluştu' });
  }
});

// Helper function to convert analytics data to CSV
function convertAnalyticsToCSV(analytics) {
  // This is a simplified conversion - you might want to implement more sophisticated CSV conversion
  const data = analytics.data;
  let csvData = [];

  if (analytics.type === 'user_activity' && data.userActivity) {
    csvData = data.userActivity.map(item => ({
      Date: item._id,
      'New Users': item.newUsers,
      'Active Users': item.activeUsers
    }));
  } else if (analytics.type === 'tour_analytics' && data.tourBookings) {
    csvData = data.tourBookings.map(item => ({
      'Tour Name': item.tourName,
      'Category': item.tourCategory,
      'Total Bookings': item.totalBookings,
      'Total Revenue': item.totalRevenue,
      'Average Rating': item.averageRating
    }));
  } else if (analytics.type === 'revenue_analytics' && data.revenueData) {
    csvData = data.revenueData.map(item => ({
      Date: item._id,
      'Daily Revenue': item.dailyRevenue,
      'Daily Bookings': item.dailyBookings,
      'Average Order Value': item.averageOrderValue
    }));
  }

  return csvData;
}

module.exports = router; 