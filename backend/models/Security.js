const mongoose = require('mongoose');

const securitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['login_attempt', 'password_change', 'profile_update', 'admin_action', 'suspicious_activity', 'api_access', 'file_upload', 'data_export', 'system_change'],
    required: true
  },
  action: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    required: true,
    maxlength: 45
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  location: {
    country: {
      type: String,
      maxlength: 100
    },
    city: {
      type: String,
      maxlength: 100
    },
    region: {
      type: String,
      maxlength: 100
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    os: {
      type: String,
      maxlength: 100
    },
    browser: {
      type: String,
      maxlength: 100
    },
    version: {
      type: String,
      maxlength: 50
    }
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'false_positive'],
    default: 'pending'
  },
  metadata: {
    sessionId: {
      type: String,
      maxlength: 100
    },
    requestId: {
      type: String,
      maxlength: 100
    },
    endpoint: {
      type: String,
      maxlength: 200
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      maxlength: 10
    },
    responseCode: {
      type: Number,
      min: 100,
      max: 599
    },
    responseTime: {
      type: Number,
      min: 0
    },
    requestSize: {
      type: Number,
      min: 0
    },
    responseSize: {
      type: Number,
      min: 0
    },
    headers: {
      type: Map,
      of: String
    },
    cookies: {
      type: Map,
      of: String
    },
    parameters: {
      type: Map,
      of: String
    },
    body: {
      type: String,
      maxlength: 1000
    },
    errorMessage: {
      type: String,
      maxlength: 500
    },
    stackTrace: {
      type: String,
      maxlength: 2000
    }
  },
  flags: {
    isSuspicious: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    requiresReview: {
      type: Boolean,
      default: false
    },
    isAutomated: {
      type: Boolean,
      default: false
    },
    isVPN: {
      type: Boolean,
      default: false
    },
    isProxy: {
      type: Boolean,
      default: false
    },
    isTor: {
      type: Boolean,
      default: false
    }
  },
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Security'
  }],
  tags: [{
    type: String,
    maxlength: 50
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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

// Virtual field for isRecent
securitySchema.virtual('isRecent').get(function() {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  return this.createdAt > oneHourAgo;
});

// Virtual field for isToday
securitySchema.virtual('isToday').get(function() {
  const today = new Date();
  const eventDate = new Date(this.createdAt);
  return eventDate.toDateString() === today.toDateString();
});

// Virtual field for isThisWeek
securitySchema.virtual('isThisWeek').get(function() {
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return this.createdAt > oneWeekAgo;
});

// Virtual field for isHighRisk
securitySchema.virtual('isHighRisk').get(function() {
  return this.riskLevel === 'high' || this.riskLevel === 'critical';
});

// Virtual field for isResolved
securitySchema.virtual('isResolved').get(function() {
  return this.status === 'resolved' || this.status === 'false_positive';
});

// Indexes for better performance
securitySchema.index({ userId: 1, createdAt: -1 });
securitySchema.index({ type: 1, createdAt: -1 });
securitySchema.index({ riskLevel: 1, status: 1 });
securitySchema.index({ ipAddress: 1, createdAt: -1 });
securitySchema.index({ 'flags.isSuspicious': 1, createdAt: -1 });
securitySchema.index({ 'flags.isBlocked': 1, createdAt: -1 });
securitySchema.index({ tags: 1 });
securitySchema.index({ isDeleted: 1 });

// Pre-save middleware to set risk level based on type and flags
securitySchema.pre('save', function(next) {
  // Auto-set risk level based on type
  if (this.type === 'suspicious_activity' && this.riskLevel === 'low') {
    this.riskLevel = 'medium';
  }
  
  // Auto-set risk level based on flags
  if (this.flags.isVPN || this.flags.isProxy || this.flags.isTor) {
    if (this.riskLevel === 'low') {
      this.riskLevel = 'medium';
    }
  }
  
  // Auto-set requiresReview for high risk events
  if (this.riskLevel === 'high' || this.riskLevel === 'critical') {
    this.flags.requiresReview = true;
  }
  
  next();
});

// Static method to create login attempt
securitySchema.statics.createLoginAttempt = function(data) {
  return this.create({
    type: 'login_attempt',
    action: 'User login attempt',
    description: `Login attempt from ${data.ipAddress}`,
    ...data
  });
};

// Static method to create suspicious activity
securitySchema.statics.createSuspiciousActivity = function(data) {
  return this.create({
    type: 'suspicious_activity',
    action: 'Suspicious activity detected',
    riskLevel: 'high',
    flags: {
      ...data.flags,
      isSuspicious: true,
      requiresReview: true
    },
    ...data
  });
};

// Static method to create API access log
securitySchema.statics.createApiAccess = function(data) {
  return this.create({
    type: 'api_access',
    action: 'API endpoint accessed',
    description: `${data.metadata?.method || 'GET'} ${data.metadata?.endpoint || 'Unknown endpoint'}`,
    ...data
  });
};

// Static method to create admin action
securitySchema.statics.createAdminAction = function(data) {
  return this.create({
    type: 'admin_action',
    action: 'Administrative action performed',
    riskLevel: 'medium',
    ...data
  });
};

// Static method to get security statistics
securitySchema.statics.getSecurityStats = function(userId = null, timeRange = '24h') {
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

  const matchStage = {
    createdAt: { $gte: startDate },
    isDeleted: false
  };

  if (userId) {
    matchStage.userId = userId;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          riskLevel: '$riskLevel',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        riskLevels: {
          $push: {
            riskLevel: '$_id.riskLevel',
            status: '$_id.status',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to get IP address statistics
securitySchema.statics.getIpStats = function(timeRange = '24h') {
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

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$ipAddress',
        count: { $sum: 1 },
        riskLevels: { $addToSet: '$riskLevel' },
        types: { $addToSet: '$type' },
        lastActivity: { $max: '$createdAt' },
        firstActivity: { $min: '$createdAt' },
        suspiciousCount: {
          $sum: { $cond: [{ $eq: ['$flags.isSuspicious', true] }, 1, 0] }
        },
        blockedCount: {
          $sum: { $cond: [{ $eq: ['$flags.isBlocked', true] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        hasHighRisk: { $in: ['high', 'critical', '$riskLevels'] },
        isSuspicious: { $gt: ['$suspiciousCount', 0] },
        isBlocked: { $gt: ['$blockedCount', 0] }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 50
    }
  ]);
};

// Static method to get location statistics
securitySchema.statics.getLocationStats = function(timeRange = '24h') {
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

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        isDeleted: false,
        'location.country': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          country: '$location.country',
          city: '$location.city'
        },
        count: { $sum: 1 },
        riskLevels: { $addToSet: '$riskLevel' },
        types: { $addToSet: '$type' },
        lastActivity: { $max: '$createdAt' },
        suspiciousCount: {
          $sum: { $cond: [{ $eq: ['$flags.isSuspicious', true] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        hasHighRisk: { $in: ['high', 'critical', '$riskLevels'] }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 50
    }
  ]);
};

module.exports = mongoose.model('Security', securitySchema); 