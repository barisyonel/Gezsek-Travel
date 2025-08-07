const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['notification', 'reservation', 'marketing', 'system', 'welcome', 'reminder', 'custom'],
    required: true
  },
  type: {
    type: String,
    enum: ['html', 'text', 'mjml'],
    default: 'html'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    html: {
      type: String,
      required: true
    },
    text: {
      type: String
    },
    mjml: {
      type: String
    }
  },
  variables: [{
    name: {
      type: String,
      required: true,
      maxlength: 50
    },
    description: {
      type: String,
      maxlength: 200
    },
    type: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean', 'array', 'object'],
      default: 'string'
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: String
    },
    example: {
      type: String
    }
  }],
  settings: {
    senderName: {
      type: String,
      maxlength: 100
    },
    senderEmail: {
      type: String,
      maxlength: 100
    },
    replyTo: {
      type: String,
      maxlength: 100
    },
    cc: [{
      type: String,
      maxlength: 100
    }],
    bcc: [{
      type: String,
      maxlength: 100
    }],
    attachments: {
      enabled: {
        type: Boolean,
        default: false
      },
      files: [{
        name: String,
        path: String,
        type: String,
        size: Number
      }]
    },
    tracking: {
      enabled: {
        type: Boolean,
        default: true
      },
      openTracking: {
        type: Boolean,
        default: true
      },
      clickTracking: {
        type: Boolean,
        default: true
      }
    },
    scheduling: {
      enabled: {
        type: Boolean,
        default: false
      },
      timezone: {
        type: String,
        default: 'Europe/Istanbul'
      }
    }
  },
  design: {
    theme: {
      type: String,
      enum: ['default', 'modern', 'classic', 'minimal', 'colorful'],
      default: 'default'
    },
    colors: {
      primary: {
        type: String,
        default: '#667eea'
      },
      secondary: {
        type: String,
        default: '#764ba2'
      },
      background: {
        type: String,
        default: '#ffffff'
      },
      text: {
        type: String,
        default: '#333333'
      }
    },
    layout: {
      width: {
        type: Number,
        default: 600
      },
      padding: {
        type: Number,
        default: 20
      },
      borderRadius: {
        type: Number,
        default: 8
      }
    },
    fonts: {
      heading: {
        type: String,
        default: 'Arial, sans-serif'
      },
      body: {
        type: String,
        default: 'Arial, sans-serif'
      }
    }
  },
  preview: {
    thumbnail: {
      type: String
    },
    lastGenerated: {
      type: Date
    }
  },
  usage: {
    totalSent: {
      type: Number,
      default: 0
    },
    lastSent: {
      type: Date
    },
    successRate: {
      type: Number,
      default: 0
    },
    averageOpenRate: {
      type: Number,
      default: 0
    },
    averageClickRate: {
      type: Number,
      default: 0
    }
  },
  version: {
    current: {
      type: Number,
      default: 1
    },
    history: [{
      version: Number,
      content: {
        html: String,
        text: String,
        mjml: String
      },
      variables: [{
        name: String,
        description: String,
        type: String,
        required: Boolean,
        defaultValue: String,
        example: String
      }],
      settings: mongoose.Schema.Types.Mixed,
      design: mongoose.Schema.Types.Mixed,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      changeLog: String
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
    isPublic: {
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

// Virtual field for isPopular
emailTemplateSchema.virtual('isPopular').get(function() {
  return this.usage.totalSent > 100;
});

// Virtual field for isRecentlyUsed
emailTemplateSchema.virtual('isRecentlyUsed').get(function() {
  if (!this.usage.lastSent) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.usage.lastSent > thirtyDaysAgo;
});

// Virtual field for successRateColor
emailTemplateSchema.virtual('successRateColor').get(function() {
  if (this.usage.successRate >= 95) return '#28a745';
  if (this.usage.successRate >= 80) return '#ffc107';
  return '#dc3545';
});

// Indexes for better performance
emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ category: 1, status: 1 });
emailTemplateSchema.index({ createdBy: 1 });
emailTemplateSchema.index({ 'usage.totalSent': -1 });
emailTemplateSchema.index({ isDeleted: 1 });

// Pre-save middleware to update version history
emailTemplateSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('variables') || this.isModified('settings') || this.isModified('design')) {
    // Create version history entry
    const historyEntry = {
      version: this.version.current + 1,
      content: {
        html: this.content.html,
        text: this.content.text,
        mjml: this.content.mjml
      },
      variables: this.variables,
      settings: this.settings,
      design: this.design,
      updatedAt: new Date()
    };

    this.version.history.push(historyEntry);
    this.version.current += 1;
  }
  next();
});

// Static method to create notification template
emailTemplateSchema.statics.createNotificationTemplate = function(data) {
  return this.create({
    ...data,
    category: 'notification',
    type: 'html',
    content: {
      html: data.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">{{title}}</h2>
          <p>{{message}}</p>
          {{#if actionUrl}}
            <a href="{{actionUrl}}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              {{actionText}}
            </a>
          {{/if}}
        </div>
      `,
      text: data.text || `{{title}}\n\n{{message}}\n\n{{#if actionUrl}}{{actionUrl}}{{/if}}`
    },
    variables: [
      { name: 'title', description: 'Bildirim başlığı', type: 'string', required: true },
      { name: 'message', description: 'Bildirim mesajı', type: 'string', required: true },
      { name: 'actionUrl', description: 'Eylem URL\'si', type: 'string', required: false },
      { name: 'actionText', description: 'Eylem butonu metni', type: 'string', required: false }
    ]
  });
};

// Static method to create reservation template
emailTemplateSchema.statics.createReservationTemplate = function(data) {
  return this.create({
    ...data,
    category: 'reservation',
    type: 'html',
    content: {
      html: data.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Rezervasyon Onayı</h2>
          <p>Sayın {{customerName}},</p>
          <p>Rezervasyonunuz başarıyla oluşturulmuştur.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h3>Rezervasyon Detayları:</h3>
            <p><strong>Tur:</strong> {{tourName}}</p>
            <p><strong>Tarih:</strong> {{tourDate}}</p>
            <p><strong>Kişi Sayısı:</strong> {{personCount}}</p>
            <p><strong>Toplam Tutar:</strong> {{totalAmount}}</p>
          </div>
        </div>
      `,
      text: data.text || `Rezervasyon Onayı\n\nSayın {{customerName}},\n\nRezervasyonunuz başarıyla oluşturulmuştur.\n\nTur: {{tourName}}\nTarih: {{tourDate}}\nKişi Sayısı: {{personCount}}\nToplam Tutar: {{totalAmount}}`
    },
    variables: [
      { name: 'customerName', description: 'Müşteri adı', type: 'string', required: true },
      { name: 'tourName', description: 'Tur adı', type: 'string', required: true },
      { name: 'tourDate', description: 'Tur tarihi', type: 'date', required: true },
      { name: 'personCount', description: 'Kişi sayısı', type: 'number', required: true },
      { name: 'totalAmount', description: 'Toplam tutar', type: 'string', required: true }
    ]
  });
};

// Static method to create welcome template
emailTemplateSchema.statics.createWelcomeTemplate = function(data) {
  return this.create({
    ...data,
    category: 'welcome',
    type: 'html',
    content: {
      html: data.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Hoş Geldiniz!</h2>
          <p>Merhaba {{customerName}},</p>
          <p>Gezsekk ailesine hoş geldiniz! Artık harika turlarımızı keşfedebilirsiniz.</p>
          <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Turları Keşfet
          </a>
        </div>
      `,
      text: data.text || `Hoş Geldiniz!\n\nMerhaba {{customerName}},\n\nGezsekk ailesine hoş geldiniz! Artık harika turlarımızı keşfedebilirsiniz.\n\n{{dashboardUrl}}`
    },
    variables: [
      { name: 'customerName', description: 'Müşteri adı', type: 'string', required: true },
      { name: 'dashboardUrl', description: 'Dashboard URL\'si', type: 'string', required: true }
    ]
  });
};

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema); 