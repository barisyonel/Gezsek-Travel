// Bildirim türleri
export const NOTIFICATION_TYPES = {
  RESERVATION_CREATED: 'reservation_created',
  RESERVATION_CONFIRMED: 'reservation_confirmed',
  RESERVATION_CANCELLED: 'reservation_cancelled',
  TOUR_REMINDER: 'tour_reminder',
  SYSTEM_MESSAGE: 'system_message'
};

// Bildirim servisi
class NotificationService {
  constructor() {
    this.notifications = this.loadNotificationsFromStorage();
    this.listeners = [];
  }

  // Bildirimleri localStorage'dan al
  loadNotificationsFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Bildirimleri alma hatası:', error);
      return [];
    }
  }

  // Bildirimleri localStorage'a kaydet
  saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Bildirimleri kaydetme hatası:', error);
    }
  }

  // Yeni bildirim ekle
  addNotification(type, title, message, data = {}) {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);
    
    // Maksimum 50 bildirim sakla
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();
    
    // Tarayıcı bildirimi göster (izin varsa)
    this.showBrowserNotification(title, message);
    
    return notification;
  }

  // Bildirimleri al
  getNotifications() {
    if (!this.notifications || !Array.isArray(this.notifications)) {
      this.notifications = [];
    }
    return this.notifications;
  }

  // Okunmamış bildirim sayısını al
  getUnreadCount() {
    if (!this.notifications || !Array.isArray(this.notifications)) {
      return 0;
    }
    return this.notifications.filter(n => !n.read).length;
  }

  // Bildirimi okundu olarak işaretle
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Bildirimi sil
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Tüm bildirimleri sil
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Listener ekle
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Listener'ları bilgilendir
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.notifications, this.getUnreadCount());
      } catch (error) {
        console.error('Listener callback hatası:', error);
      }
    });
  }

  // Tarayıcı bildirimi göster
  showBrowserNotification(title, message) {
    if (!('Notification' in window)) {
      return;
    }

    // Sadece izin verilmişse bildirim göster
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/logo.png',
          badge: '/logo.png'
        });
      } catch (error) {
        console.log('Bildirim gösterilemedi:', error);
      }
    }
    // İzin reddedilmişse veya default durumda hiçbir şey yapma
  }

  // Bildirim izni iste (kullanıcı etkileşimi ile)
  requestPermission() {
    if (!('Notification' in window)) {
      return Promise.resolve('not-supported');
    }

    // Eğer zaten izin verilmişse
    if (Notification.permission === 'granted') {
      return Promise.resolve('granted');
    }

    // Eğer reddedilmişse tekrar sorma
    if (Notification.permission === 'denied') {
      return Promise.resolve('denied');
    }

    // Sadece default durumda izin iste
    return Notification.requestPermission().catch(() => 'denied');
  }

  // Rezervasyon bildirimleri
  notifyReservationCreated(tourTitle, tourDate, participants, totalPrice) {
    return this.addNotification(
      NOTIFICATION_TYPES.RESERVATION_CREATED,
      '📅 Yeni Rezervasyon',
      `${tourTitle} turu için rezervasyonunuz oluşturuldu. Tarih: ${tourDate}`,
      { tourTitle, tourDate, participants, totalPrice }
    );
  }

  notifyReservationConfirmed(tourTitle, tourDate) {
    return this.addNotification(
      NOTIFICATION_TYPES.RESERVATION_CONFIRMED,
      '🎉 Rezervasyon Onaylandı',
      `${tourTitle} turu için rezervasyonunuz onaylandı!`,
      { tourTitle, tourDate }
    );
  }

  notifyReservationCancelled(tourTitle, tourDate) {
    return this.addNotification(
      NOTIFICATION_TYPES.RESERVATION_CANCELLED,
      '❌ Rezervasyon İptal Edildi',
      `${tourTitle} turu için rezervasyonunuz iptal edildi.`,
      { tourTitle, tourDate }
    );
  }

  notifyTourReminder(tourTitle, tourDate, meetingPoint) {
    return this.addNotification(
      NOTIFICATION_TYPES.TOUR_REMINDER,
      '⏰ Tur Hatırlatması',
      `Yarın ${tourTitle} turunuz var! Buluşma noktası: ${meetingPoint}`,
      { tourTitle, tourDate, meetingPoint }
    );
  }

  notifySystemMessage(title, message) {
    return this.addNotification(
      NOTIFICATION_TYPES.SYSTEM_MESSAGE,
      title,
      message
    );
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService; 