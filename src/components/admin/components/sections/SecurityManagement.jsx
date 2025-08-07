import React, { useState, useEffect } from 'react';
import SecurityEventModal from '../modals/SecurityEventModal';
import IpAnalysisModal from '../modals/IpAnalysisModal';
import './SecurityManagement.css';

const SecurityManagement = () => {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    riskLevel: 'all',
    status: 'all',
    search: '',
    timeRange: '24h'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEvents();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        timeRange: filters.timeRange,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== 'all' && key !== 'timeRange')
        )
      });

      const response = await fetch(`/api/security/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/security/admin/statistics?timeRange=${filters.timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleAnalyzeIp = (ipAddress) => {
    setSelectedIp(ipAddress);
    setShowIpModal(true);
  };

  const handleBlockIp = async (ipAddress) => {
    const reason = prompt('Engelleme sebebi:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/security/admin/block-ip/${ipAddress}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`IP ${ipAddress} engellendi! ${data.blockedEvents} olay güncellendi.`);
        fetchEvents();
        fetchStatistics();
      } else {
        const error = await response.json();
        alert(error.message || 'IP engelleme hatası');
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      alert('IP engelleme hatası');
    }
  };

  const handleUnblockIp = async (ipAddress) => {
    const reason = prompt('Engel kaldırma sebebi:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/security/admin/unblock-ip/${ipAddress}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`IP ${ipAddress} engeli kaldırıldı! ${data.unblockedEvents} olay güncellendi.`);
        fetchEvents();
        fetchStatistics();
      } else {
        const error = await response.json();
        alert(error.message || 'IP engel kaldırma hatası');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      alert('IP engel kaldırma hatası');
    }
  };

  const handleUpdateEventStatus = async (eventId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/security/admin/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchEvents();
        alert('Olay durumu güncellendi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Güncelleme hatası');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Güncelleme hatası');
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'login_attempt': return '🔐';
      case 'password_change': return '🔑';
      case 'profile_update': return '👤';
      case 'admin_action': return '⚙️';
      case 'suspicious_activity': return '🚨';
      case 'api_access': return '🌐';
      case 'file_upload': return '📁';
      case 'data_export': return '📊';
      case 'system_change': return '🔧';
      default: return '📋';
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop': return '💻';
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="security-management-section">
      <div className="section-header">
        <h2>🔒 Gelişmiş Güvenlik Yönetimi</h2>
        <div className="header-actions">
          <button onClick={() => fetchEvents()} className="refresh-btn">
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="statistics-dashboard">
          <h3>📊 Güvenlik İstatistikleri</h3>
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h4>Toplam Olay</h4>
                <p>{statistics.summary?.totalEvents || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h4>Bekleyen</h4>
                <p>{statistics.summary?.pendingEvents || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <h4>Yüksek Risk</h4>
                <p>{statistics.summary?.highRiskEvents || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h4>Şüpheli</h4>
                <p>{statistics.summary?.suspiciousEvents || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🕒</div>
              <div className="stat-content">
                <h4>Son Saat</h4>
                <p>{statistics.summary?.recentEvents || 0}</p>
              </div>
            </div>
          </div>

          {/* Top IP Addresses */}
          {statistics.ipStats && statistics.ipStats.length > 0 && (
            <div className="ip-stats-section">
              <h4>🌐 En Aktif IP Adresleri</h4>
              <div className="ip-stats-grid">
                {statistics.ipStats.slice(0, 5).map((ip, index) => (
                  <div key={index} className="ip-stat-card">
                    <div className="ip-header">
                      <span className="ip-address">{ip._id}</span>
                      {ip.isSuspicious && <span className="suspicious-badge">⚠️</span>}
                      {ip.isBlocked && <span className="blocked-badge">🚫</span>}
                    </div>
                    <div className="ip-stats">
                      <span className="event-count">{ip.count} olay</span>
                      <span className="risk-indicator">
                        {ip.hasHighRisk ? '🔴' : ip.suspiciousCount > 0 ? '🟡' : '🟢'}
                      </span>
                    </div>
                    <div className="ip-actions">
                      <button 
                        onClick={() => handleAnalyzeIp(ip._id)}
                        className="action-btn analyze-btn"
                        title="Analiz Et"
                      >
                        🔍
                      </button>
                      {!ip.isBlocked ? (
                        <button 
                          onClick={() => handleBlockIp(ip._id)}
                          className="action-btn block-btn"
                          title="Engelle"
                        >
                          🚫
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnblockIp(ip._id)}
                          className="action-btn unblock-btn"
                          title="Engeli Kaldır"
                        >
                          ✅
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Locations */}
          {statistics.locationStats && statistics.locationStats.length > 0 && (
            <div className="location-stats-section">
              <h4>🌍 En Aktif Lokasyonlar</h4>
              <div className="location-stats-grid">
                {statistics.locationStats.slice(0, 5).map((location, index) => (
                  <div key={index} className="location-stat-card">
                    <div className="location-header">
                      <span className="location-name">
                        {location._id.country}, {location._id.city}
                      </span>
                      {location.hasHighRisk && <span className="high-risk-badge">🔴</span>}
                    </div>
                    <div className="location-stats">
                      <span className="event-count">{location.count} olay</span>
                      <span className="suspicious-count">
                        {location.suspiciousCount > 0 && `⚠️ ${location.suspiciousCount}`}
                      </span>
                    </div>
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
            placeholder="Olay ara..."
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
            <option value="all">Tüm Tipler</option>
            <option value="login_attempt">Giriş Denemesi</option>
            <option value="password_change">Şifre Değişikliği</option>
            <option value="profile_update">Profil Güncelleme</option>
            <option value="admin_action">Admin Aksiyonu</option>
            <option value="suspicious_activity">Şüpheli Aktivite</option>
            <option value="api_access">API Erişimi</option>
            <option value="file_upload">Dosya Yükleme</option>
            <option value="data_export">Veri Dışa Aktarma</option>
            <option value="system_change">Sistem Değişikliği</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Risk Seviyeleri</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="critical">Kritik</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="reviewed">İncelendi</option>
            <option value="resolved">Çözüldü</option>
            <option value="false_positive">Yanlış Pozitif</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
            className="filter-select"
          >
            <option value="1h">Son 1 Saat</option>
            <option value="24h">Son 24 Saat</option>
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Tip</th>
              <th>Aksiyon</th>
              <th>Kullanıcı</th>
              <th>IP Adresi</th>
              <th>Lokasyon</th>
              <th>Cihaz</th>
              <th>Risk</th>
              <th>Durum</th>
              <th>Bayraklar</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id} className={event.isRecent ? 'recent-event' : ''}>
                <td>
                  <div className="event-type">
                    <span className="type-icon">{getTypeIcon(event.type)}</span>
                    <span className="type-name">{event.type}</span>
                  </div>
                </td>
                <td>
                  <div className="event-action">
                    <div className="action-title">{event.action}</div>
                    {event.description && (
                      <div className="action-description">{event.description}</div>
                    )}
                  </div>
                </td>
                <td>
                  {event.userId ? (
                    <div className="user-info">
                      <div className="user-name">{event.userId.name}</div>
                      <div className="user-email">{event.userId.email}</div>
                    </div>
                  ) : (
                    <span className="no-user">-</span>
                  )}
                </td>
                <td>
                  <div className="ip-info">
                    <span className="ip-address">{event.ipAddress}</span>
                    <div className="ip-actions">
                      <button 
                        onClick={() => handleAnalyzeIp(event.ipAddress)}
                        className="ip-action-btn"
                        title="IP Analizi"
                      >
                        🔍
                      </button>
                    </div>
                  </div>
                </td>
                <td>
                  {event.location?.country ? (
                    <div className="location-info">
                      <div className="country">{event.location.country}</div>
                      {event.location.city && (
                        <div className="city">{event.location.city}</div>
                      )}
                    </div>
                  ) : (
                    <span className="no-location">-</span>
                  )}
                </td>
                <td>
                  <div className="device-info">
                    <span className="device-icon">{getDeviceIcon(event.device?.type)}</span>
                    <div className="device-details">
                      <div className="device-type">{event.device?.type || 'unknown'}</div>
                      {event.device?.browser && (
                        <div className="device-browser">{event.device.browser}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskLevelColor(event.riskLevel) }}
                  >
                    {event.riskLevel}
                  </span>
                </td>
                <td>
                  <span className="status-badge">{event.status}</span>
                </td>
                <td>
                  <div className="flags-container">
                    {event.flags?.isSuspicious && <span className="flag suspicious" title="Şüpheli">⚠️</span>}
                    {event.flags?.isBlocked && <span className="flag blocked" title="Engellenmiş">🚫</span>}
                    {event.flags?.requiresReview && <span className="flag review" title="İnceleme Gerekli">👁️</span>}
                    {event.flags?.isVPN && <span className="flag vpn" title="VPN">🔒</span>}
                    {event.flags?.isProxy && <span className="flag proxy" title="Proxy">🌐</span>}
                    {event.flags?.isTor && <span className="flag tor" title="Tor">🧅</span>}
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <div className="date">{formatDate(event.createdAt)}</div>
                    <div className="time-ago">{formatTimeAgo(event.createdAt)}</div>
                  </div>
                </td>
                <td>
                  <div className="event-actions">
                    <button 
                      onClick={() => handleViewEvent(event)}
                      className="action-btn view-btn"
                      title="Detayları Görüntüle"
                    >
                      👁️
                    </button>
                    {event.status === 'pending' && (
                      <select
                        onChange={(e) => handleUpdateEventStatus(event._id, e.target.value)}
                        className="status-select"
                        title="Durum Güncelle"
                      >
                        <option value="">Durum</option>
                        <option value="reviewed">İncelendi</option>
                        <option value="resolved">Çözüldü</option>
                        <option value="false_positive">Yanlış Pozitif</option>
                      </select>
                    )}
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
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} olay)
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
      {events.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h3>Henüz güvenlik olayı yok</h3>
          <p>Güvenlik olayları burada görüntülenecek</p>
        </div>
      )}

      {/* Security Event Modal */}
      {showEventModal && selectedEvent && (
        <SecurityEventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          event={selectedEvent}
          onRefresh={fetchEvents}
        />
      )}

      {/* IP Analysis Modal */}
      {showIpModal && selectedIp && (
        <IpAnalysisModal
          isOpen={showIpModal}
          onClose={() => setShowIpModal(false)}
          ipAddress={selectedIp}
          onBlock={handleBlockIp}
          onUnblock={handleUnblockIp}
        />
      )}
    </div>
  );
};

export default SecurityManagement; 