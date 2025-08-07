const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const cleanupService = require('../services/cleanupService');

// Kullanıcı: Admin'e mesaj gönder
router.post('/send', auth, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Mesaj içeriği boş olamaz' });
    }

    // Admin kullanıcısını bul (email ile)
    const admin = await User.findOne({ email: 'admin@gezsektravel.com' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin kullanıcısı bulunamadı' });
    }

    const messageData = {
      sender: req.user.userId,
      receiver: admin._id,
      content: content.trim(),
      messageType,
      isFromUser: true,
      isFromAdmin: false,
      conversationId: Message.createConversationId(req.user.userId, admin._id),
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceInfo: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    };

    const message = new Message(messageData);
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    // Socket.IO ile gerçek zamanlı bildirim gönder
    const io = req.app.get('io');
    if (io) {
      // Sadece admin'lere yeni mesaj bildirimi gönder (kullanıcıdan gelen mesaj)
      io.to('admins').emit('new_message', { 
        message: populatedMessage,
        userId: req.user.userId 
      });
    }

    res.status(201).json({
      message: 'Mesaj başarıyla gönderildi',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Mesaj gönderilirken hata oluştu' });
  }
});

// Kullanıcı: Admin ile olan konuşmayı getir
router.get('/conversation', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Admin kullanıcısını bul
    const admin = await User.findOne({ email: 'admin@gezsektravel.com' });
    if (!admin) {
      return res.status(404).json({ message: 'Admin kullanıcısı bulunamadı' });
    }

    const messages = await Message.getConversation(req.user.userId, admin._id, parseInt(limit));
    
    // Mesajları tarihe göre sırala (en eski önce)
    messages.reverse();

    res.json({
      messages,
      conversationId: Message.createConversationId(req.user.userId, admin._id)
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Konuşma getirilirken hata oluştu' });
  }
});

// Kullanıcı: Mesajları okundu olarak işaretle
router.put('/mark-as-read', auth, async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: 'Geçerli mesaj ID\'leri gerekli' });
    }

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: req.user.userId,
        isDeleted: false
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({ message: 'Mesajlar okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Mesajlar işaretlenirken hata oluştu' });
  }
});

  // Admin: Tüm konuşmaları getir
  router.get('/admin/conversations', auth, async (req, res) => {
    try {
      // Sadece admin kullanıcıları erişebilir
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }

    const { limit = 20 } = req.query;
    const rawConversations = await Message.getRecentConversationsForAdmin(req.user.userId, parseInt(limit));
    
    // Frontend'in beklediği formatta düzenle
    const conversations = rawConversations.map(conv => {
      // Admin değil olan kullanıcıyı bul
      const user = conv.sender._id.toString() === req.user.userId 
        ? conv.receiver 
        : conv.sender;
        
      return {
        ...conv,
        user: user,
        lastMessage: conv.lastMessage
      };
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Konuşmalar getirilirken hata oluştu' });
  }
});

  // Admin: Belirli bir kullanıcı ile konuşmayı getir
  router.get('/admin/conversation/:userId', auth, async (req, res) => {
    try {
      // Sadece admin kullanıcıları erişebilir
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }

    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const messages = await Message.getConversation(userId, req.user.userId, parseInt(limit));
    messages.reverse(); // En eski mesaj önce

    res.json({
      messages,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      conversationId: Message.createConversationId(userId, req.user.userId)
    });
  } catch (error) {
    console.error('Get admin conversation error:', error);
    res.status(500).json({ message: 'Konuşma getirilirken hata oluştu' });
  }
});

  // Admin: Kullanıcıya mesaj gönder
  router.post('/admin/send', auth, async (req, res) => {
    try {
      // Sadece admin kullanıcıları erişebilir
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }

    const { userId, content, messageType = 'text' } = req.body;
    
    if (!userId || !content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Kullanıcı ID ve mesaj içeriği gerekli' });
    }

    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const messageData = {
      sender: req.user.userId,
      receiver: userId,
      content: content.trim(),
      messageType,
      isFromUser: false,
      isFromAdmin: true,
      status: 'sent',
      conversationId: Message.createConversationId(req.user.userId, userId)
    };

    const message = new Message(messageData);
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    // Socket.IO ile gerçek zamanlı bildirim gönder
    const io = req.app.get('io');
    if (io) {
      // Belirli kullanıcıya yeni mesaj bildirimi gönder (admin'den gelen mesaj)
      io.to(`user_${userId}`).emit('new_message', { 
        message: populatedMessage,
        adminId: req.user.userId 
      });
    }

    res.status(201).json({
      message: 'Mesaj başarıyla gönderildi',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Admin send message error:', error);
    res.status(500).json({ message: 'Mesaj gönderilirken hata oluştu' });
  }
});

  // Admin: Okunmamış mesaj sayısını getir
  router.get('/admin/unread-count', auth, async (req, res) => {
    try {
      // Sadece admin kullanıcıları erişebilir
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }

    const unreadCount = await Message.getUnreadCountForAdmin(req.user.userId);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Okunmamış mesaj sayısı getirilirken hata oluştu' });
  }
});

  // Admin: Mesajları okundu olarak işaretle
  router.put('/admin/mark-as-read', auth, async (req, res) => {
    try {
      // Sadece admin kullanıcıları erişebilir
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }

    const { conversationId } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({ message: 'Konuşma ID gerekli' });
    }

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user.userId,
        isFromUser: true,
        status: { $in: ['sent', 'delivered'] },
        isDeleted: false
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({ message: 'Mesajlar okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Admin mark as read error:', error);
    res.status(500).json({ message: 'Mesajlar işaretlenirken hata oluştu' });
  }
});

  // Admin: Mesaj istatistiklerini getir
  router.get('/admin/statistics', auth, async (req, res) => {
    try {
      // Sadece admin kullanıcıları erişebilir
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }

    const { startDate, endDate } = req.query;
    
    const matchStage = {
      $or: [
        { sender: req.user.userId },
        { receiver: req.user.userId }
      ],
      isDeleted: false
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Message.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          fromUsers: {
            $sum: { $cond: [{ $eq: ['$isFromUser', true] }, 1, 0] }
          },
          fromAdmin: {
            $sum: { $cond: [{ $eq: ['$isFromAdmin', true] }, 1, 0] }
          },
          unreadMessages: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user.userId] },
                    { $eq: ['$isFromUser', true] },
                    { $in: ['$status', ['sent', 'delivered']] }
                  ]
                },
                1,
                0
              ]
            }
          },
          uniqueConversations: { $addToSet: '$conversationId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalMessages: 1,
          fromUsers: 1,
          fromAdmin: 1,
          unreadMessages: 1,
          uniqueConversations: { $size: '$uniqueConversations' }
        }
      }
    ]);

    res.json({ statistics: stats[0] || {
      totalMessages: 0,
      fromUsers: 0,
      fromAdmin: 0,
      unreadMessages: 0,
      uniqueConversations: 0
    }});
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'İstatistikler getirilirken hata oluştu' });
  }
});

// Admin: Manuel temizleme işlemi
router.post('/admin/cleanup', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcıları erişebilir
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await cleanupService.manualCleanup();
    
    res.json({ 
      message: 'Manuel temizleme işlemi başarıyla tamamlandı',
      status: cleanupService.getStatus()
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({ message: 'Temizleme işlemi sırasında hata oluştu' });
  }
});

// Admin: Cleanup servis durumunu getir
router.get('/admin/cleanup-status', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcıları erişebilir
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const status = cleanupService.getStatus();
    
    res.json({ 
      status,
      message: 'Cleanup servis durumu başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get cleanup status error:', error);
    res.status(500).json({ message: 'Servis durumu getirilirken hata oluştu' });
  }
});

// Admin: Tüm konuşmaları getir
router.get('/admin/conversations', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcıları erişebilir
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const { limit = 20 } = req.query;
    const conversations = await Message.getRecentConversationsForAdmin(req.user.userId, parseInt(limit));

    // Konuşmaları düzenle
    const formattedConversations = conversations.map(conv => {
      const user = conv.lastMessage.sender._id.toString() === req.user.userId ? conv.receiver : conv.sender;
      return {
        _id: conv._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          birthDate: user.birthDate,
          gender: user.gender
        },
        lastMessage: conv.lastMessage,
        messageCount: conv.messageCount,
        unreadCount: conv.unreadCount
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Konuşmalar getirilirken hata oluştu' });
  }
});

// Admin: Belirli bir kullanıcı ile konuşmayı getir
router.get('/admin/conversation/:userId', auth, async (req, res) => {
  try {
    // Sadece admin kullanıcıları erişebilir
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const messages = await Message.getConversation(userId, req.user.userId, parseInt(limit));
    messages.reverse(); // En eski mesaj önce

    res.json({
      messages,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender
      },
      conversationId: Message.createConversationId(userId, req.user.userId)
    });
  } catch (error) {
    console.error('Get admin conversation error:', error);
    res.status(500).json({ message: 'Konuşma getirilirken hata oluştu' });
  }
});

module.exports = router; 