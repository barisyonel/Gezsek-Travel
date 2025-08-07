import React from 'react';
import './TourManagement.css';

const TourManagement = ({ tours, fetchDashboardData }) => {
  return (
    <div className="tours-section">
      <div className="section-header">
        <h2>Tur Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Tur ara..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">Tüm Kategoriler</option>
            <option value="Yaz Turları">Yaz Turları</option>
            <option value="Kültür Turları">Kültür Turları</option>
            <option value="Gemi Turları">Gemi Turları</option>
            <option value="Kıbrıs Turları">Kıbrıs Turları</option>
          </select>
          <button className="add-btn">
            ➕ Yeni Tur
          </button>
        </div>
      </div>

      <div className="tours-grid">
        {tours && tours.length > 0 ? (
          tours.map(tour => (
            <div key={tour._id} className="tour-card">
              <div className="tour-image">
                <img src={tour.image} alt={tour.title} />
                <div className="tour-overlay">
                  <button className="edit-btn" title="Düzenle">✏️</button>
                  <button className="delete-btn" title="Sil">🗑️</button>
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
            <p>Henüz tur bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourManagement; 