import React, { useState, useEffect } from 'react';
import AnalyticsModal from '../modals/AnalyticsModal';
import './AnalyticsManagement.css';

const AnalyticsManagement = () => {
  const [analytics, setAnalytics] = useState([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchAnalytics();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/analytics/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/admin/statistics', {
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

  const handleCreateAnalytics = () => {
    setSelectedAnalytics(null);
    setShowAnalyticsModal(true);
  };

  const handleEditAnalytics = (analyticsItem) => {
    setSelectedAnalytics(analyticsItem);
    setShowAnalyticsModal(true);
  };

  const handleGenerateUserActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/admin/generate/user-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        })
      });

      if (response.ok) {
        fetchAnalytics();
        fetchStatistics();
        alert('Kullanıcı aktivite analitiği oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Analitik oluşturma hatası');
      }
    } catch (error) {
      console.error('Error generating user activity analytics:', error);
      alert('Analitik oluşturma hatası');
    }
  };

  const handleGenerateTourAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/admin/generate/tour-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        })
      });

      if (response.ok) {
        fetchAnalytics();
        fetchStatistics();
        alert('Tur analitiği oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Analitik oluşturma hatası');
      }
    } catch (error) {
      console.error('Error generating tour analytics:', error);
      alert('Analitik oluşturma hatası');
    }
  };

  const handleGenerateRevenueAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/admin/generate/revenue-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        })
      });

      if (response.ok) {
        fetchAnalytics();
        fetchStatistics();
        alert('Gelir analitiği oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Analitik oluşturma hatası');
      }
    } catch (error) {
      console.error('Error generating revenue analytics:', error);
      alert('Analitik oluşturma hatası');
    }
  };

  const handleSaveAnalytics = async (analyticsData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedAnalytics
        ? `/api/analytics/admin/${selectedAnalytics._id}`
        : '/api/analytics/admin';

      const method = selectedAnalytics ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(analyticsData)
      });

      if (response.ok) {
        setShowAnalyticsModal(false);
        setSelectedAnalytics(null);
        fetchAnalytics();
        fetchStatistics();
        alert(selectedAnalytics ? 'Analitik güncellendi!' : 'Analitik oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving analytics:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteAnalytics = async (analyticsId, analyticsName) => {
    if (!window.confirm(`${analyticsName} analitiğini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/admin/${analyticsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAnalytics();
        fetchStatistics();
        alert('Analitik silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting analytics:', error);
      alert('Silme hatası');
    }
  };

  const handleExportAnalytics = async (analyticsId, analyticsName, format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/admin/${analyticsId}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create and download file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${analyticsName}_${format}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`${analyticsName} ${format.toUpperCase()} formatında dışa aktarıldı!`);
      } else {
        const error = await response.json();
        alert(error.message || 'Dışa aktarma hatası');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Dışa aktarma hatası');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'user_activity': return '👥';
      case 'tour_analytics': return '🗺️';
      case 'revenue_analytics': return '💰';
      case 'performance_analytics': return '⚡';
      case 'security_analytics': return '🔒';
      case 'custom_report': return '📊';
      default: return '📋';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'user_activity': return 'Kullanıcı Aktivitesi';
      case 'tour_analytics': return 'Tur Analitiği';
      case 'revenue_analytics': return 'Gelir Analitiği';
      case 'performance_analytics': return 'Performans Analitiği';
      case 'security_analytics': return 'Güvenlik Analitiği';
      case 'custom_report': return 'Özel Rapor';
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'draft': return '#6c757d';
      case 'paused': return '#ffc107';
      case 'archived': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getChartTypeIcon = (chartType) => {
    switch (chartType) {
      case 'line': return '📈';
      case 'bar': return '📊';
      case 'pie': return '🥧';
      case 'doughnut': return '🍩';
      case 'area': return '📊';
      case 'scatter': return '🔍';
      case 'table': return '📋';
      case 'heatmap': return '🔥';
      case 'gauge': return '🎯';
      case 'funnel': return '🫖';
      default: return '📊';
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

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-analytics-section">
      <div className="section-header">
        <h2>📊 Dashboard & Analitik Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleCreateAnalytics} className="add-btn">
            ➕ Yeni Analitik
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="statistics-dashboard">
          <h3>📈 Analitik İstatistikleri</h3>
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Toplam Analitik</h4>
                <p>{statistics.summary?.totalAnalytics || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h4>Aktif Analitik</h4>
                <p>{statistics.summary?.activeAnalytics || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <h4>Zamanlanmış</h4>
                <p>{statistics.summary?.scheduledAnalytics || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick Generate Buttons */}
          <div className="quick-generate-section">
            <h4>🚀 Hızlı Analitik Oluştur</h4>
            <div className="quick-generate-buttons">
              <button 
                onClick={handleGenerateUserActivity}
                className="quick-generate-btn user-activity"
              >
                👥 Kullanıcı Aktivitesi
              </button>
              <button 
                onClick={handleGenerateTourAnalytics}
                className="quick-generate-btn tour-analytics"
              >
                🗺️ Tur Analitiği
              </button>
              <button 
                onClick={handleGenerateRevenueAnalytics}
                className="quick-generate-btn revenue-analytics"
              >
                💰 Gelir Analitiği
              </button>
            </div>
          </div>

          {/* Recent Analytics */}
          {statistics.recentAnalytics && statistics.recentAnalytics.length > 0 && (
            <div className="recent-analytics-section">
              <h4>🕒 Son Oluşturulan Analitikler</h4>
              <div className="recent-analytics-grid">
                {statistics.recentAnalytics.map((item) => (
                  <div key={item._id} className="recent-analytics-card">
                    <div className="analytics-header">
                      <span className="type-icon">{getTypeIcon(item.type)}</span>
                      <span className="analytics-name">{item.name}</span>
                    </div>
                    <div className="analytics-meta">
                      <span className="created-by">{item.createdBy?.name}</span>
                      <span className="created-date">{formatDate(item.createdAt)}</span>
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
            placeholder="Analitik ara..."
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
            <option value="user_activity">Kullanıcı Aktivitesi</option>
            <option value="tour_analytics">Tur Analitiği</option>
            <option value="revenue_analytics">Gelir Analitiği</option>
            <option value="performance_analytics">Performans Analitiği</option>
            <option value="security_analytics">Güvenlik Analitiği</option>
            <option value="custom_report">Özel Rapor</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="draft">Taslak</option>
            <option value="paused">Duraklatılmış</option>
            <option value="archived">Arşivlenmiş</option>
          </select>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="analytics-table-container">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Tip</th>
              <th>İsim</th>
              <th>Açıklama</th>
              <th>Grafik Tipi</th>
              <th>Durum</th>
              <th>Zamanlama</th>
              <th>Oluşturan</th>
              <th>Oluşturma Tarihi</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="analytics-type">
                    <span className="type-icon">{getTypeIcon(item.type)}</span>
                    <span className="type-name">{getTypeName(item.type)}</span>
                  </div>
                </td>
                <td>
                  <div className="analytics-name">
                    <div className="name">{item.name}</div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="tags">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="tag-more">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="analytics-description">
                    {item.description || 'Açıklama yok'}
                  </div>
                </td>
                <td>
                  <div className="chart-type">
                    <span className="chart-icon">
                      {getChartTypeIcon(item.visualization?.chartType)}
                    </span>
                    <span className="chart-name">
                      {item.visualization?.chartType || 'Belirtilmemiş'}
                    </span>
                  </div>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="schedule-info">
                    {item.schedule?.isScheduled ? (
                      <div className="scheduled">
                        <span className="schedule-icon">⏰</span>
                        <div className="schedule-details">
                          <div className="frequency">{item.schedule.frequency}</div>
                          {item.schedule.nextRun && (
                            <div className="next-run">
                              {formatDate(item.schedule.nextRun)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="not-scheduled">Zamanlanmamış</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="creator-info">
                    <div className="creator-name">{item.createdBy?.name}</div>
                    <div className="creator-email">{item.createdBy?.email}</div>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <div className="created-date">{formatDate(item.createdAt)}</div>
                    {item.updatedAt && item.updatedAt !== item.createdAt && (
                      <div className="updated-date">
                        Güncelleme: {formatDate(item.updatedAt)}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="analytics-actions">
                    <button 
                      onClick={() => handleEditAnalytics(item)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleExportAnalytics(item._id, item.name, 'json')}
                      className="action-btn export-btn"
                      title="JSON Dışa Aktar"
                    >
                      📄
                    </button>
                    <button 
                      onClick={() => handleExportAnalytics(item._id, item.name, 'csv')}
                      className="action-btn export-btn"
                      title="CSV Dışa Aktar"
                    >
                      📊
                    </button>
                    <button 
                      onClick={() => handleDeleteAnalytics(item._id, item.name)}
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
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} analitik)
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
      {analytics.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Henüz analitik yok</h3>
          <p>Veri analizi ve raporlama için analitikler oluşturun</p>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <AnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          analytics={selectedAnalytics}
          onSave={handleSaveAnalytics}
          title={selectedAnalytics ? 'Analitik Düzenle' : 'Yeni Analitik Oluştur'}
        />
      )}
    </div>
  );
};

export default AnalyticsManagement; 