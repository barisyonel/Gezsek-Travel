const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  nativeName: {
    type: String,
    required: true,
    maxlength: 50
  },
  flag: {
    type: String,
    maxlength: 10
  },
  direction: {
    type: String,
    enum: ['ltr', 'rtl'],
    default: 'ltr'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isRTL: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h'
    },
    currency: {
      code: {
        type: String,
        default: 'TRY'
      },
      symbol: {
        type: String,
        default: '₺'
      },
      position: {
        type: String,
        enum: ['before', 'after'],
        default: 'after'
      }
    },
    numberFormat: {
      decimalSeparator: {
        type: String,
        default: ','
      },
      thousandsSeparator: {
        type: String,
        default: '.'
      },
      decimalPlaces: {
        type: Number,
        default: 2
      }
    },
    timezone: {
      type: String,
      default: 'Europe/Istanbul'
    }
  },
  translations: {
    totalKeys: {
      type: Number,
      default: 0
    },
    translatedKeys: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date
    }
  },
  usage: {
    totalUsers: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
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

// Virtual field for translationProgress
languageSchema.virtual('translationProgress').get(function() {
  if (this.translations.totalKeys === 0) return 0;
  return Math.round((this.translations.translatedKeys / this.translations.totalKeys) * 100);
});

// Virtual field for isFullyTranslated
languageSchema.virtual('isFullyTranslated').get(function() {
  return this.translationProgress === 100;
});

// Virtual field for isRecentlyUsed
languageSchema.virtual('isRecentlyUsed').get(function() {
  if (!this.usage.lastUsed) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.usage.lastUsed > thirtyDaysAgo;
});

// Indexes for better performance
languageSchema.index({ code: 1 });
languageSchema.index({ status: 1, isDefault: 1 });
languageSchema.index({ 'translations.translatedKeys': -1 });
languageSchema.index({ 'usage.totalUsers': -1 });
languageSchema.index({ isDeleted: 1 });

// Pre-save middleware to ensure only one default language
languageSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Remove default flag from other languages
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Static method to create Turkish language
languageSchema.statics.createTurkish = function(data) {
  return this.create({
    code: 'TR',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr',
    status: 'active',
    isDefault: true,
    isRTL: false,
    settings: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: {
        code: 'TRY',
        symbol: '₺',
        position: 'after'
      },
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        decimalPlaces: 2
      },
      timezone: 'Europe/Istanbul'
    },
    ...data
  });
};

// Static method to create English language
languageSchema.statics.createEnglish = function(data) {
  return this.create({
    code: 'EN',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    status: 'active',
    isDefault: false,
    isRTL: false,
    settings: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: {
        code: 'USD',
        symbol: '$',
        position: 'before'
      },
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        decimalPlaces: 2
      },
      timezone: 'UTC'
    },
    ...data
  });
};

// Static method to create Arabic language
languageSchema.statics.createArabic = function(data) {
  return this.create({
    code: 'AR',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    status: 'active',
    isDefault: false,
    isRTL: true,
    settings: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: {
        code: 'SAR',
        symbol: 'ر.س',
        position: 'after'
      },
      numberFormat: {
        decimalSeparator: '.',
        thousandsSeparator: ',',
        decimalPlaces: 2
      },
      timezone: 'Asia/Riyadh'
    },
    ...data
  });
};

// Static method to create German language
languageSchema.statics.createGerman = function(data) {
  return this.create({
    code: 'DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    status: 'active',
    isDefault: false,
    isRTL: false,
    settings: {
      dateFormat: 'DD.MM.YYYY',
      timeFormat: '24h',
      currency: {
        code: 'EUR',
        symbol: '€',
        position: 'after'
      },
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: '.',
        decimalPlaces: 2
      },
      timezone: 'Europe/Berlin'
    },
    ...data
  });
};

// Static method to create French language
languageSchema.statics.createFrench = function(data) {
  return this.create({
    code: 'FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    status: 'active',
    isDefault: false,
    isRTL: false,
    settings: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: {
        code: 'EUR',
        symbol: '€',
        position: 'after'
      },
      numberFormat: {
        decimalSeparator: ',',
        thousandsSeparator: ' ',
        decimalPlaces: 2
      },
      timezone: 'Europe/Paris'
    },
    ...data
  });
};

module.exports = mongoose.model('Language', languageSchema); 