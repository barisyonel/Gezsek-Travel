import React, { useState, useEffect } from 'react';
import NotificationModal from '../modals/NotificationModal';
import BulkNotificationModal from '../modals/BulkNotificationModal';
import './NotificationManagement.css';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    priority: 'all',
    status: 'all',
    recipient: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchAnalytics();
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/notifications/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateNotification = () => {
    setEditingNotification(null);
    setShowNotificationModal(true);
  };

  const handleCreateBulkNotification = () => {
    setShowBulkModal(true);
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setShowNotificationModal(true);
  };

  const handleSaveNotification = async (notificationData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingNotification
        ? `/api/notifications/admin/${editingNotification._id}`
        : '/api/notifications/admin';

      const method = editingNotification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        setShowNotificationModal(false);
        setEditingNotification(null);
        fetchNotifications();
        fetchAnalytics();
        alert(editingNotification ? 'Bildirim güncellendi!' : 'Bildirim oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleSaveBulkNotification = async (bulkData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/admin/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bulkData)
      });

      if (response.ok) {
        const result = await response.json();
        setShowBulkModal(false);
        fetchNotifications();
        fetchAnalytics();
        alert(`${result.count} bildirim oluşturuldu!`);
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteNotification = async (notificationId, notificationTitle) => {
    if (!window.confirm(`${notificationTitle} bildirimini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/admin/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchNotifications();
        fetchAnalytics();
        alert('Bildirim silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Silme hatası');
    }
  };

  const handleProcessScheduled = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/admin/process-scheduled', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        fetchNotifications();
        fetchAnalytics();
        alert(`${result.processedCount} planlanmış bildirim işlendi!`);
      } else {
        const error = await response.json();
        alert(error.message || 'İşlem hatası');
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      alert('İşlem hatası');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'reservation': return '📅';
      case 'message': return '💬';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return '#17a2b8';
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      case 'reservation': return '#6f42c1';
      case 'message': return '#20c997';
      case 'system': return '#6c757d';
      case 'promotion': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#28a745';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return '#dc3545';
      case 'read': return '#28a745';
      case 'archived': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="notification-management-section">
      <div className="section-header">
        <h2>🔔 Bildirim Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleProcessScheduled} className="process-btn">
            ⏰ Planlanmışları İşle
          </button>
          <button onClick={handleCreateBulkNotification} className="bulk-btn">
            📢 Toplu Bildirim
          </button>
          <button onClick={handleCreateNotification} className="add-btn">
            ➕ Yeni Bildirim
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-dashboard">
          <h3>📊 Bildirim Analitikleri</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">📢</div>
              <div className="analytics-content">
                <h4>Toplam Bildirim</h4>
                <p>{analytics.totalNotifications}</p>
              </div>
            </div>
            <div className="analytics-card urgent">
              <div className="analytics-icon">🔴</div>
              <div className="analytics-content">
                <h4>Okunmamış</h4>
                <p>{analytics.unreadNotifications}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">✅</div>
              <div className="analytics-content">
                <h4>Okunmuş</h4>
                <p>{analytics.readNotifications}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">📁</div>
              <div className="analytics-content">
                <h4>Arşivlenmiş</h4>
                <p>{analytics.archivedNotifications}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">📈</div>
              <div className="analytics-content">
                <h4>Son 7 Gün</h4>
                <p>{analytics.recentNotifications}</p>
              </div>
            </div>
          </div>

          {/* Type Distribution */}
          {analytics.typeStats && analytics.typeStats.length > 0 && (
            <div className="stats-section">
              <h4>📊 Tür Dağılımı</h4>
              <div className="stats-grid">
                {analytics.typeStats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-icon">{getTypeIcon(stat._id)}</span>
                    <span className="stat-label">{stat._id}</span>
                    <span className="stat-value">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Channel Stats */}
          {analytics.deliveryStats && analytics.deliveryStats.length > 0 && (
            <div className="stats-section">
              <h4>📤 İletim Kanalı İstatistikleri</h4>
              <div className="stats-grid">
                {analytics.deliveryStats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-icon">
                      {stat._id === 'in-app' ? '📱' : 
                       stat._id === 'email' ? '📧' : 
                       stat._id === 'sms' ? '📱' : '🔔'}
                    </span>
                    <span className="stat-label">{stat._id}</span>
                    <span className="stat-value">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Bildirim ara..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Türler</option>
            <option value="info">Bilgi</option>
            <option value="success">Başarı</option>
            <option value="warning">Uyarı</option>
            <option value="error">Hata</option>
            <option value="reservation">Rezervasyon</option>
            <option value="message">Mesaj</option>
            <option value="system">Sistem</option>
            <option value="promotion">Promosyon</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="general">Genel</option>
            <option value="reservation">Rezervasyon</option>
            <option value="payment">Ödeme</option>
            <option value="tour">Tur</option>
            <option value="message">Mesaj</option>
            <option value="system">Sistem</option>
            <option value="marketing">Pazarlama</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="urgent">Acil</option>
            <option value="high">Yüksek</option>
            <option value="normal">Normal</option>
            <option value="low">Düşük</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="unread">Okunmamış</option>
            <option value="read">Okunmuş</option>
            <option value="archived">Arşivlenmiş</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.recipient}
            onChange={(e) => setFilters(prev => ({ ...prev, recipient: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Alıcılar</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="notifications-table-container">
        <table className="notifications-table">
          <thead>
            <tr>
              <th>Tür</th>
              <th>Başlık</th>
              <th>Alıcı</th>
              <th>Öncelik</th>
              <th>Durum</th>
              <th>Kanal</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification._id}>
                <td>
                  <span 
                    className="type-badge"
                    style={{ backgroundColor: getTypeColor(notification.type) }}
                  >
                    {getTypeIcon(notification.type)} {notification.type}
                  </span>
                </td>
                <td>
                  <div className="notification-title">
                    <div className="title-text">{notification.title}</div>
                    <div className="title-message">{notification.message}</div>
                  </div>
                </td>
                <td>
                  <div className="recipient-info">
                    <div className="recipient-name">{notification.recipient?.name}</div>
                    <div className="recipient-email">{notification.recipient?.email}</div>
                  </div>
                </td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(notification.status) }}
                  >
                    {notification.status}
                  </span>
                </td>
                <td>
                  <div className="delivery-channels">
                    {notification.deliveryChannels.map((channel, index) => (
                      <span key={index} className="channel-badge">
                        {channel === 'in-app' ? '📱' : 
                         channel === 'email' ? '📧' : 
                         channel === 'sms' ? '📱' : '🔔'}
                        {channel}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <div className="date">{formatDate(notification.createdAt)}</div>
                    {notification.scheduledAt && (
                      <div className="scheduled-date">
                        Planlanan: {formatDate(notification.scheduledAt)}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="notification-actions">
                    <button 
                      onClick={() => handleEditNotification(notification)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteNotification(notification._id, notification.title)}
                      className="action-btn delete-btn"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            ← Önceki
          </button>
          
          <span className="pagination-info">
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} bildirim)
          </span>
          
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="pagination-btn"
          >
            Sonraki →
          </button>
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>Henüz bildirim yok</h3>
          <p>Kullanıcılara gönderilecek bildirimler burada görünecek</p>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          notification={editingNotification}
          onSave={handleSaveNotification}
          users={users}
          title={editingNotification ? 'Bildirim Düzenle' : 'Yeni Bildirim Oluştur'}
        />
      )}

      {/* Bulk Notification Modal */}
      {showBulkModal && (
        <BulkNotificationModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onSave={handleSaveBulkNotification}
          users={users}
        />
      )}
    </div>
  );
};

export default NotificationManagement; 