import React from 'react';
import './ReservationManagement.css';

const ReservationManagement = ({ reservations, fetchDashboardData }) => {
  return (
    <div className="reservations-section">
      <div className="section-header">
        <h2>Rezervasyon Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Rezervasyon ara..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="confirmed">Onaylandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>Tur</th>
              <th>Tarih</th>
              <th>Kişi Sayısı</th>
              <th>Toplam</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {reservations && reservations.length > 0 ? (
              reservations.map(reservation => (
                <tr key={reservation._id}>
                  <td>{reservation.userName}</td>
                  <td>{reservation.tourTitle}</td>
                  <td>{new Date(reservation.tourDate).toLocaleDateString('tr-TR')}</td>
                  <td>{reservation.participantCount}</td>
                  <td>₺{reservation.totalPrice}</td>
                  <td>
                    <span className={`status-badge ${reservation.status}`}>
                      {reservation.status === 'pending' && 'Beklemede'}
                      {reservation.status === 'confirmed' && 'Onaylandı'}
                      {reservation.status === 'cancelled' && 'İptal Edildi'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="confirm-btn">✅</button>
                      <button className="cancel-btn">❌</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Henüz rezervasyon bulunmuyor
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationManagement; 