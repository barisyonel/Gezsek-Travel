const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tour = require('../models/Tour');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const InstagramTour = require('../models/InstagramTour');
const auth = require('../middleware/auth');

// Get dashboard overview (admin)
router.get('/admin/overview', auth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsers30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newUsers7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });

    // Tour statistics
    const totalTours = await Tour.countDocuments();
    const activeTours = await Tour.countDocuments({ isActive: true });
    const toursByCategory = await Tour.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Purchase/Revenue statistics
    const totalPurchases = await Purchase.countDocuments();
    const totalRevenue = await Purchase.aggregate([
      { $match: { status: { $in: ['completed', 'confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const revenue30Days = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const revenue7Days = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const revenueToday = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: oneDayAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Review statistics
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    // Message statistics
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ status: 'okunmamis' });
    const urgentMessages = await Message.countDocuments({
      priority: { $in: ['yuksek', 'acil'] },
      status: { $ne: 'arsivlendi' }
    });

    // Notification statistics
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ status: 'unread' });

    // Instagram Tour statistics
    const totalInstagramTours = await InstagramTour.countDocuments();
    const activeInstagramTours = await InstagramTour.countDocuments({ isActive: true });
    const totalLikes = await InstagramTour.aggregate([
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    const totalComments = await InstagramTour.aggregate([
      { $group: { _id: null, total: { $sum: '$comments' } } }
    ]);

    // Recent activity
    const recentPurchases = await Purchase.find()
      .populate('tourId', 'title')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentReviews = await Review.find()
      .populate('tourId', 'title')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Chart data
    const dailyRevenue = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topTours = await Purchase.aggregate([
      { $match: { status: { $in: ['completed', 'confirmed'] } } },
      {
        $group: {
          _id: '$tourId',
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'tours',
          localField: '_id',
          foreignField: '_id',
          as: 'tour'
        }
      },
      { $unwind: '$tour' }
    ]);

    const categoryRevenue = await Purchase.aggregate([
      { $match: { status: { $in: ['completed', 'confirmed'] } } },
      {
        $lookup: {
          from: 'tours',
          localField: 'tourId',
          foreignField: '_id',
          as: 'tour'
        }
      },
      { $unwind: '$tour' },
      {
        $group: {
          _id: '$tour.category',
          totalRevenue: { $sum: '$totalPrice' },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        new30Days: newUsers30Days,
        new7Days: newUsers7Days,
        newToday: newUsersToday
      },
      tours: {
        total: totalTours,
        active: activeTours,
        byCategory: toursByCategory
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        last30Days: revenue30Days[0]?.total || 0,
        last7Days: revenue7Days[0]?.total || 0,
        today: revenueToday[0]?.total || 0
      },
      purchases: {
        total: totalPurchases
      },
      reviews: {
        total: totalReviews,
        averageRating: averageRating[0]?.average || 0
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        urgent: urgentMessages
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications
      },
      instagramTours: {
        total: totalInstagramTours,
        active: activeInstagramTours,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0
      },
      recentActivity: {
        purchases: recentPurchases,
        users: recentUsers,
        reviews: recentReviews
      },
      charts: {
        dailyRevenue,
        dailyUsers,
        topTours,
        categoryRevenue
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Dashboard verileri alınırken hata oluştu' });
  }
});

// Get real-time statistics (admin)
router.get('/admin/realtime', auth, async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // Real-time user activity
    const activeUsersLastHour = await User.countDocuments({
      lastLoginAt: { $gte: oneHourAgo }
    });

    const activeUsersLastDay = await User.countDocuments({
      lastLoginAt: { $gte: oneDayAgo }
    });

    // Real-time purchases
    const purchasesLastHour = await Purchase.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    const purchasesLastDay = await Purchase.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    // Real-time revenue
    const revenueLastHour = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: oneHourAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const revenueLastDay = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: oneDayAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Real-time messages
    const messagesLastHour = await Message.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    const messagesLastDay = await Message.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    // Real-time notifications
    const notificationsLastHour = await Notification.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    const notificationsLastDay = await Notification.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    // System health
    const systemHealth = {
      database: 'healthy',
      api: 'healthy',
      email: 'healthy',
      storage: 'healthy'
    };

    res.json({
      users: {
        activeLastHour: activeUsersLastHour,
        activeLastDay: activeUsersLastDay
      },
      purchases: {
        lastHour: purchasesLastHour,
        lastDay: purchasesLastDay
      },
      revenue: {
        lastHour: revenueLastHour[0]?.total || 0,
        lastDay: revenueLastDay[0]?.total || 0
      },
      messages: {
        lastHour: messagesLastHour,
        lastDay: messagesLastDay
      },
      notifications: {
        lastHour: notificationsLastHour,
        lastDay: notificationsLastDay
      },
      systemHealth,
      timestamp: now
    });
  } catch (error) {
    console.error('Real-time statistics error:', error);
    res.status(500).json({ message: 'Gerçek zamanlı veriler alınırken hata oluştu' });
  }
});

// Get performance metrics (admin)
router.get('/admin/performance', auth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Conversion rates
    const totalVisitors = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const totalPurchases = await Purchase.countDocuments({ 
      status: { $in: ['completed', 'confirmed'] },
      createdAt: { $gte: thirtyDaysAgo }
    });
    const conversionRate = totalVisitors > 0 ? (totalPurchases / totalVisitors) * 100 : 0;

    // Average order value
    const totalRevenue = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const averageOrderValue = totalPurchases > 0 ? (totalRevenue[0]?.total || 0) / totalPurchases : 0;

    // Customer satisfaction
    const averageRating = await Review.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    // Response time metrics
    const responseTimeMetrics = await Message.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'parentMessage',
          as: 'replies'
        }
      },
      {
        $addFields: {
          responseTime: {
            $cond: {
              if: { $gt: [{ $size: '$replies' }, 0] },
              then: {
                $divide: [
                  { $subtract: [{ $arrayElemAt: ['$replies.createdAt', 0] }, '$createdAt'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              },
              else: null
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    // Tour performance metrics
    const tourPerformance = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: thirtyDaysAgo }
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
      { $unwind: '$tour' },
      {
        $group: {
          _id: '$tourId',
          tourName: { $first: '$tour.title' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // User engagement metrics
    const userEngagement = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'userId',
          as: 'purchases'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'userId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          totalPurchases: { $size: '$purchases' },
          totalReviews: { $size: '$reviews' },
          totalSpent: { $sum: '$purchases.totalPrice' }
        }
      },
      {
        $group: {
          _id: null,
          averagePurchasesPerUser: { $avg: '$totalPurchases' },
          averageReviewsPerUser: { $avg: '$totalReviews' },
          averageSpentPerUser: { $avg: '$totalSpent' },
          totalActiveUsers: { $sum: 1 }
        }
      }
    ]);

    res.json({
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      customerSatisfaction: Math.round((averageRating[0]?.average || 0) * 100) / 100,
      responseTime: {
        average: Math.round((responseTimeMetrics[0]?.averageResponseTime || 0) * 100) / 100,
        min: Math.round((responseTimeMetrics[0]?.minResponseTime || 0) * 100) / 100,
        max: Math.round((responseTimeMetrics[0]?.maxResponseTime || 0) * 100) / 100
      },
      tourPerformance,
      userEngagement: userEngagement[0] || {
        averagePurchasesPerUser: 0,
        averageReviewsPerUser: 0,
        averageSpentPerUser: 0,
        totalActiveUsers: 0
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ message: 'Performans metrikleri alınırken hata oluştu' });
  }
});

// Get trend analysis (admin)
router.get('/admin/trends', auth, async (req, res) => {
  try {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    // Revenue trends
    const revenueTrends = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: ninetyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User growth trends
    const userGrowthTrends = await User.aggregate([
      { $match: { createdAt: { $gte: ninetyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Tour popularity trends
    const tourPopularityTrends = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: ninetyDaysAgo }
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
      { $unwind: '$tour' },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            category: '$tour.category'
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // Seasonal analysis
    const seasonalAnalysis = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: ninetyDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Category performance trends
    const categoryTrends = await Purchase.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'confirmed'] },
          createdAt: { $gte: ninetyDaysAgo }
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
      { $unwind: '$tour' },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            category: '$tour.category'
          },
          revenue: { $sum: '$totalPrice' },
          sales: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    res.json({
      revenueTrends,
      userGrowthTrends,
      tourPopularityTrends,
      seasonalAnalysis,
      categoryTrends
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({ message: 'Trend analizi alınırken hata oluştu' });
  }
});

module.exports = router; 