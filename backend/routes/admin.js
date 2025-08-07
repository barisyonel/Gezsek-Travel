const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tour = require('../models/Tour');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

// Admin dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    // Kullanıcı istatistikleri
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const activeUsers = await User.countDocuments({ verified: true });

    // Tur istatistikleri
    const totalTours = await Tour.countDocuments();
    const activeTours = await Tour.countDocuments({ isActive: true });

    // Yaş grupları
    const ageGroups = await User.aggregate([
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$birthDate'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 25] }, then: '18-24' },
                { case: { $lt: ['$age', 35] }, then: '25-34' },
                { case: { $lt: ['$age', 45] }, then: '35-44' },
                { case: { $lt: ['$age', 55] }, then: '45-54' }
              ],
              default: '55+'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Cinsiyet dağılımı
    const genderStats = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Mock veriler (gerçek uygulamada veritabanından gelecek)
    const mockData = {
      totalRevenue: 125000,
      averageOrder: 2500,
      popularTour: 'Kapadokya Turu',
      conversionRate: 3.2,
      monthlyBookings: 45
    };

    res.json({
      totalUsers,
      newUsers,
      activeUsers,
      totalTours,
      activeTours,
      ageGroups,
      genderStats,
      ...mockData
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'İstatistikler alınamadı' });
  }
});

// Son aktiviteler
router.get('/activities', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    // Mock aktivite verileri
    const activities = [
      {
        icon: '👤',
        description: 'Yeni kullanıcı kayıt oldu: Ahmet Yılmaz',
        time: '2 dakika önce'
      },
      {
        icon: '🗺️',
        description: 'Yeni tur eklendi: Kapadokya Turu',
        time: '15 dakika önce'
      },
      {
        icon: '💰',
        description: 'Rezervasyon yapıldı: İstanbul Turu',
        time: '1 saat önce'
      },
      {
        icon: '📝',
        description: 'Blog yazısı yayınlandı: Seyahat İpuçları',
        time: '2 saat önce'
      },
      {
        icon: '👥',
        description: 'Kullanıcı giriş yaptı: admin@gezsektravel.com',
        time: '3 saat önce'
      }
    ];

    res.json(activities);

  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ message: 'Aktiviteler alınamadı' });
  }
});

// Gelişmiş kullanıcı yönetimi
router.get('/users/advanced', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const { page = 1, limit = 10, search = '', status = 'all', role = 'all' } = req.query;

    let query = {};

    // Arama filtresi
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Durum filtresi
    if (status !== 'all') {
      query.verified = status === 'active';
    }

    // Rol filtresi
    if (role !== 'all') {
      query.isAdmin = role === 'admin';
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Advanced users error:', error);
    res.status(500).json({ message: 'Kullanıcılar alınamadı' });
  }
});

// Toplu kullanıcı işlemleri
router.post('/users/bulk', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const { action, userIds } = req.body;

    switch (action) {
      case 'delete':
        await User.deleteMany({ _id: { $in: userIds } });
        break;
      case 'activate':
        await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { verified: true } }
        );
        break;
      case 'deactivate':
        await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { verified: false } }
        );
        break;
      default:
        return res.status(400).json({ message: 'Geçersiz işlem' });
    }

    res.json({ message: 'Toplu işlem başarılı' });

  } catch (error) {
    console.error('Bulk users error:', error);
    res.status(500).json({ message: 'Toplu işlem başarısız' });
  }
});

// Sistem ayarları
router.get('/settings', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    // Mock ayarlar (gerçek uygulamada veritabanından gelecek)
    const settings = {
      general: {
        siteName: 'Gezsek Travel',
        siteDescription: 'Profesyonel seyahat hizmetleri',
        contactEmail: 'info@gezsektravel.com',
        contactPhone: '+90 555 123 45 67'
      },
      email: {
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        emailAddress: 'info@gezsektravel.com',
        emailPassword: '********'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false
      }
    };

    res.json(settings);

  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ message: 'Ayarlar alınamadı' });
  }
});

// Ayarları güncelle
router.put('/settings', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const { settings } = req.body;

    // Mock güncelleme (gerçek uygulamada veritabanına kaydedilecek)
    console.log('Ayarlar güncellendi:', settings);

    res.json({ message: 'Ayarlar başarıyla güncellendi' });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Ayarlar güncellenemedi' });
  }
});

module.exports = router; 