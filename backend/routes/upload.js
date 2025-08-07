const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const fs = require('fs');

// Dosya yükleme endpoint'i (admin only)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    // Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gezsekk',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Resimler için boyut sınırı
        { quality: 'auto' } // Otomatik kalite optimizasyonu
      ]
    });

    // Geçici dosyayı sil
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Hata durumunda geçici dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Dosya yükleme hatası' 
    });
  }
});

// Çoklu dosya yükleme endpoint'i (admin only)
router.post('/multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'gezsekk',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        // Geçici dosyayı sil
        fs.unlinkSync(file.path);

        return {
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height
        };
      } catch (error) {
        // Hata durumunda geçici dosyayı sil
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        return {
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      files: results
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Hata durumunda tüm geçici dosyaları sil
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Dosya yükleme hatası' 
    });
  }
});

// Dosya silme endpoint'i (admin only)
router.delete('/:public_id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const { public_id } = req.params;
    
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.json({ 
        success: true,
        message: 'Dosya başarıyla silindi' 
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Dosya silinemedi' 
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Dosya silme hatası' 
    });
  }
});

module.exports = router; 