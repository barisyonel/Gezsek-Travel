const express = require('express');
const router = express.Router();
const Language = require('../models/Language');
const Translation = require('../models/Translation');
const auth = require('../middleware/auth');

// Get all languages (public)
router.get('/', async (req, res) => {
  try {
    const languages = await Language.find({ 
      status: 'active', 
      isDeleted: false 
    }).sort({ isDefault: -1, name: 1 });

    res.json(languages);
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Diller alınırken hata oluştu' });
  }
});

// Get all languages (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    let query = { isDeleted: false };

    // Filters
    if (status) query.status = status;

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nativeName: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const languages = await Language.find(query)
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Language.countDocuments(query);

    res.json({
      languages,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Diller alınırken hata oluştu' });
  }
});

// Get language by code (public)
router.get('/:code', async (req, res) => {
  try {
    const language = await Language.findOne({ 
      code: req.params.code.toUpperCase(),
      status: 'active',
      isDeleted: false 
    });

    if (!language) {
      return res.status(404).json({ message: 'Dil bulunamadı' });
    }

    res.json(language);
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({ message: 'Dil alınırken hata oluştu' });
  }
});

// Get language by code (admin)
router.get('/admin/:code', auth, async (req, res) => {
  try {
    const language = await Language.findOne({ 
      code: req.params.code.toUpperCase(),
      isDeleted: false 
    }).populate('createdBy', 'name email');

    if (!language) {
      return res.status(404).json({ message: 'Dil bulunamadı' });
    }

    res.json(language);
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({ message: 'Dil alınırken hata oluştu' });
  }
});

// Create language (admin)
router.post('/admin', auth, async (req, res) => {
  try {
    const {
      code,
      name,
      nativeName,
      flag,
      direction,
      status,
      isDefault,
      settings
    } = req.body;

    // Validation
    if (!code || !name || !nativeName) {
      return res.status(400).json({ 
        message: 'Kod, isim ve yerel isim alanları zorunludur' 
      });
    }

    // Check if language code already exists
    const existingLanguage = await Language.findOne({ 
      code: code.toUpperCase(),
      isDeleted: false 
    });
    if (existingLanguage) {
      return res.status(400).json({ message: 'Bu dil kodu zaten mevcut' });
    }

    const languageData = {
      code: code.toUpperCase(),
      name,
      nativeName,
      flag,
      direction: direction || 'ltr',
      status: status || 'draft',
      isDefault: isDefault || false,
      settings: settings || {},
      createdBy: req.user._id
    };

    const language = new Language(languageData);
    await language.save();

    const populatedLanguage = await Language.findById(language._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedLanguage);
  } catch (error) {
    console.error('Create language error:', error);
    res.status(500).json({ message: 'Dil oluşturulurken hata oluştu' });
  }
});

// Update language (admin)
router.put('/admin/:code', auth, async (req, res) => {
  try {
    const language = await Language.findOneAndUpdate(
      { code: req.params.code.toUpperCase(), isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!language) {
      return res.status(404).json({ message: 'Dil bulunamadı' });
    }

    res.json(language);
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ message: 'Dil güncellenirken hata oluştu' });
  }
});

// Delete language (admin)
router.delete('/admin/:code', auth, async (req, res) => {
  try {
    const language = await Language.findOneAndUpdate(
      { code: req.params.code.toUpperCase(), isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!language) {
      return res.status(404).json({ message: 'Dil bulunamadı' });
    }

    res.json({ message: 'Dil silindi' });
  } catch (error) {
    console.error('Delete language error:', error);
    res.status(500).json({ message: 'Dil silinirken hata oluştu' });
  }
});

// Set default language (admin)
router.post('/admin/:code/set-default', auth, async (req, res) => {
  try {
    const language = await Language.findOne({ 
      code: req.params.code.toUpperCase(),
      isDeleted: false 
    });

    if (!language) {
      return res.status(404).json({ message: 'Dil bulunamadı' });
    }

    // Remove default flag from all languages
    await Language.updateMany(
      { isDeleted: false },
      { isDefault: false }
    );

    // Set this language as default
    language.isDefault = true;
    await language.save();

    const populatedLanguage = await Language.findById(language._id)
      .populate('createdBy', 'name email');

    res.json(populatedLanguage);
  } catch (error) {
    console.error('Set default language error:', error);
    res.status(500).json({ message: 'Varsayılan dil ayarlanırken hata oluştu' });
  }
});

// Get language analytics (admin)
router.get('/admin/:code/analytics', auth, async (req, res) => {
  try {
    const language = await Language.findOne({ 
      code: req.params.code.toUpperCase(),
      isDeleted: false 
    });

    if (!language) {
      return res.status(404).json({ message: 'Dil bulunamadı' });
    }

    // Get translation statistics
    const translationStats = await Translation.getTranslationStats(req.params.code.toUpperCase());
    const namespaceStats = await Translation.getNamespaceStats(req.params.code.toUpperCase());

    const analytics = {
      language,
      translationStats,
      namespaceStats,
      translationProgress: language.translationProgress,
      isFullyTranslated: language.isFullyTranslated,
      isRecentlyUsed: language.isRecentlyUsed
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get language analytics error:', error);
    res.status(500).json({ message: 'Dil analitikleri alınırken hata oluştu' });
  }
});

// Get translations for language (admin)
router.get('/admin/:code/translations', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      namespace,
      status,
      search
    } = req.query;

    let query = { 
      languageCode: req.params.code.toUpperCase(),
      isDeleted: false 
    };

    // Filters
    if (namespace) query.namespace = namespace;
    if (status) query.status = status;

    // Search
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: 'i' } },
        { value: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const translations = await Translation.find(query)
      .populate('createdBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ namespace: 1, key: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Translation.countDocuments(query);

    res.json({
      translations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ message: 'Çeviriler alınırken hata oluştu' });
  }
});

// Create translation (admin)
router.post('/admin/:code/translations', auth, async (req, res) => {
  try {
    const {
      key,
      namespace,
      value,
      description,
      context,
      status
    } = req.body;

    // Validation
    if (!key || !value) {
      return res.status(400).json({ 
        message: 'Anahtar ve değer alanları zorunludur' 
      });
    }

    // Check if translation already exists
    const existingTranslation = await Translation.findOne({
      languageCode: req.params.code.toUpperCase(),
      namespace: namespace || 'common',
      key,
      isDeleted: false
    });

    if (existingTranslation) {
      return res.status(400).json({ message: 'Bu çeviri zaten mevcut' });
    }

    const translationData = {
      key,
      languageCode: req.params.code.toUpperCase(),
      namespace: namespace || 'common',
      value,
      description,
      context,
      status: status || 'pending',
      createdBy: req.user._id
    };

    const translation = new Translation(translationData);
    await translation.save();

    // Update language translation count
    const language = await Language.findOne({ 
      code: req.params.code.toUpperCase() 
    });
    if (language) {
      language.translations.totalKeys += 1;
      if (status === 'translated') {
        language.translations.translatedKeys += 1;
      }
      language.translations.lastUpdated = new Date();
      await language.save();
    }

    const populatedTranslation = await Translation.findById(translation._id)
      .populate('createdBy', 'name email')
      .populate('reviewedBy', 'name email');

    res.status(201).json(populatedTranslation);
  } catch (error) {
    console.error('Create translation error:', error);
    res.status(500).json({ message: 'Çeviri oluşturulurken hata oluştu' });
  }
});

// Update translation (admin)
router.put('/admin/:code/translations/:id', auth, async (req, res) => {
  try {
    const translation = await Translation.findOneAndUpdate(
      { 
        _id: req.params.id,
        languageCode: req.params.code.toUpperCase(),
        isDeleted: false 
      },
      {
        ...req.body,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('reviewedBy', 'name email');

    if (!translation) {
      return res.status(404).json({ message: 'Çeviri bulunamadı' });
    }

    // Update language translation count if status changed
    if (req.body.status) {
      const language = await Language.findOne({ 
        code: req.params.code.toUpperCase() 
      });
      if (language) {
        // Recalculate translated count
        const translatedCount = await Translation.countDocuments({
          languageCode: req.params.code.toUpperCase(),
          status: 'translated',
          isDeleted: false
        });
        language.translations.translatedKeys = translatedCount;
        language.translations.lastUpdated = new Date();
        await language.save();
      }
    }

    res.json(translation);
  } catch (error) {
    console.error('Update translation error:', error);
    res.status(500).json({ message: 'Çeviri güncellenirken hata oluştu' });
  }
});

// Delete translation (admin)
router.delete('/admin/:code/translations/:id', auth, async (req, res) => {
  try {
    const translation = await Translation.findOneAndUpdate(
      { 
        _id: req.params.id,
        languageCode: req.params.code.toUpperCase(),
        isDeleted: false 
      },
      { isDeleted: true },
      { new: true }
    );

    if (!translation) {
      return res.status(404).json({ message: 'Çeviri bulunamadı' });
    }

    // Update language translation count
    const language = await Language.findOne({ 
      code: req.params.code.toUpperCase() 
    });
    if (language) {
      language.translations.totalKeys = Math.max(0, language.translations.totalKeys - 1);
      if (translation.status === 'translated') {
        language.translations.translatedKeys = Math.max(0, language.translations.translatedKeys - 1);
      }
      await language.save();
    }

    res.json({ message: 'Çeviri silindi' });
  } catch (error) {
    console.error('Delete translation error:', error);
    res.status(500).json({ message: 'Çeviri silinirken hata oluştu' });
  }
});

// Bulk import translations (admin)
router.post('/admin/:code/translations/bulk', auth, async (req, res) => {
  try {
    const { translations, namespace = 'common' } = req.body;

    if (!translations || !Array.isArray(translations)) {
      return res.status(400).json({ message: 'Geçersiz çeviri verisi' });
    }

    const languageCode = req.params.code.toUpperCase();
    const translationData = translations.map(item => ({
      key: item.key,
      languageCode,
      namespace,
      value: item.value,
      description: item.description,
      context: item.context,
      status: item.status || 'pending',
      createdBy: req.user._id
    }));

    // Use insertMany with ordered: false to handle duplicates
    const result = await Translation.insertMany(translationData, { 
      ordered: false 
    });

    // Update language translation count
    const language = await Language.findOne({ code: languageCode });
    if (language) {
      const totalCount = await Translation.countDocuments({
        languageCode,
        isDeleted: false
      });
      const translatedCount = await Translation.countDocuments({
        languageCode,
        status: 'translated',
        isDeleted: false
      });

      language.translations.totalKeys = totalCount;
      language.translations.translatedKeys = translatedCount;
      language.translations.lastUpdated = new Date();
      await language.save();
    }

    res.json({ 
      message: `${result.length} çeviri başarıyla içe aktarıldı`,
      imported: result.length
    });
  } catch (error) {
    console.error('Bulk import translations error:', error);
    res.status(500).json({ message: 'Çeviriler içe aktarılırken hata oluştu' });
  }
});

// Export translations (admin)
router.get('/admin/:code/translations/export', auth, async (req, res) => {
  try {
    const { namespace, format = 'json' } = req.query;

    let query = { 
      languageCode: req.params.code.toUpperCase(),
      isDeleted: false 
    };

    if (namespace) {
      query.namespace = namespace;
    }

    const translations = await Translation.find(query).sort({ namespace: 1, key: 1 });

    let exportData;
    if (format === 'json') {
      exportData = translations.reduce((acc, translation) => {
        if (!acc[translation.namespace]) {
          acc[translation.namespace] = {};
        }
        acc[translation.namespace][translation.key] = translation.value;
        return acc;
      }, {});
    } else if (format === 'csv') {
      exportData = translations.map(t => ({
        namespace: t.namespace,
        key: t.key,
        value: t.value,
        status: t.status,
        description: t.description
      }));
    }

    res.json({
      languageCode: req.params.code.toUpperCase(),
      format,
      data: exportData,
      total: translations.length
    });
  } catch (error) {
    console.error('Export translations error:', error);
    res.status(500).json({ message: 'Çeviriler dışa aktarılırken hata oluştu' });
  }
});

// Get language statistics (admin)
router.get('/admin/statistics', auth, async (req, res) => {
  try {
    const totalLanguages = await Language.countDocuments({ isDeleted: false });
    const activeLanguages = await Language.countDocuments({
      status: 'active',
      isDeleted: false
    });
    const defaultLanguage = await Language.findOne({
      isDefault: true,
      isDeleted: false
    });

    // Get translation statistics for all languages
    const languageStats = await Language.aggregate([
      { $match: { isDeleted: false } },
      {
        $project: {
          code: 1,
          name: 1,
          nativeName: 1,
          flag: 1,
          status: 1,
          isDefault: 1,
          translationProgress: 1,
          'translations.totalKeys': 1,
          'translations.translatedKeys': 1,
          'usage.totalUsers': 1
        }
      }
    ]);

    res.json({
      totalLanguages,
      activeLanguages,
      defaultLanguage,
      languageStats
    });
  } catch (error) {
    console.error('Get language statistics error:', error);
    res.status(500).json({ message: 'Dil istatistikleri alınırken hata oluştu' });
  }
});

module.exports = router; 