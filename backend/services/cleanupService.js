const cron = require('node-cron');
const Message = require('../models/Message');

class CleanupService {
  constructor() {
    this.isRunning = false;
  }

  // 12 saatte bir çalışacak cron job (her gün saat 00:00 ve 12:00)
  startCleanupJob() {
    console.log('🕐 Sohbet temizleme servisi başlatıldı...');
    console.log('📅 Temizleme zamanı: Her gün saat 00:00 ve 12:00');
    
    // Her gün saat 00:00 ve 12:00'de çalış
    cron.schedule('0 0,12 * * *', async () => {
      await this.cleanupOldMessages();
    }, {
      scheduled: true,
      timezone: "Europe/Istanbul"
    });

    // Test için: Her 5 dakikada bir çalış (geliştirme aşamasında)
    cron.schedule('*/5 * * * *', async () => {
      console.log('🧪 Test modu: 5 dakikalık temizleme çalışıyor...');
      await this.cleanupOldMessages();
    }, {
      scheduled: true,
      timezone: "Europe/Istanbul"
    });
  }

  // Eski mesajları temizle
  async cleanupOldMessages() {
    if (this.isRunning) {
      console.log('⚠️ Temizleme işlemi zaten çalışıyor...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('🧹 Sohbet verileri temizleniyor...');

      // 12 saatten eski mesajları bul
      const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000));
      
      // Eski mesajları say
      const oldMessagesCount = await Message.countDocuments({
        createdAt: { $lt: twelveHoursAgo },
        isDeleted: false
      });

      if (oldMessagesCount === 0) {
        console.log('✅ Temizlenecek eski mesaj bulunamadı');
        return;
      }

      // Eski mesajları sil (soft delete)
      const result = await Message.updateMany(
        {
          createdAt: { $lt: twelveHoursAgo },
          isDeleted: false
        },
        {
          isDeleted: true,
          deletedAt: new Date()
        }
      );

      console.log(`✅ ${result.modifiedCount} adet eski mesaj temizlendi`);
      console.log(`📊 Toplam temizlenen mesaj: ${oldMessagesCount}`);

      // İstatistikleri logla
      const totalMessages = await Message.countDocuments({ isDeleted: false });
      console.log(`📈 Veritabanında kalan aktif mesaj: ${totalMessages}`);

    } catch (error) {
      console.error('❌ Mesaj temizleme hatası:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Manuel temizleme (admin panelinden çağrılabilir)
  async manualCleanup() {
    console.log('🔧 Manuel temizleme başlatıldı...');
    await this.cleanupOldMessages();
  }

  // Servisi durdur
  stop() {
    console.log('🛑 Sohbet temizleme servisi durduruldu');
    this.isRunning = false;
  }

  // Servis durumunu kontrol et
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCleanup: this.getNextCleanupTime()
    };
  }

  // Sonraki temizleme zamanını hesapla
  getNextCleanupTime() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    
    const nextNoon = new Date(now);
    nextNoon.setHours(12, 0, 0, 0);
    
    if (now.getHours() >= 12) {
      nextNoon.setDate(nextNoon.getDate() + 1);
    }
    
    return {
      midnight: nextMidnight,
      noon: nextNoon
    };
  }
}

module.exports = new CleanupService(); 