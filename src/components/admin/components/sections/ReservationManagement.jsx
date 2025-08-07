import React, { useState } from 'react';
import ReservationModal from '../modals/ReservationModal';
import './ReservationManagement.css';

const ReservationManagement = ({ reservations, fetchDashboardData }) => {
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservationFilters, setReservationFilters] = useState({ search: '', status: 'all' });

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.userName?.toLowerCase().includes(reservationFilters.search.toLowerCase()) ||
                         reservation.tourTitle?.toLowerCase().includes(reservationFilters.search.toLowerCase());
    const matchesStatus = reservationFilters.status === 'all' || reservation.status === reservationFilters.status;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/tours/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Rezervasyon durumu başarıyla güncellendi!');
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert(error.message || 'Durum güncellenirken hata oluştu');
      }
    } catch (err) {
      alert('Durum güncellenirken hata oluştu');
      console.error('Status update error:', err);
    }
  };

  const handleViewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  return (
    <div className="reservations-section">
      <div className="section-header">
        <h2>Rezervasyon Yönetimi</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Rezervasyon ara..."
            value={reservationFilters.search}
            onChange={(e) => setReservationFilters({...reservationFilters, search: e.target.value})}
            className="search-input"
          />
          <select
            value={reservationFilters.status}
            onChange={(e) => setReservationFilters({...reservationFilters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="confirmed">Onaylandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Debug bilgisi */}
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <strong>Debug:</strong> {filteredReservations?.length || 0} rezervasyon bulundu
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th><span>Müşteri</span></th>
              <th><span>Tur</span></th>
              <th><span>Tarih</span></th>
              <th><span>Kişi Sayısı</span></th>
              <th><span>Toplam</span></th>
              <th><span>Durum</span></th>
              <th><span>İşlemler</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations && filteredReservations.length > 0 ? (
              filteredReservations.map(reservation => (
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
                      <button 
                        className="view-btn"
                        onClick={() => handleViewReservation(reservation)}
                        title="Detayları Görüntüle"
                      >
                        👁️ Detay
                      </button>
                      {reservation.status === 'pending' && (
                        <>
                          <button 
                            className="confirm-btn"
                            onClick={() => handleStatusUpdate(reservation._id, 'confirmed')}
                            title="Onayla"
                          >
                            ✅ Onayla
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={() => handleStatusUpdate(reservation._id, 'cancelled')}
                            title="İptal Et"
                          >
                            ❌ İptal
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Rezervasyon bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <ReservationModal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          reservation={selectedReservation}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default ReservationManagement; 