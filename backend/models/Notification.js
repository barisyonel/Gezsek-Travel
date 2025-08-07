const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'reservation', 'message', 'system', 'promotion'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['general', 'reservation', 'payment', 'tour', 'message', 'system', 'marketing'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String,
    maxlength: 500
  },
  actionText: {
    type: String,
    maxlength: 100
  },
  metadata: {
    // Rezervasyon bildirimleri için
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase'
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour'
    },
    // Mesaj bildirimleri için
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    // Sistem bildirimleri için
    systemEvent: String,
    // Promosyon bildirimleri için
    promotionCode: String,
    discountAmount: Number,
    expiryDate: Date
  },
  expiresAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  deliveryChannels: [{
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: ['in-app']
  }],
  deliveryStatus: {
    inApp: { sent: Boolean, sentAt: Date },
    email: { sent: Boolean, sentAt: Date, error: String },
    sms: { sent: Boolean, sentAt: Date, error: String },
    push: { sent: Boolean, sentAt: Date, error: String }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for isExpired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual field for isScheduled
notificationSchema.virtual('isScheduledForFuture').get(function() {
  if (!this.scheduledAt) return false;
  return new Date() < this.scheduledAt;
});

// Virtual field for age in hours
notificationSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60));
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ scheduledAt: 1, isScheduled: 1 });
notificationSchema.index({ isDeleted: 1 });

// Pre-save middleware to update readAt when status changes to read
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
    this.isRead = true;
  }
  next();
});

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function(data) {
  return this.create({
    ...data,
    type: 'system',
    category: 'system',
    sender: null
  });
};

// Static method to create reservation notification
notificationSchema.statics.createReservationNotification = function(recipientId, reservationData) {
  return this.create({
    recipient: recipientId,
    type: 'reservation',
    category: 'reservation',
    title: 'Rezervasyon Güncellemesi',
    message: `Rezervasyonunuz ${reservationData.status} durumuna güncellendi.`,
    metadata: {
      reservationId: reservationData.reservationId,
      tourId: reservationData.tourId
    },
    actionUrl: `/reservations/${reservationData.reservationId}`,
    actionText: 'Rezervasyonu Görüntüle'
  });
};

// Static method to create message notification
notificationSchema.statics.createMessageNotification = function(recipientId, messageData) {
  return this.create({
    recipient: recipientId,
    type: 'message',
    category: 'message',
    title: 'Yeni Mesaj',
    message: `${messageData.senderName} size yeni bir mesaj gönderdi.`,
    metadata: {
      messageId: messageData.messageId
    },
    actionUrl: `/messages/${messageData.messageId}`,
    actionText: 'Mesajı Görüntüle'
  });
};

// Static method to create promotion notification
notificationSchema.statics.createPromotionNotification = function(recipientId, promotionData) {
  return this.create({
    recipient: recipientId,
    type: 'promotion',
    category: 'marketing',
    title: 'Özel İndirim!',
    message: `${promotionData.discountAmount}₺ indirim kazandınız!`,
    metadata: {
      promotionCode: promotionData.code,
      discountAmount: promotionData.discountAmount,
      expiryDate: promotionData.expiryDate
    },
    actionUrl: '/promotions',
    actionText: 'İndirimi Kullan',
    expiresAt: promotionData.expiryDate
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 