const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const Purchase = require('../models/Purchase');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

// Get all tours (public)
router.get('/', async (req, res) => {
  try {
    const tours = await Tour.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ tours });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all tours (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json({ tours });
  } catch (error) {
    console.error('Get admin tours error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get single tour
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tur bulunamadı' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create tour (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Tur oluşturma hatası' });
  }
});

// Update tour (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tour) {
      return res.status(404).json({ message: 'Tur bulunamadı' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Tur güncelleme hatası' });
  }
});

// Delete tour (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tur bulunamadı' });
    }

    res.json({ message: 'Tur başarıyla silindi' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ message: 'Tur silme hatası' });
  }
});

// Gelişmiş arama ve filtreleme
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      location,
      duration,
      participants,
      date,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Filtre objesi oluştur
    const filter = { isActive: true };

    // Metin araması
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { highlights: { $regex: query, $options: 'i' } }
      ];
    }

    // Kategori filtresi
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Fiyat aralığı
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Lokasyon filtresi
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Süre filtresi
    if (duration) {
      filter.duration = { $regex: duration, $options: 'i' };
    }

    // Katılımcı sayısı
    if (participants) {
      filter.maxParticipants = { $gte: parseInt(participants) };
    }

    // Tarih filtresi (gelecek tarihler)
    if (date) {
      // Bu özellik daha sonra eklenebilir
    }

    // Sıralama
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorgu çalıştır
    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Tour.countDocuments(filter)
    ]);

    // Toplam sayfa sayısı
    const totalPages = Math.ceil(total / parseInt(limit));

    // Kategorileri getir (filtre için)
    const categories = await Tour.distinct('category');

    // Lokasyonları getir (filtre için)
    const locations = await Tour.distinct('location');

    res.json({
      tours,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        categories,
        locations,
        priceRange: {
          min: await Tour.findOne({ isActive: true }).sort({ price: 1 }).select('price'),
          max: await Tour.findOne({ isActive: true }).sort({ price: -1 }).select('price')
        }
      }
    });

  } catch (error) {
    console.error('Search tours error:', error);
    res.status(500).json({ message: 'Arama hatası' });
  }
});

// Kategorileri getir
router.get('/categories', async (req, res) => {
  try {
    const categories = await Tour.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Kategoriler getirilemedi' });
  }
});

// Lokasyonları getir
router.get('/locations', async (req, res) => {
  try {
    const locations = await Tour.distinct('location');
    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Lokasyonlar getirilemedi' });
  }
});

// ===== REZERVASYON SİSTEMİ =====

// Rezervasyon oluştur
router.post('/:id/reserve', auth, async (req, res) => {
  try {
    const { participants, tourDate, specialRequests, contactInfo } = req.body;
    const tourId = req.params.id;

    // Tur kontrolü
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tur bulunamadı' });
    }

    if (!tour.isActive) {
      return res.status(400).json({ message: 'Bu tur şu anda aktif değil' });
    }

    // Tarih kontrolü
    const selectedDate = new Date(tourDate);
    const today = new Date();
    if (selectedDate <= today) {
      return res.status(400).json({ message: 'Geçmiş bir tarih seçemezsiniz' });
    }

    // Katılımcı sayısı kontrolü
    if (participants < 1 || participants > tour.maxParticipants) {
      return res.status(400).json({ 
        message: `Katılımcı sayısı 1-${tour.maxParticipants} arasında olmalıdır` 
      });
    }

    // Aynı tarihte aynı kullanıcının rezervasyonu var mı kontrolü
    const existingReservation = await Purchase.findOne({
      user: req.user.userId,
      tour: tourId,
      tourDate: tourDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'Bu tarih için zaten rezervasyonunuz var' });
    }

    // Toplam fiyat hesaplama
    const totalPrice = tour.price * participants;

    // Rezervasyon oluştur
    const reservation = new Purchase({
      user: req.user.userId,
      tour: tourId,
      participants,
      totalPrice,
      tourDate,
      specialRequests,
      contactInfo: {
        name: contactInfo.name || req.user.name,
        phone: contactInfo.phone || req.user.phone,
        email: contactInfo.email || req.user.email
      }
    });

    await reservation.save();

    // Tur bilgilerini populate et
    await reservation.populate('tour');

    // Email bildirimi gönder (asenkron olarak)
    try {
      await emailService.sendNewReservationNotification(
        reservation.contactInfo.email,
        reservation.contactInfo.name,
        tour.title,
        tourDate,
        participants,
        totalPrice
      );
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // Email hatası rezervasyonu etkilemez
    }

    res.status(201).json({
      message: 'Rezervasyon başarıyla oluşturuldu',
      reservation
    });

  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Rezervasyon oluşturma hatası' });
  }
});

// Kullanıcının rezervasyonlarını getir
router.get('/my/reservations', auth, async (req, res) => {
  try {
    const reservations = await Purchase.find({ user: req.user.userId })
      .populate('tour')
      .sort({ createdAt: -1 });

    res.json({ reservations });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Rezervasyonları getirme hatası' });
  }
});

// Rezervasyon detayını getir
router.get('/reservations/:id', auth, async (req, res) => {
  try {
    const reservation = await Purchase.findById(req.params.id)
      .populate('tour')
      .populate('user', 'name email phone');

    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }

    // Sadece kendi rezervasyonunu veya admin görebilir
    if (reservation.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Rezervasyon getirme hatası' });
  }
});

// Rezervasyon iptal et
router.put('/reservations/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Purchase.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }

    // Sadece kendi rezervasyonunu veya admin iptal edebilir
    if (reservation.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    // Sadece pending veya confirmed durumundaki rezervasyonlar iptal edilebilir
    if (!['pending', 'confirmed'].includes(reservation.status)) {
      return res.status(400).json({ message: 'Bu rezervasyon iptal edilemez' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ 
      message: 'Rezervasyon başarıyla iptal edildi',
      reservation 
    });

  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ message: 'Rezervasyon iptal hatası' });
  }
});

// Admin: Tüm rezervasyonları getir
router.get('/admin/reservations', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const reservations = await Purchase.find()
      .populate('tour')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ reservations });
  } catch (error) {
    console.error('Get admin reservations error:', error);
    res.status(500).json({ message: 'Rezervasyonları getirme hatası' });
  }
});

// Admin: Rezervasyon durumunu güncelle
router.put('/admin/reservations/:id/status', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum' });
    }

    const reservation = await Purchase.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('tour').populate('user', 'name email phone');

    if (!reservation) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }

    // Email bildirimi gönder (asenkron olarak)
    try {
      if (status === 'confirmed') {
        await emailService.sendReservationConfirmation(
          reservation.user.email,
          reservation.user.name,
          reservation.tour.title,
          reservation.tourDate,
          reservation._id.toString().slice(-6)
        );
      } else if (status === 'cancelled') {
        await emailService.sendReservationCancellation(
          reservation.user.email,
          reservation.user.name,
          reservation.tour.title,
          reservation.tourDate,
          reservation._id.toString().slice(-6)
        );
      }
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // Email hatası durum güncellemesini etkilemez
    }

    res.json({ 
      message: 'Rezervasyon durumu güncellendi',
      reservation 
    });

  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ message: 'Rezervasyon güncelleme hatası' });
  }
});

// Email test endpoint (sadece geliştirme için)
router.post('/test-email', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkisiz erişim' });
    }

    const { emailType, userEmail, userName, tourTitle, tourDate } = req.body;

    let result;
    switch (emailType) {
      case 'reservation-confirmed':
        result = await emailService.sendReservationConfirmation(
          userEmail || req.user.email,
          userName || req.user.name,
          tourTitle || 'Test Turu',
          tourDate || '2024-12-25',
          '123456'
        );
        break;
      case 'reservation-cancelled':
        result = await emailService.sendReservationCancellation(
          userEmail || req.user.email,
          userName || req.user.name,
          tourTitle || 'Test Turu',
          tourDate || '2024-12-25',
          '123456'
        );
        break;
      case 'new-reservation':
        result = await emailService.sendNewReservationNotification(
          userEmail || req.user.email,
          userName || req.user.name,
          tourTitle || 'Test Turu',
          tourDate || '2024-12-25',
          2,
          1500
        );
        break;
      case 'tour-reminder':
        result = await emailService.sendTourReminder(
          userEmail || req.user.email,
          userName || req.user.name,
          tourTitle || 'Test Turu',
          tourDate || '2024-12-25',
          'Test Buluşma Noktası'
        );
        break;
      default:
        return res.status(400).json({ message: 'Geçersiz email tipi' });
    }

    res.json({
      message: 'Email test edildi',
      result,
      testMode: result.testMode || false
    });

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ message: 'Email test hatası' });
  }
});

module.exports = router; 