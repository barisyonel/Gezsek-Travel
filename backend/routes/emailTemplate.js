const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');
const auth = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Get all email templates (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      createdBy
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const templates = await EmailTemplate.find(query)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await EmailTemplate.countDocuments(query);

    res.json({
      templates,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ message: 'Email şablonları alınırken hata oluştu' });
  }
});

// Get email template by ID (admin)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ message: 'Email şablonu alınırken hata oluştu' });
  }
});

// Create email template (admin)
router.post('/admin', auth, async (req, res) => {
  try {
    const {
      name,
      subject,
      description,
      category,
      type,
      content,
      variables,
      settings,
      design,
      permissions,
      tags
    } = req.body;

    // Validation
    if (!name || !subject || !category || !content?.html) {
      return res.status(400).json({ 
        message: 'İsim, konu, kategori ve HTML içerik alanları zorunludur' 
      });
    }

    // Check if template name already exists
    const existingTemplate = await EmailTemplate.findOne({ name, isDeleted: false });
    if (existingTemplate) {
      return res.status(400).json({ message: 'Bu isimde bir şablon zaten mevcut' });
    }

    const templateData = {
      name,
      subject,
      description,
      category,
      type: type || 'html',
      content,
      variables: variables || [],
      settings: settings || {},
      design: design || {},
      createdBy: req.user._id,
      permissions: permissions || {},
      tags: tags || []
    };

    const template = new EmailTemplate(templateData);
    await template.save();

    const populatedTemplate = await EmailTemplate.findById(template._id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email');

    res.status(201).json(populatedTemplate);
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({ message: 'Email şablonu oluşturulurken hata oluştu' });
  }
});

// Update email template (admin)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('permissions.viewAccess', 'name email')
    .populate('permissions.editAccess', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    res.json(template);
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({ message: 'Email şablonu güncellenirken hata oluştu' });
  }
});

// Delete email template (admin)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    res.json({ message: 'Email şablonu silindi' });
  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({ message: 'Email şablonu silinirken hata oluştu' });
  }
});

// Duplicate email template (admin)
router.post('/admin/:id/duplicate', auth, async (req, res) => {
  try {
    const originalTemplate = await EmailTemplate.findById(req.params.id);
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    const duplicateData = {
      ...originalTemplate.toObject(),
      _id: undefined,
      name: `${originalTemplate.name} (Kopya)`,
      status: 'draft',
      createdBy: req.user._id,
      usage: {
        totalSent: 0,
        successRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0
      },
      version: {
        current: 1,
        history: []
      }
    };

    const duplicateTemplate = new EmailTemplate(duplicateData);
    await duplicateTemplate.save();

    const populatedTemplate = await EmailTemplate.findById(duplicateTemplate._id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email');

    res.status(201).json(populatedTemplate);
  } catch (error) {
    console.error('Duplicate email template error:', error);
    res.status(500).json({ message: 'Email şablonu kopyalanırken hata oluştu' });
  }
});

// Preview email template (admin)
router.post('/admin/:id/preview', auth, async (req, res) => {
  try {
    const { variables = {} } = req.body;
    
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    // Simple variable replacement (in a real app, you'd use a proper templating engine)
    let previewHtml = template.content.html;
    let previewText = template.content.text;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
      if (previewText) {
        previewText = previewText.replace(regex, value);
      }
    });

    res.json({
      html: previewHtml,
      text: previewText,
      subject: template.subject
    });
  } catch (error) {
    console.error('Preview email template error:', error);
    res.status(500).json({ message: 'Email önizleme oluşturulurken hata oluştu' });
  }
});

// Test email template (admin)
router.post('/admin/:id/test', auth, async (req, res) => {
  try {
    const { testEmail, variables = {} } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email adresi gereklidir' });
    }

    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    // Prepare email content with variables
    let emailHtml = template.content.html;
    let emailText = template.content.text;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      emailHtml = emailHtml.replace(regex, value);
      if (emailText) {
        emailText = emailText.replace(regex, value);
      }
    });

    // Send test email
    await sendEmail({
      to: testEmail,
      subject: template.subject,
      html: emailHtml,
      text: emailText,
      from: template.settings.senderEmail || process.env.EMAIL_FROM,
      replyTo: template.settings.replyTo
    });

    // Update usage statistics
    template.usage.totalSent += 1;
    template.usage.lastSent = new Date();
    await template.save();

    res.json({ message: 'Test email başarıyla gönderildi' });
  } catch (error) {
    console.error('Test email template error:', error);
    res.status(500).json({ message: 'Test email gönderilirken hata oluştu' });
  }
});

// Get template analytics (admin)
router.get('/admin/:id/analytics', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    const analytics = {
      totalSent: template.usage.totalSent,
      successRate: template.usage.successRate,
      averageOpenRate: template.usage.averageOpenRate,
      averageClickRate: template.usage.averageClickRate,
      lastSent: template.usage.lastSent,
      isPopular: template.isPopular,
      isRecentlyUsed: template.isRecentlyUsed,
      successRateColor: template.successRateColor
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get template analytics error:', error);
    res.status(500).json({ message: 'Şablon analitikleri alınırken hata oluştu' });
  }
});

// Get template version history (admin)
router.get('/admin/:id/versions', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    res.json({
      currentVersion: template.version.current,
      history: template.version.history
    });
  } catch (error) {
    console.error('Get template versions error:', error);
    res.status(500).json({ message: 'Şablon versiyonları alınırken hata oluştu' });
  }
});

// Restore template version (admin)
router.post('/admin/:id/restore/:version', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Email şablonu bulunamadı' });
    }

    const versionNumber = parseInt(req.params.version);
    const versionToRestore = template.version.history.find(v => v.version === versionNumber);
    
    if (!versionToRestore) {
      return res.status(404).json({ message: 'Versiyon bulunamadı' });
    }

    // Restore content and settings
    template.content = versionToRestore.content;
    template.variables = versionToRestore.variables;
    template.settings = versionToRestore.settings;
    template.design = versionToRestore.design;

    await template.save();

    const updatedTemplate = await EmailTemplate.findById(template._id)
      .populate('createdBy', 'name email')
      .populate('permissions.viewAccess', 'name email')
      .populate('permissions.editAccess', 'name email');

    res.json(updatedTemplate);
  } catch (error) {
    console.error('Restore template version error:', error);
    res.status(500).json({ message: 'Versiyon geri yüklenirken hata oluştu' });
  }
});

// Get template categories (admin)
router.get('/admin/categories', auth, async (req, res) => {
  try {
    const categories = [
      { value: 'notification', label: 'Bildirim', icon: '🔔' },
      { value: 'reservation', label: 'Rezervasyon', icon: '📅' },
      { value: 'marketing', label: 'Pazarlama', icon: '📢' },
      { value: 'system', label: 'Sistem', icon: '⚙️' },
      { value: 'welcome', label: 'Hoş Geldiniz', icon: '👋' },
      { value: 'reminder', label: 'Hatırlatma', icon: '⏰' },
      { value: 'custom', label: 'Özel', icon: '🎨' }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get template categories error:', error);
    res.status(500).json({ message: 'Kategoriler alınırken hata oluştu' });
  }
});

// Get template themes (admin)
router.get('/admin/themes', auth, async (req, res) => {
  try {
    const themes = [
      { value: 'default', label: 'Varsayılan', colors: { primary: '#667eea', secondary: '#764ba2' } },
      { value: 'modern', label: 'Modern', colors: { primary: '#28a745', secondary: '#20c997' } },
      { value: 'classic', label: 'Klasik', colors: { primary: '#6c757d', secondary: '#495057' } },
      { value: 'minimal', label: 'Minimal', colors: { primary: '#f8f9fa', secondary: '#e9ecef' } },
      { value: 'colorful', label: 'Renkli', colors: { primary: '#fd7e14', secondary: '#dc3545' } }
    ];

    res.json(themes);
  } catch (error) {
    console.error('Get template themes error:', error);
    res.status(500).json({ message: 'Temalar alınırken hata oluştu' });
  }
});

// Get popular templates (admin)
router.get('/admin/popular', auth, async (req, res) => {
  try {
    const popularTemplates = await EmailTemplate.find({ 
      isDeleted: false,
      'usage.totalSent': { $gt: 0 }
    })
    .populate('createdBy', 'name email')
    .sort({ 'usage.totalSent': -1 })
    .limit(10);

    res.json(popularTemplates);
  } catch (error) {
    console.error('Get popular templates error:', error);
    res.status(500).json({ message: 'Popüler şablonlar alınırken hata oluştu' });
  }
});

// Get recently used templates (admin)
router.get('/admin/recent', auth, async (req, res) => {
  try {
    const recentTemplates = await EmailTemplate.find({ 
      isDeleted: false,
      'usage.lastSent': { $exists: true }
    })
    .populate('createdBy', 'name email')
    .sort({ 'usage.lastSent': -1 })
    .limit(10);

    res.json(recentTemplates);
  } catch (error) {
    console.error('Get recent templates error:', error);
    res.status(500).json({ message: 'Son kullanılan şablonlar alınırken hata oluştu' });
  }
});

// Bulk operations (admin)
router.post('/admin/bulk', auth, async (req, res) => {
  try {
    const { action, templateIds } = req.body;

    if (!action || !templateIds || !Array.isArray(templateIds)) {
      return res.status(400).json({ message: 'Geçersiz işlem parametreleri' });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await EmailTemplate.updateMany(
          { _id: { $in: templateIds } },
          { status: 'active' }
        );
        break;
      case 'deactivate':
        result = await EmailTemplate.updateMany(
          { _id: { $in: templateIds } },
          { status: 'inactive' }
        );
        break;
      case 'delete':
        result = await EmailTemplate.updateMany(
          { _id: { $in: templateIds } },
          { isDeleted: true }
        );
        break;
      default:
        return res.status(400).json({ message: 'Geçersiz işlem' });
    }

    res.json({ 
      message: `${result.modifiedCount} şablon başarıyla güncellendi`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk operations error:', error);
    res.status(500).json({ message: 'Toplu işlemler sırasında hata oluştu' });
  }
});

module.exports = router; 