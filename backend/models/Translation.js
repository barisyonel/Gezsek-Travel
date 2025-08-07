const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    maxlength: 200
  },
  languageCode: {
    type: String,
    required: true,
    maxlength: 10,
    uppercase: true
  },
  namespace: {
    type: String,
    required: true,
    maxlength: 50,
    default: 'common'
  },
  value: {
    type: String,
    required: true,
    maxlength: 1000
  },
  description: {
    type: String,
    maxlength: 500
  },
  context: {
    type: String,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['translated', 'pending', 'needs_review', 'auto_translated'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  metadata: {
    sourceLanguage: {
      type: String,
      maxlength: 10,
      default: 'TR'
    },
    originalValue: {
      type: String,
      maxlength: 1000
    },
    translationEngine: {
      type: String,
      enum: ['manual', 'google', 'deepl', 'openai', 'custom'],
      default: 'manual'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    tags: [{
      type: String,
      maxlength: 30
    }],
    usage: {
      count: {
        type: Number,
        default: 0
      },
      lastUsed: {
        type: Date
      }
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

// Virtual field for isReviewed
translationSchema.virtual('isReviewed').get(function() {
  return this.status === 'translated' && this.reviewedBy;
});

// Virtual field for isAutoTranslated
translationSchema.virtual('isAutoTranslated').get(function() {
  return this.status === 'auto_translated';
});

// Virtual field for needsReview
translationSchema.virtual('needsReview').get(function() {
  return this.status === 'needs_review' || this.status === 'auto_translated';
});

// Compound index for efficient lookups
translationSchema.index({ languageCode: 1, namespace: 1, key: 1 }, { unique: true });
translationSchema.index({ languageCode: 1, status: 1 });
translationSchema.index({ namespace: 1, status: 1 });
translationSchema.index({ 'metadata.tags': 1 });
translationSchema.index({ isDeleted: 1 });

// Pre-save middleware to update review info
translationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'translated' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to create common translations
translationSchema.statics.createCommonTranslations = function(languageCode, translations, createdBy) {
  const translationData = Object.entries(translations).map(([key, value]) => ({
    key,
    languageCode,
    namespace: 'common',
    value,
    status: 'translated',
    createdBy
  }));

  return this.insertMany(translationData);
};

// Static method to create navigation translations
translationSchema.statics.createNavigationTranslations = function(languageCode, translations, createdBy) {
  const translationData = Object.entries(translations).map(([key, value]) => ({
    key,
    languageCode,
    namespace: 'navigation',
    value,
    status: 'translated',
    createdBy
  }));

  return this.insertMany(translationData);
};

// Static method to create form translations
translationSchema.statics.createFormTranslations = function(languageCode, translations, createdBy) {
  const translationData = Object.entries(translations).map(([key, value]) => ({
    key,
    languageCode,
    namespace: 'forms',
    value,
    status: 'translated',
    createdBy
  }));

  return this.insertMany(translationData);
};

// Static method to create error translations
translationSchema.statics.createErrorTranslations = function(languageCode, translations, createdBy) {
  const translationData = Object.entries(translations).map(([key, value]) => ({
    key,
    languageCode,
    namespace: 'errors',
    value,
    status: 'translated',
    createdBy
  }));

  return this.insertMany(translationData);
};

// Static method to create email translations
translationSchema.statics.createEmailTranslations = function(languageCode, translations, createdBy) {
  const translationData = Object.entries(translations).map(([key, value]) => ({
    key,
    languageCode,
    namespace: 'emails',
    value,
    status: 'translated',
    createdBy
  }));

  return this.insertMany(translationData);
};

// Static method to get all translations for a language
translationSchema.statics.getLanguageTranslations = function(languageCode, namespace = null) {
  const query = { languageCode, isDeleted: false };
  if (namespace) {
    query.namespace = namespace;
  }

  return this.find(query).sort({ namespace: 1, key: 1 });
};

// Static method to get translation statistics
translationSchema.statics.getTranslationStats = function(languageCode) {
  return this.aggregate([
    { $match: { languageCode, isDeleted: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get namespace statistics
translationSchema.statics.getNamespaceStats = function(languageCode) {
  return this.aggregate([
    { $match: { languageCode, isDeleted: false } },
    {
      $group: {
        _id: '$namespace',
        total: { $sum: 1 },
        translated: {
          $sum: {
            $cond: [{ $eq: ['$status', 'translated'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        needsReview: {
          $sum: {
            $cond: [{ $eq: ['$status', 'needs_review'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        progress: {
          $multiply: [
            { $divide: ['$translated', '$total'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Translation', translationSchema); 