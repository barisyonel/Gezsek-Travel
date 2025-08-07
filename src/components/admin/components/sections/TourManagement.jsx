import React, { useState } from 'react';
import TourModal from '../modals/TourModal';
import { useTourManagement } from '../../hooks/useTourManagement';
import './TourManagement.css';

const TourManagement = ({ tours, fetchDashboardData }) => {
  const [showTourModal, setShowTourModal] = useState(false);
  const [showEditTourModal, setShowEditTourModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourFilters, setTourFilters] = useState({ search: '', category: 'all', status: 'all' });

  const {
    tourForm,
    editTourForm,
    handleTourFormChange,
    handleEditTourFormChange,
    handleAddTour,
    handleUpdateTour,
    handleDeleteTour,
    handleEditTour
  } = useTourManagement({ tours, fetchDashboardData, setShowTourModal, setShowEditTourModal, setSelectedTour });

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title?.toLowerCase().includes(tourFilters.search.toLowerCase()) ||
                         tour.location?.toLowerCase().includes(tourFilters.search.toLowerCase());
    const matchesCategory = tourFilters.category === 'all' || tour.category === tourFilters.category;
    const matchesStatus = tourFilters.status === 'all' || 
                         (tourFilters.status === 'active' && tour.isActive) ||
                         (tourFilters.status === 'inactive' && !tour.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="tours-section">
      <div className="section-header">
        <h2>Tur Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Tur ara..."
            value={tourFilters.search}
            onChange={(e) => setTourFilters({...tourFilters, search: e.target.value})}
            className="search-input"
          />
          <select
            value={tourFilters.category}
            onChange={(e) => setTourFilters({...tourFilters, category: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="Yaz Turları">Yaz Turları</option>
            <option value="Kültür Turları">Kültür Turları</option>
            <option value="Gemi Turları">Gemi Turları</option>
            <option value="Kıbrıs Turları">Kıbrıs Turları</option>
            <option value="Doğa Turları">Doğa Turları</option>
            <option value="Günübirlik Turlar">Günübirlik Turlar</option>
          </select>
          <select
            value={tourFilters.status}
            onChange={(e) => setTourFilters({...tourFilters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
          <button onClick={() => setShowTourModal(true)} className="add-btn">
            ➕ Yeni Tur
          </button>
        </div>
      </div>

      {/* Debug bilgisi */}
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <strong>Debug:</strong> {filteredTours?.length || 0} tur bulundu
      </div>

      <div className="tours-grid">
        {filteredTours && filteredTours.length > 0 ? (
          filteredTours.map(tour => (
            <div key={tour._id} className="tour-card">
              <div className="tour-image">
                <img src={tour.image} alt={tour.title} />
                <div className="tour-overlay">
                  <button 
                    className="edit-btn" 
                    title="Düzenle"
                    onClick={() => handleEditTour(tour)}
                  >
                    ✏️ Düzenle
                  </button>
                  <button 
                    className="delete-btn" 
                    title="Sil"
                    onClick={() => handleDeleteTour(tour._id, tour.title)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
              <div className="tour-content">
                <h3>{tour.title}</h3>
                <p className="tour-category">{tour.category}</p>
                <p className="tour-price">₺{tour.price}</p>
                <p className="tour-location">📍 {tour.location}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tours">
            <p>Tur bulunamadı</p>
          </div>
        )}
      </div>

      {/* Tour Modal */}
      {showTourModal && (
        <TourModal
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          formData={tourForm}
          onChange={handleTourFormChange}
          onSubmit={handleAddTour}
          title="Yeni Tur Ekle"
          submitText="Tur Ekle"
        />
      )}

      {/* Edit Tour Modal */}
      {showEditTourModal && (
        <TourModal
          isOpen={showEditTourModal}
          onClose={() => setShowEditTourModal(false)}
          formData={editTourForm}
          onChange={handleEditTourFormChange}
          onSubmit={handleUpdateTour}
          title="Tur Düzenle"
          submitText="Güncelle"
          isEdit={true}
        />
      )}
    </div>
  );
};

export default TourManagement; 