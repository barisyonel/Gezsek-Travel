import React, { useState, useEffect } from 'react';
import SearchModal from '../modals/SearchModal';
import SearchResultsModal from '../modals/SearchResultsModal';
import './AdvancedSearchManagement.css';

const AdvancedSearchManagement = () => {
  const [searches, setSearches] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
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
    fetchSearches();
    fetchAnalytics();
    fetchTypes();
    fetchCategories();
  }, [filters, pagination.page]);

  const fetchSearches = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/search/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/search/admin/analytics/overview', {
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

  const fetchTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/search/admin/types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/search/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateSearch = () => {
    setEditingSearch(null);
    setShowSearchModal(true);
  };

  const handleEditSearch = (search) => {
    setEditingSearch(search);
    setShowSearchModal(true);
  };

  const handleExecuteSearch = async (search) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/search/admin/${search._id}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setSelectedSearch(search);
        setShowResultsModal(true);
        fetchSearches(); // Refresh to update analytics
      } else {
        const error = await response.json();
        alert(error.message || 'Arama hatası');
      }
    } catch (error) {
      console.error('Error executing search:', error);
      alert('Arama hatası');
    }
  };

  const handleQuickSearch = async (searchData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/search/admin/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(searchData)
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setSelectedSearch({ name: 'Hızlı Arama', type: searchData.type });
        setShowResultsModal(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Hızlı arama hatası');
      }
    } catch (error) {
      console.error('Error quick search:', error);
      alert('Hızlı arama hatası');
    }
  };

  const handleSaveSearch = async (searchData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingSearch
        ? `/api/search/admin/${editingSearch._id}`
        : '/api/search/admin';

      const method = editingSearch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(searchData)
      });

      if (response.ok) {
        setShowSearchModal(false);
        setEditingSearch(null);
        fetchSearches();
        alert(editingSearch ? 'Arama güncellendi!' : 'Arama oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteSearch = async (searchId, searchName) => {
    if (!window.confirm(`${searchName} aramasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/search/admin/${searchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSearches();
        alert('Arama silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Silme hatası');
    }
  };

  const getTypeIcon = (type) => {
    const typeData = types.find(t => t.value === type);
    return typeData ? typeData.icon : '🔍';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'tour': return '#28a745';
      case 'user': return '#17a2b8';
      case 'blog': return '#fd7e14';
      case 'purchase': return '#6f42c1';
      case 'message': return '#20c997';
      case 'notification': return '#ffc107';
      case 'instagram': return '#e83e8c';
      case 'custom': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'basic': return '#6c757d';
      case 'advanced': return '#17a2b8';
      case 'saved': return '#28a745';
      case 'quick': return '#fd7e14';
      case 'analytics': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'draft': return '#ffc107';
      default: return '#6c757d';
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

  const formatExecutionTime = (time) => {
    if (!time) return '-';
    return `${time}ms`;
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="advanced-search-management-section">
      <div className="section-header">
        <h2>🔍 Gelişmiş Arama & Filtre Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleCreateSearch} className="add-btn">
            ➕ Yeni Arama
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-dashboard">
          <h3>📊 Arama Analitikleri</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">🔍</div>
              <div className="analytics-content">
                <h4>Toplam Arama</h4>
                <p>{analytics.totalSearches}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">✅</div>
              <div className="analytics-content">
                <h4>Aktif Aramalar</h4>
                <p>{analytics.activeSearches}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">🏆</div>
              <div className="analytics-content">
                <h4>Popüler Aramalar</h4>
                <p>{analytics.popularSearches}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">🕒</div>
              <div className="analytics-content">
                <h4>Son Kullanılan</h4>
                <p>{analytics.recentSearches}</p>
              </div>
            </div>
          </div>

          {/* Most Used Searches */}
          {analytics.mostUsedSearches && analytics.mostUsedSearches.length > 0 && (
            <div className="most-used-searches">
              <h4>🏆 En Çok Kullanılan Aramalar</h4>
              <div className="most-used-grid">
                {analytics.mostUsedSearches.map((search, index) => (
                  <div key={search._id} className="most-used-card">
                    <div className="search-header">
                      <span className="search-icon">{getTypeIcon(search.type)}</span>
                      <span className="search-name">{search.name}</span>
                    </div>
                    <div className="search-stats">
                      <span className="stat">Kullanım: {search.analytics.usageCount}</span>
                      <span className="stat">Ortalama: {formatExecutionTime(search.analytics.averageExecutionTime)}</span>
                    </div>
                    <div className="search-actions">
                      <button 
                        onClick={() => handleExecuteSearch(search)}
                        className="action-btn execute-btn"
                        title="Çalıştır"
                      >
                        ▶️
                      </button>
                      <button 
                        onClick={() => handleEditSearch(search)}
                        className="action-btn edit-btn"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Search */}
      <div className="quick-search-section">
        <h3>⚡ Hızlı Arama</h3>
        <div className="quick-search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Arama terimi..."
              className="search-input"
              id="quickSearchTerm"
            />
            <select className="search-type-select" id="quickSearchType">
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <button 
              onClick={() => {
                const term = document.getElementById('quickSearchTerm').value;
                const type = document.getElementById('quickSearchType').value;
                if (term && type) {
                  handleQuickSearch({ type, searchTerm: term });
                }
              }}
              className="quick-search-btn"
            >
              🔍 Ara
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Arama ara..."
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
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
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
            <option value="inactive">Pasif</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
      </div>

      {/* Searches Table */}
      <div className="searches-table-container">
        <table className="searches-table">
          <thead>
            <tr>
              <th>Tür</th>
              <th>İsim</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Oluşturan</th>
              <th>Son Kullanım</th>
              <th>Performans</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {searches.map((search) => (
              <tr key={search._id}>
                <td>
                  <span 
                    className="type-badge"
                    style={{ backgroundColor: getTypeColor(search.type) }}
                  >
                    {getTypeIcon(search.type)} {search.type}
                  </span>
                </td>
                <td>
                  <div className="search-info">
                    <div className="search-name">{search.name}</div>
                    <div className="search-description">{search.description}</div>
                  </div>
                </td>
                <td>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(search.category) }}
                  >
                    {search.category}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(search.status) }}
                  >
                    {search.status}
                  </span>
                </td>
                <td>
                  <div className="creator-info">
                    <div className="creator-name">{search.createdBy?.name}</div>
                    <div className="creator-email">{search.createdBy?.email}</div>
                  </div>
                </td>
                <td>
                  <div className="usage-info">
                    <div className="last-used">{formatDate(search.analytics.lastUsed)}</div>
                    <div className="usage-count">Kullanım: {search.analytics.usageCount}</div>
                  </div>
                </td>
                <td>
                  <div className="performance-info">
                    <div className="execution-time">
                      Ortalama: {formatExecutionTime(search.analytics.averageExecutionTime)}
                    </div>
                    <div className="last-execution">
                      Son: {formatExecutionTime(search.results?.executionTime)}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="search-actions">
                    <button 
                      onClick={() => handleExecuteSearch(search)}
                      className="action-btn execute-btn"
                      title="Çalıştır"
                    >
                      ▶️
                    </button>
                    <button 
                      onClick={() => handleEditSearch(search)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteSearch(search._id, search.name)}
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
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} arama)
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
      {searches.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Henüz arama yok</h3>
          <p>Gelişmiş arama ve filtreler oluşturmaya başlayın</p>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          search={editingSearch}
          onSave={handleSaveSearch}
          types={types}
          categories={categories}
          title={editingSearch ? 'Arama Düzenle' : 'Yeni Arama Oluştur'}
        />
      )}

      {/* Search Results Modal */}
      {showResultsModal && selectedSearch && searchResults && (
        <SearchResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          search={selectedSearch}
          results={searchResults}
        />
      )}
    </div>
  );
};

export default AdvancedSearchManagement; 