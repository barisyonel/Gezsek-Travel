import React, { useState, useEffect } from 'react';
import LanguageModal from '../modals/LanguageModal';
import TranslationModal from '../modals/TranslationModal';
import './MultiLanguageManagement.css';

const MultiLanguageManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchLanguages();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchLanguages = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/languages/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/languages/admin/statistics', {
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

  const fetchTranslations = async (languageCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/languages/admin/${languageCode}/translations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations);
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };

  const handleCreateLanguage = () => {
    setEditingLanguage(null);
    setShowLanguageModal(true);
  };

  const handleEditLanguage = (language) => {
    setEditingLanguage(language);
    setShowLanguageModal(true);
  };

  const handleManageTranslations = (language) => {
    setSelectedLanguage(language);
    fetchTranslations(language.code);
    setShowTranslationModal(true);
  };

  const handleSetDefault = async (languageCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/languages/admin/${languageCode}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchLanguages();
        alert('Varsayılan dil ayarlandı!');
      } else {
        const error = await response.json();
        alert(error.message || 'Varsayılan dil ayarlama hatası');
      }
    } catch (error) {
      console.error('Error setting default language:', error);
      alert('Varsayılan dil ayarlama hatası');
    }
  };

  const handleSaveLanguage = async (languageData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingLanguage
        ? `/api/languages/admin/${editingLanguage.code}`
        : '/api/languages/admin';

      const method = editingLanguage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(languageData)
      });

      if (response.ok) {
        setShowLanguageModal(false);
        setEditingLanguage(null);
        fetchLanguages();
        fetchStatistics();
        alert(editingLanguage ? 'Dil güncellendi!' : 'Dil oluşturuldu!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving language:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteLanguage = async (languageCode, languageName) => {
    if (!window.confirm(`${languageName} dilini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/languages/admin/${languageCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchLanguages();
        fetchStatistics();
        alert('Dil silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting language:', error);
      alert('Silme hatası');
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

  const getDirectionIcon = (direction) => {
    return direction === 'rtl' ? '➡️' : '⬅️';
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
    <div className="multi-language-management-section">
      <div className="section-header">
        <h2>🌍 Çoklu Dil Desteği Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleCreateLanguage} className="add-btn">
            ➕ Yeni Dil
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="statistics-dashboard">
          <h3>📊 Dil İstatistikleri</h3>
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div className="stat-content">
                <h4>Toplam Dil</h4>
                <p>{statistics.totalLanguages}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h4>Aktif Diller</h4>
                <p>{statistics.activeLanguages}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h4>Varsayılan Dil</h4>
                <p>{statistics.defaultLanguage?.nativeName || 'Ayarlanmamış'}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h4>Toplam Çeviri</h4>
                <p>{statistics.languageStats?.reduce((sum, lang) => sum + (lang.translations?.totalKeys || 0), 0) || 0}</p>
              </div>
            </div>
          </div>

          {/* Language Progress */}
          {statistics.languageStats && statistics.languageStats.length > 0 && (
            <div className="language-progress-section">
              <h4>📈 Dil İlerleme Durumu</h4>
              <div className="language-progress-grid">
                {statistics.languageStats.map((lang) => (
                  <div key={lang.code} className="language-progress-card">
                    <div className="language-header">
                      <span className="language-flag">{lang.flag}</span>
                      <span className="language-name">{lang.nativeName}</span>
                      {lang.isDefault && <span className="default-badge">⭐</span>}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${lang.translationProgress || 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span className="progress-text">{lang.translationProgress || 0}%</span>
                      <span className="translation-count">
                        {lang.translations?.translatedKeys || 0} / {lang.translations?.totalKeys || 0}
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
            placeholder="Dil ara..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
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

      {/* Languages Table */}
      <div className="languages-table-container">
        <table className="languages-table">
          <thead>
            <tr>
              <th>Dil</th>
              <th>Kod</th>
              <th>Yön</th>
              <th>Durum</th>
              <th>Çeviri İlerlemesi</th>
              <th>Kullanıcı Sayısı</th>
              <th>Oluşturan</th>
              <th>Son Güncelleme</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((language) => (
              <tr key={language._id}>
                <td>
                  <div className="language-info">
                    <span className="language-flag">{language.flag}</span>
                    <div className="language-details">
                      <div className="language-name">{language.name}</div>
                      <div className="language-native">{language.nativeName}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="language-code">{language.code}</span>
                </td>
                <td>
                  <span className="direction-icon" title={language.direction === 'rtl' ? 'Sağdan Sola' : 'Soldan Sağa'}>
                    {getDirectionIcon(language.direction)}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(language.status) }}
                  >
                    {language.status}
                  </span>
                </td>
                <td>
                  <div className="translation-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${language.translationProgress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{language.translationProgress || 0}%</span>
                  </div>
                </td>
                <td>
                  <div className="usage-info">
                    <span className="usage-count">{language.usage?.totalUsers || 0}</span>
                    {language.isRecentlyUsed && <span className="recent-badge">🕒</span>}
                  </div>
                </td>
                <td>
                  <div className="creator-info">
                    <div className="creator-name">{language.createdBy?.name}</div>
                    <div className="creator-email">{language.createdBy?.email}</div>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <div className="date">{formatDate(language.updatedAt)}</div>
                    {language.translations?.lastUpdated && (
                      <div className="translation-date">
                        Çeviri: {formatDate(language.translations.lastUpdated)}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="language-actions">
                    {!language.isDefault && (
                      <button 
                        onClick={() => handleSetDefault(language.code)}
                        className="action-btn default-btn"
                        title="Varsayılan Yap"
                      >
                        ⭐
                      </button>
                    )}
                    <button 
                      onClick={() => handleManageTranslations(language)}
                      className="action-btn translate-btn"
                      title="Çevirileri Yönet"
                    >
                      📝
                    </button>
                    <button 
                      onClick={() => handleEditLanguage(language)}
                      className="action-btn edit-btn"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    {!language.isDefault && (
                      <button 
                        onClick={() => handleDeleteLanguage(language.code, language.name)}
                        className="action-btn delete-btn"
                        title="Sil"
                      >
                        🗑️
                      </button>
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
            Sayfa {pagination.page} / {pagination.pages} ({pagination.total} dil)
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
      {languages.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <h3>Henüz dil yok</h3>
          <p>Çoklu dil desteği için diller eklemeye başlayın</p>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <LanguageModal
          isOpen={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          language={editingLanguage}
          onSave={handleSaveLanguage}
          title={editingLanguage ? 'Dil Düzenle' : 'Yeni Dil Ekle'}
        />
      )}

      {/* Translation Modal */}
      {showTranslationModal && selectedLanguage && (
        <TranslationModal
          isOpen={showTranslationModal}
          onClose={() => setShowTranslationModal(false)}
          language={selectedLanguage}
          translations={translations}
          onRefresh={() => fetchTranslations(selectedLanguage.code)}
        />
      )}
    </div>
  );
};

export default MultiLanguageManagement; 