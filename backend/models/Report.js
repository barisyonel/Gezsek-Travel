const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
    enum: ['user_report', 'tour_report', 'revenue_report', 'performance_report', 'security_report', 'custom_report'],
    required: true
  },
  template: {
    type: String,
    enum: ['standard', 'executive', 'detailed', 'summary', 'custom'],
    default: 'standard'
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json', 'html'],
    default: 'pdf'
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
    status: {
      type: String,
      maxlength: 50
    },
    customFilters: {
      type: Map,
      of: String
    }
  },
  sections: [{
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    type: {
      type: String,
      enum: ['text', 'table', 'chart', 'metric', 'image'],
      required: true
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  }],
  styling: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'corporate', 'modern', 'minimal'],
      default: 'light'
    },
    colors: {
      primary: {
        type: String,
        default: '#007bff'
      },
      secondary: {
        type: String,
        default: '#6c757d'
      },
      accent: {
        type: String,
        default: '#28a745'
      }
    },
    font: {
      family: {
        type: String,
        default: 'Arial, sans-serif'
      },
      size: {
        type: String,
        default: '12px'
      }
    },
    logo: {
      type: String,
      maxlength: 200
    },
    header: {
      title: {
        type: String,
        maxlength: 100
      },
      subtitle: {
        type: String,
        maxlength: 200
      },
      showDate: {
        type: Boolean,
        default: true
      },
      showPageNumbers: {
        type: Boolean,
        default: true
      }
    },
    footer: {
      text: {
        type: String,
        maxlength: 200
      },
      showTotalPages: {
        type: Boolean,
        default: true
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
      },
      format: {
        type: String,
        enum: ['pdf', 'excel', 'csv'],
        default: 'pdf'
      }
    }],
    emailTemplate: {
      subject: {
        type: String,
        maxlength: 200
      },
      body: {
        type: String,
        maxlength: 2000
      }
    }
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
  metadata: {
    generatedAt: {
      type: Date
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fileSize: {
      type: Number,
      min: 0
    },
    pageCount: {
      type: Number,
      min: 0
    },
    recordCount: {
      type: Number,
      min: 0
    },
    processingTime: {
      type: Number,
      min: 0
    }
  },
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
reportSchema.virtual('isScheduled').get(function() {
  return this.schedule.isScheduled;
});

// Virtual field for isOverdue
reportSchema.virtual('isOverdue').get(function() {
  if (!this.schedule.isScheduled || !this.schedule.nextRun) return false;
  return new Date() > this.schedule.nextRun;
});

// Virtual field for isGenerated
reportSchema.virtual('isGenerated').get(function() {
  return !!this.metadata.generatedAt;
});

// Virtual field for fileSizeFormatted
reportSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.metadata.fileSize) return 'N/A';
  const bytes = this.metadata.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Indexes for better performance
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ createdBy: 1, createdAt: -1 });
reportSchema.index({ 'schedule.nextRun': 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ isDeleted: 1 });

// Pre-save middleware to update lastModifiedBy
reportSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // This should be updated with actual user ID
  }
  next();
});

// Static method to create user report
reportSchema.statics.createUserReport = function(data) {
  return this.create({
    type: 'user_report',
    name: 'User Activity Report',
    description: 'Comprehensive user activity and behavior analysis',
    template: 'detailed',
    format: 'pdf',
    data: data,
    sections: [
      {
        title: 'Executive Summary',
        type: 'text',
        content: 'User activity overview and key metrics',
        order: 1
      },
      {
        title: 'User Statistics',
        type: 'table',
        content: 'User registration, login, and activity data',
        order: 2
      },
      {
        title: 'Activity Trends',
        type: 'chart',
        content: 'User activity over time',
        order: 3
      }
    ],
    ...data
  });
};

// Static method to create tour report
reportSchema.statics.createTourReport = function(data) {
  return this.create({
    type: 'tour_report',
    name: 'Tour Performance Report',
    description: 'Tour booking, revenue, and performance analysis',
    template: 'executive',
    format: 'pdf',
    data: data,
    sections: [
      {
        title: 'Tour Overview',
        type: 'text',
        content: 'Tour performance summary',
        order: 1
      },
      {
        title: 'Booking Statistics',
        type: 'table',
        content: 'Tour booking data and trends',
        order: 2
      },
      {
        title: 'Revenue Analysis',
        type: 'chart',
        content: 'Revenue trends and projections',
        order: 3
      }
    ],
    ...data
  });
};

// Static method to create revenue report
reportSchema.statics.createRevenueReport = function(data) {
  return this.create({
    type: 'revenue_report',
    name: 'Revenue Analysis Report',
    description: 'Revenue trends, projections, and financial analysis',
    template: 'executive',
    format: 'pdf',
    data: data,
    sections: [
      {
        title: 'Revenue Summary',
        type: 'text',
        content: 'Revenue overview and key financial metrics',
        order: 1
      },
      {
        title: 'Revenue Trends',
        type: 'chart',
        content: 'Revenue trends over time',
        order: 2
      },
      {
        title: 'Revenue by Category',
        type: 'table',
        content: 'Revenue breakdown by tour category',
        order: 3
      }
    ],
    ...data
  });
};

// Static method to create performance report
reportSchema.statics.createPerformanceReport = function(data) {
  return this.create({
    type: 'performance_report',
    name: 'System Performance Report',
    description: 'System performance, metrics, and optimization analysis',
    template: 'detailed',
    format: 'pdf',
    data: data,
    sections: [
      {
        title: 'Performance Overview',
        type: 'text',
        content: 'System performance summary',
        order: 1
      },
      {
        title: 'Performance Metrics',
        type: 'table',
        content: 'Key performance indicators',
        order: 2
      },
      {
        title: 'Performance Trends',
        type: 'chart',
        content: 'Performance trends over time',
        order: 3
      }
    ],
    ...data
  });
};

// Static method to create security report
reportSchema.statics.createSecurityReport = function(data) {
  return this.create({
    type: 'security_report',
    name: 'Security Analysis Report',
    description: 'Security events, threats, and risk analysis',
    template: 'detailed',
    format: 'pdf',
    data: data,
    sections: [
      {
        title: 'Security Overview',
        type: 'text',
        content: 'Security events summary',
        order: 1
      },
      {
        title: 'Security Events',
        type: 'table',
        content: 'Security events and incidents',
        order: 2
      },
      {
        title: 'Threat Analysis',
        type: 'chart',
        content: 'Threat trends and patterns',
        order: 3
      }
    ],
    ...data
  });
};

// Static method to get reports by type
reportSchema.statics.getByType = function(type, limit = 10) {
  return this.find({ 
    type, 
    status: 'active',
    isDeleted: false 
  })
  .populate('createdBy', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get scheduled reports
reportSchema.statics.getScheduledReports = function() {
  return this.find({
    'schedule.isScheduled': true,
    'schedule.nextRun': { $lte: new Date() },
    status: 'active',
    isDeleted: false
  });
};

// Static method to get report statistics
reportSchema.statics.getReportStats = function() {
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
        },
        generatedCount: {
          $sum: { $cond: [{ $ne: ['$metadata.generatedAt', null] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Report', reportSchema); 