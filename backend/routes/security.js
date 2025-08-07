const express = require('express');
const router = express.Router();
const Security = require('../models/Security');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all security events (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      riskLevel,
      status,
      userId,
      ipAddress,
      search,
      timeRange = '24h'
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (type) query.type = type;
    if (riskLevel) query.riskLevel = riskLevel;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (ipAddress) query.ipAddress = { $regex: ipAddress, $options: 'i' };

    // Time range filter
    if (timeRange) {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      query.createdAt = { $gte: startDate };
    }

    // Search
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const events = await Security.find(query)
      .populate('userId', 'name email')
      .populate('notes.author', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Security.countDocuments(query);

    res.json({
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get security events error:', error);
    res.status(500).json({ message: 'Güvenlik olayları alınırken hata oluştu' });
  }
});

// Get security event by ID (admin)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const event = await Security.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('notes.author', 'name email')
      .populate('relatedEvents');

    if (!event || event.isDeleted) {
      return res.status(404).json({ message: 'Güvenlik olayı bulunamadı' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get security event error:', error);
    res.status(500).json({ message: 'Güvenlik olayı alınırken hata oluştu' });
  }
});

// Create security event (admin)
router.post('/admin', auth, async (req, res) => {
  try {
    const {
      userId,
      type,
      action,
      description,
      ipAddress,
      userAgent,
      location,
      device,
      riskLevel,
      metadata,
      flags,
      tags
    } = req.body;

    // Validation
    if (!userId || !type || !action || !ipAddress) {
      return res.status(400).json({ 
        message: 'Kullanıcı ID, tip, aksiyon ve IP adresi zorunludur' 
      });
    }

    const eventData = {
      userId,
      type,
      action,
      description,
      ipAddress,
      userAgent,
      location,
      device,
      riskLevel: riskLevel || 'low',
      metadata,
      flags: flags || {},
      tags: tags || []
    };

    const event = new Security(eventData);
    await event.save();

    const populatedEvent = await Security.findById(event._id)
      .populate('userId', 'name email');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create security event error:', error);
    res.status(500).json({ message: 'Güvenlik olayı oluşturulurken hata oluştu' });
  }
});

// Update security event (admin)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const event = await Security.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email')
    .populate('notes.author', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Güvenlik olayı bulunamadı' });
    }

    res.json(event);
  } catch (error) {
    console.error('Update security event error:', error);
    res.status(500).json({ message: 'Güvenlik olayı güncellenirken hata oluştu' });
  }
});

// Delete security event (admin)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const event = await Security.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Güvenlik olayı bulunamadı' });
    }

    res.json({ message: 'Güvenlik olayı silindi' });
  } catch (error) {
    console.error('Delete security event error:', error);
    res.status(500).json({ message: 'Güvenlik olayı silinirken hata oluştu' });
  }
});

// Add note to security event (admin)
router.post('/admin/:id/notes', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Not içeriği zorunludur' });
    }

    const event = await Security.findById(req.params.id);
    if (!event || event.isDeleted) {
      return res.status(404).json({ message: 'Güvenlik olayı bulunamadı' });
    }

    event.notes.push({
      content,
      author: req.user._id
    });

    await event.save();

    const populatedEvent = await Security.findById(event._id)
      .populate('userId', 'name email')
      .populate('notes.author', 'name email');

    res.json(populatedEvent);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Not eklenirken hata oluştu' });
  }
});

// Get security statistics (admin)
router.get('/admin/statistics', auth, async (req, res) => {
  try {
    const { timeRange = '24h', userId } = req.query;

    const [
      securityStats,
      ipStats,
      locationStats,
      totalEvents,
      pendingEvents,
      highRiskEvents,
      suspiciousEvents
    ] = await Promise.all([
      Security.getSecurityStats(userId, timeRange),
      Security.getIpStats(timeRange),
      Security.getLocationStats(timeRange),
      Security.countDocuments({ isDeleted: false }),
      Security.countDocuments({ 
        status: 'pending', 
        isDeleted: false 
      }),
      Security.countDocuments({ 
        riskLevel: { $in: ['high', 'critical'] }, 
        isDeleted: false 
      }),
      Security.countDocuments({ 
        'flags.isSuspicious': true, 
        isDeleted: false 
      })
    ]);

    // Calculate recent activity (last hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const recentEvents = await Security.countDocuments({
      createdAt: { $gte: oneHourAgo },
      isDeleted: false
    });

    // Get top event types
    const topEventTypes = await Security.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top risk levels
    const topRiskLevels = await Security.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      securityStats,
      ipStats,
      locationStats,
      summary: {
        totalEvents,
        pendingEvents,
        highRiskEvents,
        suspiciousEvents,
        recentEvents
      },
      topEventTypes,
      topRiskLevels
    });
  } catch (error) {
    console.error('Get security statistics error:', error);
    res.status(500).json({ message: 'Güvenlik istatistikleri alınırken hata oluştu' });
  }
});

// Get IP address analysis (admin)
router.get('/admin/ip-analysis/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const { timeRange = '24h' } = req.query;

    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const events = await Security.find({
      ipAddress: ip,
      createdAt: { $gte: startDate },
      isDeleted: false
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    const analysis = {
      ipAddress: ip,
      totalEvents: events.length,
      firstSeen: events.length > 0 ? events[events.length - 1].createdAt : null,
      lastSeen: events.length > 0 ? events[0].createdAt : null,
      riskLevels: {},
      eventTypes: {},
      users: {},
      locations: {},
      devices: {},
      flags: {
        isSuspicious: false,
        isBlocked: false,
        isVPN: false,
        isProxy: false,
        isTor: false
      }
    };

    events.forEach(event => {
      // Count risk levels
      analysis.riskLevels[event.riskLevel] = (analysis.riskLevels[event.riskLevel] || 0) + 1;
      
      // Count event types
      analysis.eventTypes[event.type] = (analysis.eventTypes[event.type] || 0) + 1;
      
      // Count users
      if (event.userId) {
        const userId = event.userId._id.toString();
        analysis.users[userId] = {
          name: event.userId.name,
          email: event.userId.email,
          count: (analysis.users[userId]?.count || 0) + 1
        };
      }
      
      // Count locations
      if (event.location?.country) {
        const location = `${event.location.country}, ${event.location.city || 'Unknown'}`;
        analysis.locations[location] = (analysis.locations[location] || 0) + 1;
      }
      
      // Count devices
      if (event.device?.type) {
        analysis.devices[event.device.type] = (analysis.devices[event.device.type] || 0) + 1;
      }
      
      // Check flags
      if (event.flags.isSuspicious) analysis.flags.isSuspicious = true;
      if (event.flags.isBlocked) analysis.flags.isBlocked = true;
      if (event.flags.isVPN) analysis.flags.isVPN = true;
      if (event.flags.isProxy) analysis.flags.isProxy = true;
      if (event.flags.isTor) analysis.flags.isTor = true;
    });

    res.json({
      analysis,
      events
    });
  } catch (error) {
    console.error('Get IP analysis error:', error);
    res.status(500).json({ message: 'IP analizi alınırken hata oluştu' });
  }
});

// Block IP address (admin)
router.post('/admin/block-ip/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const { reason, duration } = req.body;

    // Update all events from this IP to be blocked
    const result = await Security.updateMany(
      { 
        ipAddress: ip,
        isDeleted: false 
      },
      { 
        'flags.isBlocked': true,
        status: 'resolved',
        tags: { $addToSet: 'blocked' }
      }
    );

    // Add a note to the most recent event
    const latestEvent = await Security.findOne({
      ipAddress: ip,
      isDeleted: false
    }).sort({ createdAt: -1 });

    if (latestEvent) {
      latestEvent.notes.push({
        content: `IP blocked by ${req.user.name}. Reason: ${reason || 'Security threat'}. Duration: ${duration || 'Permanent'}`,
        author: req.user._id
      });
      await latestEvent.save();
    }

    res.json({ 
      message: `IP ${ip} blocked successfully`,
      blockedEvents: result.modifiedCount
    });
  } catch (error) {
    console.error('Block IP error:', error);
    res.status(500).json({ message: 'IP engellenirken hata oluştu' });
  }
});

// Unblock IP address (admin)
router.post('/admin/unblock-ip/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const { reason } = req.body;

    // Update all events from this IP to be unblocked
    const result = await Security.updateMany(
      { 
        ipAddress: ip,
        isDeleted: false 
      },
      { 
        'flags.isBlocked': false,
        tags: { $pull: 'blocked' }
      }
    );

    // Add a note to the most recent event
    const latestEvent = await Security.findOne({
      ipAddress: ip,
      isDeleted: false
    }).sort({ createdAt: -1 });

    if (latestEvent) {
      latestEvent.notes.push({
        content: `IP unblocked by ${req.user.name}. Reason: ${reason || 'Manual unblock'}`,
        author: req.user._id
      });
      await latestEvent.save();
    }

    res.json({ 
      message: `IP ${ip} unblocked successfully`,
      unblockedEvents: result.modifiedCount
    });
  } catch (error) {
    console.error('Unblock IP error:', error);
    res.status(500).json({ message: 'IP engeli kaldırılırken hata oluştu' });
  }
});

// Get user security events (admin)
router.get('/admin/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, timeRange = '30d' } = req.query;

    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const events = await Security.find({
      userId,
      createdAt: { $gte: startDate },
      isDeleted: false
    })
    .populate('notes.author', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Security.countDocuments({
      userId,
      createdAt: { $gte: startDate },
      isDeleted: false
    });

    // Get user security summary
    const summary = await Security.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          highRiskEvents: {
            $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] }
          },
          suspiciousEvents: {
            $sum: { $cond: [{ $eq: ['$flags.isSuspicious', true] }, 1, 0] }
          },
          blockedEvents: {
            $sum: { $cond: [{ $eq: ['$flags.isBlocked', true] }, 1, 0] }
          },
          uniqueIPs: { $addToSet: '$ipAddress' },
          uniqueLocations: { $addToSet: '$location.country' }
        }
      },
      {
        $project: {
          _id: 0,
          totalEvents: 1,
          highRiskEvents: 1,
          suspiciousEvents: 1,
          blockedEvents: 1,
          uniqueIPs: { $size: '$uniqueIPs' },
          uniqueLocations: { $size: '$uniqueLocations' }
        }
      }
    ]);

    res.json({
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      summary: summary[0] || {
        totalEvents: 0,
        highRiskEvents: 0,
        suspiciousEvents: 0,
        blockedEvents: 0,
        uniqueIPs: 0,
        uniqueLocations: 0
      }
    });
  } catch (error) {
    console.error('Get user security events error:', error);
    res.status(500).json({ message: 'Kullanıcı güvenlik olayları alınırken hata oluştu' });
  }
});

// Export security events (admin)
router.get('/admin/export', auth, async (req, res) => {
  try {
    const { format = 'json', timeRange = '24h', type, riskLevel } = req.query;

    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    let query = {
      createdAt: { $gte: startDate },
      isDeleted: false
    };

    if (type) query.type = type;
    if (riskLevel) query.riskLevel = riskLevel;

    const events = await Security.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    let exportData;
    if (format === 'json') {
      exportData = events.map(event => ({
        id: event._id,
        type: event.type,
        action: event.action,
        description: event.description,
        ipAddress: event.ipAddress,
        riskLevel: event.riskLevel,
        status: event.status,
        createdAt: event.createdAt,
        user: event.userId ? {
          name: event.userId.name,
          email: event.userId.email
        } : null,
        location: event.location,
        device: event.device,
        flags: event.flags,
        tags: event.tags
      }));
    } else if (format === 'csv') {
      exportData = events.map(event => ({
        ID: event._id,
        Type: event.type,
        Action: event.action,
        Description: event.description,
        IPAddress: event.ipAddress,
        RiskLevel: event.riskLevel,
        Status: event.status,
        CreatedAt: event.createdAt,
        UserName: event.userId?.name || '',
        UserEmail: event.userId?.email || '',
        Country: event.location?.country || '',
        City: event.location?.city || '',
        DeviceType: event.device?.type || '',
        IsSuspicious: event.flags?.isSuspicious || false,
        IsBlocked: event.flags?.isBlocked || false
      }));
    }

    res.json({
      format,
      timeRange,
      total: events.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export security events error:', error);
    res.status(500).json({ message: 'Güvenlik olayları dışa aktarılırken hata oluştu' });
  }
});

module.exports = router; 