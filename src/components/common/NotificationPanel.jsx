import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import '../../App.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // İlk yükleme
    updateNotifications();

    // Listener ekle
    const unsubscribe = notificationService.addListener(updateNotifications);

    // Bildirim izni iste
    notificationService.requestPermission();

    return unsubscribe;
  }, []);

  const updateNotifications = () => {
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleDeleteNotification = (notificationId) => {
    notificationService.deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reservation_created':
        return '📅';
      case 'reservation_confirmed':
        return '🎉';
      case 'reservation_cancelled':
        return '❌';
      case 'tour_reminder':
        return '⏰';
      case 'system_message':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'reservation_created':
        return 'notification-info';
      case 'reservation_confirmed':
        return 'notification-success';
      case 'reservation_cancelled':
        return 'notification-error';
      case 'tour_reminder':
        return 'notification-warning';
      case 'system_message':
        return 'notification-system';
      default:
        return 'notification-default';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h3>🔔 Bildirimler</h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="mark-all-read-btn"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="clear-all-btn"
              >
                Tümünü Temizle
              </button>
            )}
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
        </div>

        <div className="notification-content">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">🔔</div>
              <h4>Henüz Bildiriminiz Yok</h4>
              <p>Yeni bildirimler burada görünecek</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${getNotificationClass(notification.type)} ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <span className="notification-time">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    {notification.data && Object.keys(notification.data).length > 0 && (
                      <div className="notification-data">
                        {notification.data.tourTitle && (
                          <span className="data-item">📍 {notification.data.tourTitle}</span>
                        )}
                        {notification.data.tourDate && (
                          <span className="data-item">📅 {notification.data.tourDate}</span>
                        )}
                        {notification.data.participants && (
                          <span className="data-item">👥 {notification.data.participants} kişi</span>
                        )}
                        {notification.data.totalPrice && (
                          <span className="data-item">💰 ₺{notification.data.totalPrice}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <span className="unread-indicator"></span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="delete-notification-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel; 