const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Email transporter removed - no longer needed

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, birthDate, gender } = req.body;

    // Validation - Tüm alanlar zorunlu
    if (!email || !password || !name || !phone || !birthDate || !gender) {
      return res.status(400).json({ 
        message: 'Tüm alanlar zorunludur: Email, şifre, ad, telefon, doğum tarihi ve cinsiyet' 
      });
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir email adresi giriniz' });
    }

    // Şifre güvenlik kontrolü
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Telefon format kontrolü
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'Geçerli bir telefon numarası giriniz (10-11 haneli)' });
    }

    // Validate birth date - Daha sıkı yaş kontrolü
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    
    // Gelecek tarih kontrolü
    if (birthDateObj > today) {
      return res.status(400).json({ message: 'Doğum tarihi gelecek bir tarih olamaz' });
    }
    
    // Çok eski tarih kontrolü (120 yaşından büyük)
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 120);
    if (birthDateObj < maxAge) {
      return res.status(400).json({ message: 'Geçerli bir doğum tarihi giriniz' });
    }
    
    // Yaş hesaplama
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return res.status(400).json({ 
        message: 'Kayıt olmak için 18 yaşından büyük olmalısınız. Yaşınız: ' + age 
      });
    }
    
    // Maksimum yaş kontrolü (100 yaşından büyük)
    if (age > 100) {
      return res.status(400).json({ message: 'Geçerli bir doğum tarihi giriniz' });
    }

    // Validate gender
    const validGenders = ['erkek', 'kadın', 'diğer', 'belirtmek_istemiyorum'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Geçersiz cinsiyet seçimi' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kayıtlı' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (directly verified)
    const user = new User({
      email,
      passwordHash,
      name,
      phone: phone || '',
      birthDate: birthDateObj,
      gender,
      verified: true // Direkt doğrulanmış olarak kaydet
    });

    await user.save();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'gezsekk_default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'Kayıt başarılı! Hoş geldiniz.',
      token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        verified: user.verified,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Verify endpoint removed - no longer needed

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gerekli' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET || 'gezsekk_default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        verified: user.verified,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Resend code endpoint removed - no longer needed

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash -verificationCode');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Admin Routes
// Create new user (admin only)
router.post('/admin/users', auth, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }

    const { name, email, phone, password, birthDate, gender, isAdmin } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Şifre hash'leme
    const passwordHash = await bcrypt.hash(password, 12);

    // Kullanıcı oluşturma
    const user = new User({
      name,
      email,
      passwordHash,
      phone: phone || '',
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender || 'erkek',
      verified: true,
      isAdmin: isAdmin || false
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      verified: user.verified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all users (admin only)
router.get('/admin/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }

    const users = await User.find({}).select('-passwordHash -verificationCode');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get user statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const unverifiedUsers = await User.countDocuments({ verified: false });
    const adminUsers = await User.countDocuments({ isAdmin: true });

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
            $cond: [
              { $lt: ['$age', 25] },
              '18-24',
              {
                $cond: [
                  { $lt: ['$age', 35] },
                  '25-34',
                  {
                    $cond: [
                      { $lt: ['$age', 45] },
                      '35-44',
                      {
                        $cond: [
                          { $lt: ['$age', 55] },
                          '45-54',
                          '55+'
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Cinsiyet dağılımı
    const genderStats = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
      ageGroups,
      genderStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update user (admin only)
router.put('/admin/users/:userId', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }

    const { userId } = req.params;
    const { name, email, phone, verified, isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (verified !== undefined) user.verified = verified;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      verified: user.verified,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete user (admin only)
router.delete('/admin/users/:userId', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }

    const { userId } = req.params;

    // Admin kendini silemesin
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Kendinizi silemezsiniz' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mevcut şifre ve yeni şifre gerekli' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifreyi kontrol et
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi hash'le
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 