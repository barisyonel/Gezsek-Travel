const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Get user's notifications (authenticated)
router.get('/user', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      category,
      priority
    } = req.query;

    let query = { 
      recipient: req.user._id,
      isDeleted: false
    };

    // Filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Bildirimler alınırken hata oluştu' });
  }
});

// Get unread count (authenticated)
router.get('/user/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      status: 'unread',
      isDeleted: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Okunmamış sayısı alınırken hata oluştu' });
  }
});

// Mark notification as read (authenticated)
router.patch('/user/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id,
        isDeleted: false
      },
      { 
        status: 'read',
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    ).populate('sender', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Bildirim okundu olarak işaretlenirken hata oluştu' });
  }
});

// Mark all notifications as read (authenticated)
router.patch('/user/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        recipient: req.user._id,
        status: 'unread',
        isDeleted: false
      },
      { 
        status: 'read',
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Bildirimler işaretlenirken hata oluştu' });
  }
});

// Archive notification (authenticated)
router.patch('/user/:id/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id,
        isDeleted: false
      },
      { status: 'archived' },
      { new: true }
    ).populate('sender', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({ message: 'Bildirim arşivlenirken hata oluştu' });
  }
});

// Delete notification (authenticated)
router.delete('/user/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id
      },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json({ message: 'Bildirim silindi' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Bildirim silinirken hata oluştu' });
  }
});

// Admin routes - require authentication
router.use(auth);

// Get all notifications (admin)
router.get('/admin', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      recipient,
      type,
      category,
      priority,
      status,
      search
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (recipient) query.recipient = recipient;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ message: 'Bildirimler alınırken hata oluştu' });
  }
});

// Create notification (admin)
router.post('/admin', async (req, res) => {
  try {
    const {
      recipient,
      title,
      message,
      type = 'info',
      category = 'general',
      priority = 'normal',
      actionUrl,
      actionText,
      deliveryChannels = ['in-app'],
      scheduledAt,
      expiresAt,
      tags
    } = req.body;

    // Validation
    if (!recipient || !title || !message) {
      return res.status(400).json({ 
        message: 'Alıcı, başlık ve mesaj alanları zorunludur' 
      });
    }

    const notificationData = {
      recipient,
      sender: req.user._id,
      title,
      message,
      type,
      category,
      priority,
      actionUrl,
      actionText,
      deliveryChannels,
      tags: tags || []
    };

    // Handle scheduled notifications
    if (scheduledAt) {
      notificationData.scheduledAt = new Date(scheduledAt);
      notificationData.isScheduled = true;
    }

    // Handle expiring notifications
    if (expiresAt) {
      notificationData.expiresAt = new Date(expiresAt);
    }

    const notification = new Notification(notificationData);
    await notification.save();

    // Send immediate notification if not scheduled
    if (!scheduledAt) {
      await sendNotification(notification);
    }

    const populatedNotification = await Notification.findById(notification._id)
      .populate('recipient', 'name email')
      .populate('sender', 'name email');

    res.status(201).json(populatedNotification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Bildirim oluşturulurken hata oluştu' });
  }
});

// Create bulk notifications (admin)
router.post('/admin/bulk', async (req, res) => {
  try {
    const {
      recipients,
      title,
      message,
      type = 'info',
      category = 'general',
      priority = 'normal',
      actionUrl,
      actionText,
      deliveryChannels = ['in-app'],
      scheduledAt,
      expiresAt,
      tags
    } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Alıcı listesi gereklidir' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Başlık ve mesaj alanları zorunludur' });
    }

    const notifications = [];
    const notificationData = {
      sender: req.user._id,
      title,
      message,
      type,
      category,
      priority,
      actionUrl,
      actionText,
      deliveryChannels,
      tags: tags || []
    };

    if (scheduledAt) {
      notificationData.scheduledAt = new Date(scheduledAt);
      notificationData.isScheduled = true;
    }

    if (expiresAt) {
      notificationData.expiresAt = new Date(expiresAt);
    }

    // Create notifications for each recipient
    for (const recipientId of recipients) {
      const notification = new Notification({
        ...notificationData,
        recipient: recipientId
      });
      await notification.save();
      notifications.push(notification);
    }

    // Send immediate notifications if not scheduled
    if (!scheduledAt) {
      for (const notification of notifications) {
        await sendNotification(notification);
      }
    }

    res.status(201).json({ 
      message: `${notifications.length} bildirim oluşturuldu`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    res.status(500).json({ message: 'Toplu bildirimler oluşturulurken hata oluştu' });
  }
});

// Update notification (admin)
router.put('/admin/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('recipient', 'name email')
     .populate('sender', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ message: 'Bildirim güncellenirken hata oluştu' });
  }
});

// Delete notification (admin)
router.delete('/admin/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }

    res.json({ message: 'Bildirim silindi' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Bildirim silinirken hata oluştu' });
  }
});

// Get notification analytics (admin)
router.get('/admin/analytics', async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments({ isDeleted: false });
    const unreadNotifications = await Notification.countDocuments({ 
      status: 'unread',
      isDeleted: false 
    });
    const readNotifications = await Notification.countDocuments({ 
      status: 'read',
      isDeleted: false 
    });
    const archivedNotifications = await Notification.countDocuments({ 
      status: 'archived',
      isDeleted: false 
    });

    // Type distribution
    const typeStats = await Notification.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Notification.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Priority distribution
    const priorityStats = await Notification.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentNotifications = await Notification.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: false
    });

    // Delivery channel stats
    const deliveryStats = await Notification.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$deliveryChannels' },
      { $group: { _id: '$deliveryChannels', count: { $sum: 1 } } }
    ]);

    res.json({
      totalNotifications,
      unreadNotifications,
      readNotifications,
      archivedNotifications,
      recentNotifications,
      typeStats,
      categoryStats,
      priorityStats,
      deliveryStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Analitik veriler alınırken hata oluştu' });
  }
});

// Process scheduled notifications (admin)
router.post('/admin/process-scheduled', async (req, res) => {
  try {
    const now = new Date();
    const scheduledNotifications = await Notification.find({
      isScheduled: true,
      scheduledAt: { $lte: now },
      isSent: false,
      isDeleted: false
    }).populate('recipient', 'name email');

    let processedCount = 0;
    for (const notification of scheduledNotifications) {
      try {
        await sendNotification(notification);
        notification.isSent = true;
        notification.sentAt = new Date();
        await notification.save();
        processedCount++;
      } catch (error) {
        console.error(`Error processing notification ${notification._id}:`, error);
      }
    }

    res.json({ 
      message: `${processedCount} planlanmış bildirim işlendi`,
      processedCount
    });
  } catch (error) {
    console.error('Process scheduled notifications error:', error);
    res.status(500).json({ message: 'Planlanmış bildirimler işlenirken hata oluştu' });
  }
});

// Helper function to send notifications
async function sendNotification(notification) {
  const populatedNotification = await Notification.findById(notification._id)
    .populate('recipient', 'name email')
    .populate('sender', 'name email');

  // Send in-app notification
  if (populatedNotification.deliveryChannels.includes('in-app')) {
    populatedNotification.deliveryStatus.inApp = {
      sent: true,
      sentAt: new Date()
    };
  }

  // Send email notification
  if (populatedNotification.deliveryChannels.includes('email') && populatedNotification.recipient.email) {
    try {
      await sendEmail({
        to: populatedNotification.recipient.email,
        subject: populatedNotification.title,
        template: 'notification',
        context: {
          recipientName: populatedNotification.recipient.name,
          title: populatedNotification.title,
          message: populatedNotification.message,
          actionUrl: populatedNotification.actionUrl,
          actionText: populatedNotification.actionText
        }
      });

      populatedNotification.deliveryStatus.email = {
        sent: true,
        sentAt: new Date()
      };
    } catch (error) {
      populatedNotification.deliveryStatus.email = {
        sent: false,
        sentAt: new Date(),
        error: error.message
      };
    }
  }

  // Send SMS notification (placeholder)
  if (populatedNotification.deliveryChannels.includes('sms')) {
    // Implement SMS sending logic here
    populatedNotification.deliveryStatus.sms = {
      sent: false,
      sentAt: new Date(),
      error: 'SMS service not implemented'
    };
  }

  // Send push notification (placeholder)
  if (populatedNotification.deliveryChannels.includes('push')) {
    // Implement push notification logic here
    populatedNotification.deliveryStatus.push = {
      sent: false,
      sentAt: new Date(),
      error: 'Push notification service not implemented'
    };
  }

  await populatedNotification.save();
}

module.exports = router; 