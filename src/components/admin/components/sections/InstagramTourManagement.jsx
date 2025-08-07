import React, { useState, useEffect } from 'react';
import InstagramTourModal from '../modals/InstagramTourModal';
import './InstagramTourManagement.css';

const InstagramTourManagement = () => {
  const [instagramTours, setInstagramTours] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchInstagramTours();
    fetchAnalytics();
  }, []);

  const fetchInstagramTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/instagram-tours/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInstagramTours(data);
      }
    } catch (error) {
      console.error('Error fetching Instagram tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/instagram-tours/admin/analytics', {
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

  const handleAddTour = () => {
    setEditingTour(null);
    setShowModal(true);
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour);
    setShowModal(true);
  };

  const handleSaveTour = async (tourData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingTour 
        ? `/api/instagram-tours/admin/${editingTour._id}`
        : '/api/instagram-tours/admin';
      
      const method = editingTour ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tourData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingTour(null);
        fetchInstagramTours();
        fetchAnalytics();
        alert(editingTour ? 'Instagram turu güncellendi!' : 'Instagram turu eklendi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteTour = async (tourId, tourTitle) => {
    if (!window.confirm(`${tourTitle} Instagram turunu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instagram-tours/admin/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchInstagramTours();
        fetchAnalytics();
        alert('Instagram turu silindi!');
      } else {
        const error = await response.json();
        alert(error.message || 'Silme hatası');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Silme hatası');
    }
  };

  const handleToggleActive = async (tourId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instagram-tours/admin/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchInstagramTours();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleToggleFeatured = async (tourId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instagram-tours/admin/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured: !currentStatus })
      });

      if (response.ok) {
        fetchInstagramTours();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleReorder = async (tourId, direction) => {
    try {
      const currentIndex = instagramTours.findIndex(tour => tour._id === tourId);
      if (currentIndex === -1) return;

      const newTours = [...instagramTours];
      if (direction === 'up' && currentIndex > 0) {
        [newTours[currentIndex], newTours[currentIndex - 1]] = 
        [newTours[currentIndex - 1], newTours[currentIndex]];
      } else if (direction === 'down' && currentIndex < newTours.length - 1) {
        [newTours[currentIndex], newTours[currentIndex + 1]] = 
        [newTours[currentIndex + 1], newTours[currentIndex]];
      }

      const tourIds = newTours.map(tour => tour._id);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/instagram-tours/admin/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tourIds })
      });

      if (response.ok) {
        fetchInstagramTours();
      }
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const filteredTours = instagramTours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         tour.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || tour.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && tour.isActive) ||
                         (filters.status === 'inactive' && !tour.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="instagram-tour-management-section">
      <div className="section-header">
        <h2>📸 Instagram Tour Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleAddTour} className="add-btn">
            ➕ Yeni Instagram Tour Ekle
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="analytics-dashboard">
          <h3>📊 Instagram Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">📸</div>
              <div className="analytics-content">
                <h4>Toplam Tour</h4>
                <p>{analytics.totalTours}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">✅</div>
              <div className="analytics-content">
                <h4>Aktif Tour</h4>
                <p>{analytics.activeTours}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">⭐</div>
              <div className="analytics-content">
                <h4>Öne Çıkan</h4>
                <p>{analytics.featuredTours}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">❤️</div>
              <div className="analytics-content">
                <h4>Toplam Beğeni</h4>
                <p>{analytics.totalLikes.toLocaleString()}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">👁️</div>
              <div className="analytics-content">
                <h4>Toplam Görüntüleme</h4>
                <p>{analytics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {analytics.topTours.length > 0 && (
            <div className="top-tours">
              <h4>🔥 En Popüler Tourlar</h4>
              <div className="top-tours-list">
                {analytics.topTours.map((tour, index) => (
                  <div key={tour._id} className="top-tour-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="title">{tour.title}</span>
                    <span className="engagement">{tour.engagement} etkileşim</span>
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
            placeholder="Tour ara..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="Yaz Turlari">Yaz Turları</option>
            <option value="Kultur Turlari">Kültür Turları</option>
            <option value="Gemi Turlari">Gemi Turları</option>
            <option value="Kibris Turlari">Kıbrıs Turları</option>
            <option value="Gunubirlik Turlar">Günübirlik Turlar</option>
            <option value="Doga Turlari">Doğa Turları</option>
            <option value="Instagram Ozel">Instagram Özel</option>
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
            <option value="inactive">Donduruldu</option>
          </select>
        </div>
      </div>

      {/* Instagram Tours Grid */}
      <div className="instagram-tours-grid">
        {filteredTours.map((tour) => (
          <div key={tour._id} className="instagram-tour-card">
            <div className="tour-image">
              <img src={tour.image} alt={tour.title} />
              <div className="tour-overlay">
                <div className="tour-badge order">#{tour.order}</div>
                <div className={`tour-badge status ${tour.isActive ? 'active' : 'inactive'}`}>
                  {tour.isActive ? 'Aktif' : 'Donduruldu'}
                </div>
                {tour.isFeatured && (
                  <div className="tour-badge featured">⭐ Öne Çıkan</div>
                )}
              </div>
            </div>
            
            <div className="tour-content">
              <h4>{tour.title}</h4>
              <p className="tour-description">{tour.shortDescription || tour.description}</p>
              
              <div className="tour-details">
                <div className="detail-item">
                  <span className="label">Kategori:</span>
                  <span className="value">{tour.category}</span>
                </div>
                {tour.location && (
                  <div className="detail-item">
                    <span className="label">Lokasyon:</span>
                    <span className="value">{tour.location}</span>
                  </div>
                )}
                {tour.price && (
                  <div className="detail-item">
                    <span className="label">Fiyat:</span>
                    <span className="value price">{tour.price}</span>
                  </div>
                )}
                {tour.duration && (
                  <div className="detail-item">
                    <span className="label">Süre:</span>
                    <span className="value">{tour.duration}</span>
                  </div>
                )}
              </div>

              {/* Instagram Stats */}
              <div className="instagram-stats">
                <div className="stat-item">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-value">{tour.likes}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-value">{tour.views}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💬</span>
                  <span className="stat-value">{tour.comments}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📤</span>
                  <span className="stat-value">{tour.shares}</span>
                </div>
              </div>

              {/* Hashtags */}
              {tour.hashtags && tour.hashtags.length > 0 && (
                <div className="hashtags">
                  {tour.hashtags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="hashtag">#{tag}</span>
                  ))}
                  {tour.hashtags.length > 3 && (
                    <span className="hashtag-more">+{tour.hashtags.length - 3}</span>
                  )}
                </div>
              )}

              <div className="tour-actions">
                <button 
                  onClick={() => handleEditTour(tour)}
                  className="edit-btn"
                  title="Düzenle"
                >
                  ✏️ Düzenle
                </button>
                
                <button 
                  onClick={() => handleToggleActive(tour._id, tour.isActive)}
                  className={`toggle-btn ${tour.isActive ? 'deactivate' : 'activate'}`}
                  title={tour.isActive ? 'Dondur' : 'Aktif Yap'}
                >
                  {tour.isActive ? '⏸️ Dondur' : '▶️ Aktif Yap'}
                </button>
                
                <button 
                  onClick={() => handleToggleFeatured(tour._id, tour.isFeatured)}
                  className={`feature-btn ${tour.isFeatured ? 'unfeature' : 'feature'}`}
                  title={tour.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}
                >
                  {tour.isFeatured ? '⭐ Kaldır' : '⭐ Öne Çıkar'}
                </button>
                
                <button 
                  onClick={() => handleReorder(tour._id, 'up')}
                  className="reorder-btn"
                  disabled={tour.order === 1}
                  title="Yukarı Taşı"
                >
                  ⬆️
                </button>
                
                <button 
                  onClick={() => handleReorder(tour._id, 'down')}
                  className="reorder-btn"
                  disabled={tour.order === instagramTours.length}
                  title="Aşağı Taşı"
                >
                  ⬇️
                </button>
                
                <button 
                  onClick={() => handleDeleteTour(tour._id, tour.title)}
                  className="delete-btn"
                  title="Sil"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTours.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h3>Henüz Instagram Tour'u yok</h3>
          <p>İlk Instagram tour'unuzu ekleyerek başlayın!</p>
          <button onClick={handleAddTour} className="add-btn">
            ➕ İlk Tour'u Ekle
          </button>
        </div>
      )}

      {/* Instagram Tour Modal */}
      {showModal && (
        <InstagramTourModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          tour={editingTour}
          onSave={handleSaveTour}
          title={editingTour ? 'Instagram Tour Düzenle' : 'Yeni Instagram Tour Ekle'}
        />
      )}
    </div>
  );
};

export default InstagramTourManagement; 