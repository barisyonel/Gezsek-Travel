import React, { useState, useEffect } from 'react';
import ReportModal from '../modals/ReportModal';
import ReportViewModal from '../modals/ReportViewModal';
import './ReportManagement.css';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [dataSources, setDataSources] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    createdBy: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
    fetchUsers();
    fetchDataSources();
  }, [filters, pagination.page]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/reports/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/admin/analytics/overview', {
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

  const fetchDataSources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/admin/data-sources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDataSources(data);
      }
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const handleCreateReport = () => {
    setEditingReport(null);
    setShowReportModal(true);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowReportModal(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleSaveReport = async (reportData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingReport
        ? `/api/reports/admin/${editingReport._id}`
        : '/api/reports/admin';

      const method = editingReport ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        setShowReportModal(false);
        setEditingReport(null);
        fetchReports();
        fetchAnalytics();
        alert(editingReport ? 'Rapor güncellendi!' : 'Rapor oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleGenerateReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/admin/${reportId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedReport = await response.json();
        setReports(prev => prev.map(report =>
          report._id === reportId ? updatedReport : report
        ));
        alert('Rapor başarıyla oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Rapor oluşturma hatası');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Rapor oluşturma hatası');
    }
  };

  const handleExportReport = async (reportId, format = 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/admin/${reportId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ format })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${format.toUpperCase()} formatında dışa aktarıldı!`);
        // In a real app, you might want to trigger a download here
      } else {
        const error = await response.json();
        alert(error.message || 'Dışa aktarma hatası');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Dışa aktarma hatası');
    }
  };

  const handleDeleteReport = async (reportId, reportTitle) => {
    if (!window.confirm(`${reportTitle} raporunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/admin/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReports();
        fetchAnalytics();
        alert('Rapor silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Silme hatası');
    }
  };

  const handleProcessScheduled = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/admin/process-scheduled', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        fetchReports();
        fetchAnalytics();
        alert(`${result.processedCount} planlanmış rapor işlendi!`);
      } else {
        const error = await response.json();
        alert(error.message || 'İşlem hatası');
      }
    } catch (error) {
      console.error('Error processing scheduled reports:', error);
      alert('İşlem hatası');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sales': return '💰';
      case 'revenue': return '📈';
      case 'users': return '👥';
      case 'tours': return '🗺️';
      case 'reservations': return '📅';
      case 'analytics': return '📊';
      case 'custom': return '⚙️';
      default: return '📋';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sales': return '#28a745';
      case 'revenue': return '#fd7e14';
      case 'users': return '#17a2b8';
      case 'tours': return '#6f42c1';
      case 'reservations': return '#20c997';
      case 'analytics': return '#667eea';
      case 'custom': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'financial': return '#28a745';
      case 'operational': return '#17a2b8';
      case 'marketing': return '#fd7e14';
      case 'user': return '#6f42c1';
      case 'performance': return '#20c997';
      case 'custom': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#6c757d';
      case 'active': return '#28a745';
      case 'archived': return '#dc3545';
      case 'scheduled': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getVisualizationIcon = (visualizationType) => {
    switch (visualizationType) {
      case 'table': return '📋';
      case 'chart': return '📊';
      case 'graph': return '📈';
      case 'dashboard': return '🎛️';
      default: return '📋';
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
    <div className="report-management-section">
      <div className="section-header">
        <h2>📊 Raporlama Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleProcessScheduled} className="process-btn">
            ⏰ Planlanmışları İşle
          </button>
          <button onClick={handleCreateReport} className="add-btn">
            ➕ Yeni Rapor
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-dashboard">
          <h3>📊 Rapor Analitikleri</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">📋</div>
              <div className="analytics-content">
                <h4>Toplam Rapor</h4>
                <p>{analytics.totalReports}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">✅</div>
              <div className="analytics-content">
                <h4>Aktif Raporlar</h4>
                <p>{analytics.activeReports}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">⏰</div>
              <div className="analytics-content">
                <h4>Planlanmış</h4>
                <p>{analytics.scheduledReports}</p>
              </div>
            </div>
            <div className="analytics-card urgent">
              <div className="analytics-icon">⚠️</div>
              <div className="analytics-content">
                <h4>Gecikmiş</h4>
                <p>{analytics.overdueReports}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">📈</div>
              <div className="analytics-content">
                <h4>Son 7 Gün</h4>
                <p>{analytics.recentReports}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">🔄</div>
              <div className="analytics-content">
                <h4>Son Oluşturulan</h4>
                <p>{analytics.recentlyGenerated}</p>
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

          {/* Category Distribution */}
          {analytics.categoryStats && analytics.categoryStats.length > 0 && (
            <div className="stats-section">
              <h4>📂 Kategori Dağılımı</h4>
              <div className="stats-grid">
                {analytics.categoryStats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-icon">📁</span>
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
            placeholder="Rapor ara..."
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
            <option value="sales">Satış</option>
            <option value="revenue">Gelir</option>
            <option value="users">Kullanıcılar</option>
            <option value="tours">Turlar</option>
            <option value="reservations">Rezervasyonlar</option>
            <option value="analytics">Analitik</option>
            <option value="custom">Özel</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="financial">Finansal</option>
            <option value="operational">Operasyonel</option>
            <option value="marketing">Pazarlama</option>
            <option value="user">Kullanıcı</option>
            <option value="performance">Performans</option>
            <option value="custom">Özel</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="draft">Taslak</option>
            <option value="active">Aktif</option>
            <option value="archived">Arşivlenmiş</option>
            <option value="scheduled">Planlanmış</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.createdBy}
            onChange={(e) => setFilters(prev => ({ ...prev, createdBy: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Oluşturanlar</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Tür</th>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Görselleştirme</th>
              <th>Oluşturan</th>
              <th>Son Oluşturma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>
                  <span 
                    className="type-badge"
                    style={{ backgroundColor: getTypeColor(report.type) }}
                  >
                    {getTypeIcon(report.type)} {report.type}
                  </span>
                </td>
                <td>
                  <div className="report-title">
                    <div className="title-text">{report.title}</div>
                    <div className="title-description">{report.description}</div>
                  </div>
                </td>
                <td>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(report.category) }}
                  >
                    {report.category}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(report.status) }}
                  >
                    {report.status}
                  </span>
                </td>
                <td>
                  <div className="visualization-info">
                    <span className="visualization-icon">
                      {getVisualizationIcon(report.visualization.type)}
                    </span>
                    <span className="visualization-type">{report.visualization.type}</span>
                    {report.visualization.chartType && (
                      <span className="chart-type">({report.visualization.chartType})</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="creator-info">
                    <div className="creator-name">{report.createdBy?.name}</div>
                    <div className="creator-email">{report.createdBy?.email}</div>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <div className="date">{formatDate(report.results?.lastGenerated)}</div>
                    {report.schedule.isScheduled && (
                      <div className="scheduled-info">
                        Sonraki: {formatDate(report.schedule.nextRun)}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="report-actions">
                    <button 
                      onClick={() => handleViewReport(report)}
                      className="action-btn view-btn"
                      title="Görüntüle"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleGenerateReport(report._id)}
                      className="action-btn generate-btn"
                      title="Oluştur"
                    >
                      🔄
                    </button>
                    <button 
                      onClick={() => handleExportReport(report._id, 'pdf')}
                      className="action-btn export-btn"
                      title="PDF Dışa Aktar"
                    >
                      📄
                    </button>
                    <button 
                      onClick={() => handleExportReport(report._id, 'excel')}
                      className="action-btn export-btn"
                      title="Excel Dışa Aktar"
                    >
                      📊
                    </button>
                    <button 
                      onClick={() => handleEditReport(report)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report._id, report.title)}
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
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} rapor)
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
      {reports.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Henüz rapor yok</h3>
          <p>Veri analizi ve raporlar burada görünecek</p>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          report={editingReport}
          onSave={handleSaveReport}
          users={users}
          dataSources={dataSources}
          title={editingReport ? 'Rapor Düzenle' : 'Yeni Rapor Oluştur'}
        />
      )}

      {/* Report View Modal */}
      {showViewModal && selectedReport && (
        <ReportViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          report={selectedReport}
          onGenerate={handleGenerateReport}
          onExport={handleExportReport}
        />
      )}
    </div>
  );
};

export default ReportManagement; 