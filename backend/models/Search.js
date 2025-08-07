const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['tour', 'user', 'blog', 'purchase', 'message', 'notification', 'instagram', 'custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['basic', 'advanced', 'saved', 'quick', 'analytics'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    searchTerm: {
      type: String,
      maxlength: 500
    },
    filters: {
      // Tour filters
      tourFilters: {
        category: [String],
        priceRange: {
          min: Number,
          max: Number
        },
        duration: {
          min: Number,
          max: Number
        },
        location: [String],
        isActive: Boolean,
        rating: {
          min: Number,
          max: Number
        },
        tags: [String],
        createdDate: {
          start: Date,
          end: Date
        }
      },
      // User filters
      userFilters: {
        role: [String],
        isActive: Boolean,
        registrationDate: {
          start: Date,
          end: Date
        },
        lastLoginDate: {
          start: Date,
          end: Date
        },
        purchaseCount: {
          min: Number,
          max: Number
        },
        totalSpent: {
          min: Number,
          max: Number
        }
      },
      // Blog filters
      blogFilters: {
        category: [String],
        author: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }],
        isPublished: Boolean,
        publishDate: {
          start: Date,
          end: Date
        },
        tags: [String],
        viewCount: {
          min: Number,
          max: Number
        }
      },
      // Purchase filters
      purchaseFilters: {
        status: [String],
        totalPrice: {
          min: Number,
          max: Number
        },
        purchaseDate: {
          start: Date,
          end: Date
        },
        tourId: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tour'
        }],
        userId: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }]
      },
      // Message filters
      messageFilters: {
        status: [String],
        priority: [String],
        category: [String],
        createdDate: {
          start: Date,
          end: Date
        },
        assignedTo: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }],
        isUrgent: Boolean,
        isSpam: Boolean
      },
      // Notification filters
      notificationFilters: {
        type: [String],
        category: [String],
        status: [String],
        priority: [String],
        createdDate: {
          start: Date,
          end: Date
        },
        recipient: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }]
      },
      // Instagram Tour filters
      instagramFilters: {
        category: [String],
        isActive: Boolean,
        isFeatured: Boolean,
        likes: {
          min: Number,
          max: Number
        },
        comments: {
          min: Number,
          max: Number
        },
        engagement: {
          min: Number,
          max: Number
        },
        postDate: {
          start: Date,
          end: Date
        }
      }
    },
    sortBy: {
      field: {
        type: String,
        enum: ['name', 'title', 'price', 'createdAt', 'updatedAt', 'rating', 'views', 'likes', 'comments', 'totalPrice', 'status', 'priority']
      },
      order: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'desc'
      }
    },
    pagination: {
      page: {
        type: Number,
        default: 1
      },
      limit: {
        type: Number,
        default: 20,
        min: 1,
        max: 100
      }
    }
  },
  results: {
    totalCount: {
      type: Number,
      default: 0
    },
    lastExecuted: {
      type: Date
    },
    executionTime: {
      type: Number // milliseconds
    },
    cachedResults: {
      type: Boolean,
      default: false
    },
    cacheExpiry: {
      type: Date
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    autoRefresh: {
      type: Boolean,
      default: false
    },
    refreshInterval: {
      type: Number, // minutes
      default: 30
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: false
      },
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: false
      },
      threshold: {
        type: Number,
        default: 10
      }
    }
  },
  analytics: {
    usageCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    averageExecutionTime: {
      type: Number,
      default: 0
    },
    resultCounts: [{
      date: Date,
      count: Number
    }]
  },
  permissions: {
    viewAccess: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    editAccess: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isShared: {
      type: Boolean,
      default: false
    }
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

// Virtual field for isRecentlyUsed
searchSchema.virtual('isRecentlyUsed').get(function() {
  if (!this.analytics.lastUsed) return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return this.analytics.lastUsed > sevenDaysAgo;
});

// Virtual field for isPopular
searchSchema.virtual('isPopular').get(function() {
  return this.analytics.usageCount > 50;
});

// Virtual field for isSlow
searchSchema.virtual('isSlow').get(function() {
  return this.analytics.averageExecutionTime > 5000; // 5 seconds
});

// Indexes for better performance
searchSchema.index({ type: 1, category: 1 });
searchSchema.index({ status: 1, createdAt: -1 });
searchSchema.index({ createdBy: 1 });
searchSchema.index({ 'analytics.usageCount': -1 });
searchSchema.index({ 'analytics.lastUsed': -1 });
searchSchema.index({ isDeleted: 1 });

// Pre-save middleware to update analytics
searchSchema.pre('save', function(next) {
  if (this.isModified('analytics.usageCount')) {
    this.analytics.lastUsed = new Date();
  }
  next();
});

// Static method to create tour search
searchSchema.statics.createTourSearch = function(data) {
  return this.create({
    ...data,
    type: 'tour',
    category: 'advanced',
    query: {
      searchTerm: data.searchTerm || '',
      filters: {
        tourFilters: {
          category: data.categories || [],
          priceRange: data.priceRange || {},
          duration: data.duration || {},
          location: data.locations || [],
          isActive: data.isActive,
          rating: data.rating || {},
          tags: data.tags || []
        },
        sortBy: data.sortBy || { field: 'createdAt', order: 'desc' },
        pagination: data.pagination || { page: 1, limit: 20 }
      }
    }
  });
};

// Static method to create user search
searchSchema.statics.createUserSearch = function(data) {
  return this.create({
    ...data,
    type: 'user',
    category: 'advanced',
    query: {
      searchTerm: data.searchTerm || '',
      filters: {
        userFilters: {
          role: data.roles || [],
          isActive: data.isActive,
          registrationDate: data.registrationDate || {},
          lastLoginDate: data.lastLoginDate || {},
          purchaseCount: data.purchaseCount || {},
          totalSpent: data.totalSpent || {}
        },
        sortBy: data.sortBy || { field: 'createdAt', order: 'desc' },
        pagination: data.pagination || { page: 1, limit: 20 }
      }
    }
  });
};

// Static method to create purchase search
searchSchema.statics.createPurchaseSearch = function(data) {
  return this.create({
    ...data,
    type: 'purchase',
    category: 'advanced',
    query: {
      searchTerm: data.searchTerm || '',
      filters: {
        purchaseFilters: {
          status: data.statuses || [],
          totalPrice: data.totalPrice || {},
          purchaseDate: data.purchaseDate || {},
          tourId: data.tourIds || [],
          userId: data.userIds || []
        },
        sortBy: data.sortBy || { field: 'createdAt', order: 'desc' },
        pagination: data.pagination || { page: 1, limit: 20 }
      }
    }
  });
};

// Static method to create message search
searchSchema.statics.createMessageSearch = function(data) {
  return this.create({
    ...data,
    type: 'message',
    category: 'advanced',
    query: {
      searchTerm: data.searchTerm || '',
      filters: {
        messageFilters: {
          status: data.statuses || [],
          priority: data.priorities || [],
          category: data.categories || [],
          createdDate: data.createdDate || {},
          assignedTo: data.assignedTo || [],
          isUrgent: data.isUrgent,
          isSpam: data.isSpam
        },
        sortBy: data.sortBy || { field: 'createdAt', order: 'desc' },
        pagination: data.pagination || { page: 1, limit: 20 }
      }
    }
  });
};

module.exports = mongoose.model('Search', searchSchema); 