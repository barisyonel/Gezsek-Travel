const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  isFromAdmin: {
    type: Boolean,
    default: false
  },
  isFromUser: {
    type: Boolean,
    default: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    location: {
      country: String,
      city: String,
      region: String
    }
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for isRead
messageSchema.virtual('isRead').get(function() {
  return !!this.readAt;
});

// Virtual field for timeAgo
messageSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const messageTime = new Date(this.createdAt);
  const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Az önce';
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  
  return messageTime.toLocaleDateString('tr-TR');
});

// Indexes for better performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isFromAdmin: 1 });
messageSchema.index({ isDeleted: 1 });

// Static method to create conversation ID
messageSchema.statics.createConversationId = function(userId, adminId) {
  const ids = [userId.toString(), adminId.toString()].sort();
  return `conv_${ids.join('_')}`;
};

// Static method to get conversation between user and admin
messageSchema.statics.getConversation = function(userId, adminId, limit = 50) {
  const conversationId = this.createConversationId(userId, adminId);
  
  return this.find({
    conversationId,
    isDeleted: false
  })
  .populate('sender', 'name email avatar')
  .populate('receiver', 'name email avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
};

// Static method to get unread message count for admin
messageSchema.statics.getUnreadCountForAdmin = function(adminId) {
  return this.countDocuments({
    receiver: adminId,
    isFromUser: true,
    status: { $in: ['sent', 'delivered'] },
    isDeleted: false
  });
};

// Static method to get recent conversations for admin
messageSchema.statics.getRecentConversationsForAdmin = function(adminId, limit = 20) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(adminId) },
          { receiver: new mongoose.Types.ObjectId(adminId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        messageCount: { $sum: 1 },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', new mongoose.Types.ObjectId(adminId)] },
                  { $eq: ['$isFromUser', true] },
                  { $in: ['$status', ['sent', 'delivered']] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.receiver',
        foreignField: '_id',
        as: 'receiver'
      }
    },
    {
      $unwind: '$sender'
    },
    {
      $unwind: '$receiver'
    }
  ]);
};

// Pre-save middleware to set conversation ID
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    this.conversationId = this.constructor.createConversationId(this.sender, this.receiver);
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema); 