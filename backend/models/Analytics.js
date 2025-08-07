const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user_activity', 'tour_analytics', 'revenue_analytics', 'performance_analytics', 'security_analytics', 'custom_report'],
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  filters: {
    dateRange: {
      start: Date,
      end: Date
    },
    userType: {
      type: String,
      enum: ['all', 'admin', 'user', 'guest']
    },
    tourCategory: {
      type: String,
      maxlength: 50
    },
    location: {
      type: String,
      maxlength: 100
    },
    customFilters: {
      type: Map,
      of: String
    }
  },
  metrics: {
    totalRecords: {
      type: Number,
      default: 0
    },
    processedRecords: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    },
    processingTime: {
      type: Number,
      default: 0
    }
  },
  visualization: {
    chartType: {
      type: String,
      enum: ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'table', 'heatmap', 'gauge', 'funnel'],
      default: 'bar'
    },
    chartConfig: {
      type: mongoose.Schema.Types.Mixed
    },
    colors: [{
      type: String,
      maxlength: 7
    }],
    dimensions: {
      width: {
        type: Number,
        default: 800
      },
      height: {
        type: Number,
        default: 400
      }
    }
  },
  schedule: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'daily'
    },
    nextRun: {
      type: Date
    },
    lastRun: {
      type: Date
    },
    recipients: [{
      email: {
        type: String,
        maxlength: 100
      },
      name: {
        type: String,
        maxlength: 100
      }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    maxlength: 50
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

// Virtual field for isScheduled
analyticsSchema.virtual('isScheduled').get(function() {
  return this.schedule.isScheduled;
});

// Virtual field for isOverdue
analyticsSchema.virtual('isOverdue').get(function() {
  if (!this.schedule.isScheduled || !this.schedule.nextRun) return false;
  return new Date() > this.schedule.nextRun;
});

// Virtual field for processingStatus
analyticsSchema.virtual('processingStatus').get(function() {
  if (this.metrics.errorCount > 0) return 'error';
  if (this.metrics.processedRecords === this.metrics.totalRecords) return 'completed';
  if (this.metrics.processedRecords > 0) return 'processing';
  return 'pending';
});

// Indexes for better performance
analyticsSchema.index({ type: 1, status: 1 });
analyticsSchema.index({ createdBy: 1, createdAt: -1 });
analyticsSchema.index({ 'schedule.nextRun': 1 });
analyticsSchema.index({ tags: 1 });
analyticsSchema.index({ isDeleted: 1 });

// Pre-save middleware to update lastModifiedBy
analyticsSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // This should be updated with actual user ID
  }
  next();
});

// Static method to create user activity analytics
analyticsSchema.statics.createUserActivityAnalytics = function(data) {
  return this.create({
    type: 'user_activity',
    name: 'User Activity Report',
    description: 'Comprehensive user activity analysis',
    data: data,
    visualization: {
      chartType: 'line',
      chartConfig: {
        xAxis: { title: 'Date' },
        yAxis: { title: 'Activity Count' }
      }
    },
    ...data
  });
};

// Static method to create tour analytics
analyticsSchema.statics.createTourAnalytics = function(data) {
  return this.create({
    type: 'tour_analytics',
    name: 'Tour Performance Report',
    description: 'Tour booking and performance analysis',
    data: data,
    visualization: {
      chartType: 'bar',
      chartConfig: {
        xAxis: { title: 'Tour Name' },
        yAxis: { title: 'Bookings' }
      }
    },
    ...data
  });
};

// Static method to create revenue analytics
analyticsSchema.statics.createRevenueAnalytics = function(data) {
  return this.create({
    type: 'revenue_analytics',
    name: 'Revenue Analysis Report',
    description: 'Revenue trends and analysis',
    data: data,
    visualization: {
      chartType: 'area',
      chartConfig: {
        xAxis: { title: 'Date' },
        yAxis: { title: 'Revenue (₺)' }
      }
    },
    ...data
  });
};

// Static method to create performance analytics
analyticsSchema.statics.createPerformanceAnalytics = function(data) {
  return this.create({
    type: 'performance_analytics',
    name: 'System Performance Report',
    description: 'System performance and metrics analysis',
    data: data,
    visualization: {
      chartType: 'line',
      chartConfig: {
        xAxis: { title: 'Time' },
        yAxis: { title: 'Performance Metric' }
      }
    },
    ...data
  });
};

// Static method to create security analytics
analyticsSchema.statics.createSecurityAnalytics = function(data) {
  return this.create({
    type: 'security_analytics',
    name: 'Security Analysis Report',
    description: 'Security events and threat analysis',
    data: data,
    visualization: {
      chartType: 'heatmap',
      chartConfig: {
        xAxis: { title: 'Time' },
        yAxis: { title: 'Security Event Type' }
      }
    },
    ...data
  });
};

// Static method to get analytics by type
analyticsSchema.statics.getByType = function(type, limit = 10) {
  return this.find({ 
    type, 
    status: 'active',
    isDeleted: false 
  })
  .populate('createdBy', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get scheduled analytics
analyticsSchema.statics.getScheduledAnalytics = function() {
  return this.find({
    'schedule.isScheduled': true,
    'schedule.nextRun': { $lte: new Date() },
    status: 'active',
    isDeleted: false
  });
};

// Static method to get analytics statistics
analyticsSchema.statics.getAnalyticsStats = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        scheduledCount: {
          $sum: { $cond: [{ $eq: ['$schedule.isScheduled', true] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema); 