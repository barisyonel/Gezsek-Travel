import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import '../../App.css';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tours/my/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations);
      } else {
        setError('Rezervasyonlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası');
      console.error('Fetch reservations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tours/reservations/${selectedReservation._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Rezervasyon listesini güncelle
        setReservations(prev => 
          prev.map(res => 
            res._id === selectedReservation._id 
              ? { ...res, status: 'cancelled' }
              : res
          )
        );
        
        // Bildirim gönder
        notificationService.notifyReservationCancelled(
          selectedReservation.tour.title,
          selectedReservation.tourDate
        );
        
        setShowCancelModal(false);
        setSelectedReservation(null);
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (err) {
      alert('İptal işlemi sırasında hata oluştu');
      console.error('Cancel reservation error:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Beklemede', class: 'status-pending' },
      confirmed: { text: 'Onaylandı', class: 'status-confirmed' },
      completed: { text: 'Tamamlandı', class: 'status-completed' },
      cancelled: { text: 'İptal Edildi', class: 'status-cancelled' }
    };

    const config = statusConfig[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reservation-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Rezervasyonlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-list">
        <div className="error-message">{error}</div>
        <button onClick={fetchReservations} className="retry-btn">
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="reservation-list">
        <div className="no-reservations">
          <div className="no-reservations-icon">📅</div>
          <h3>Henüz Rezervasyonunuz Yok</h3>
          <p>Harika turlarımızı keşfedin ve ilk rezervasyonunuzu oluşturun!</p>
          <button onClick={() => window.location.href = '/'} className="browse-tours-btn">
            Turları Keşfet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-list">
      <h2>📅 Rezervasyonlarım</h2>
      
      <div className="reservations-grid">
        {reservations.map(reservation => (
          <div key={reservation._id} className="reservation-card">
            <div className="reservation-image">
              <img src={reservation.tour.image} alt={reservation.tour.title} />
              {getStatusBadge(reservation.status)}
            </div>
            
            <div className="reservation-content">
              <h3>{reservation.tour.title}</h3>
              <p className="reservation-location">📍 {reservation.tour.location}</p>
              
              <div className="reservation-details">
                <div className="detail-item">
                  <span className="detail-label">📅 Tur Tarihi:</span>
                  <span className="detail-value">{formatDate(reservation.tourDate)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">👥 Katılımcı:</span>
                  <span className="detail-value">{reservation.participants} kişi</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">💰 Toplam Fiyat:</span>
                  <span className="detail-value">₺{reservation.totalPrice}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">📝 Rezervasyon Tarihi:</span>
                  <span className="detail-value">{formatDate(reservation.createdAt)}</span>
                </div>
              </div>

              {reservation.specialRequests && (
                <div className="special-requests">
                  <h4>📝 Özel İstekler:</h4>
                  <p>{reservation.specialRequests}</p>
                </div>
              )}

              <div className="reservation-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedReservation(reservation)}
                >
                  📋 Detayları Gör
                </button>
                
                {['pending', 'confirmed'].includes(reservation.status) && (
                  <button 
                    className="cancel-reservation-btn"
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowCancelModal(true);
                    }}
                  >
                    ❌ İptal Et
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rezervasyon Detay Modal */}
      {selectedReservation && (
        <div className="tour-modal-bg" onClick={() => setSelectedReservation(null)}>
          <div className="tour-modal" onClick={e => e.stopPropagation()}>
            <button className="tour-modal-close" onClick={() => setSelectedReservation(null)}>&times;</button>
            
            <div className="reservation-detail-modal">
              <img src={selectedReservation.tour.image} alt={selectedReservation.tour.title} />
              <h2>{selectedReservation.tour.title}</h2>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <h3>📋 Rezervasyon Bilgileri</h3>
                  <p><strong>Durum:</strong> {getStatusBadge(selectedReservation.status)}</p>
                  <p><strong>Tur Tarihi:</strong> {formatDate(selectedReservation.tourDate)}</p>
                  <p><strong>Katılımcı Sayısı:</strong> {selectedReservation.participants} kişi</p>
                  <p><strong>Toplam Fiyat:</strong> ₺{selectedReservation.totalPrice}</p>
                  <p><strong>Rezervasyon Tarihi:</strong> {formatDate(selectedReservation.createdAt)}</p>
                </div>

                <div className="detail-section">
                  <h3>📞 İletişim Bilgileri</h3>
                  <p><strong>Ad Soyad:</strong> {selectedReservation.contactInfo.name}</p>
                  <p><strong>Telefon:</strong> {selectedReservation.contactInfo.phone}</p>
                  <p><strong>Email:</strong> {selectedReservation.contactInfo.email}</p>
                </div>

                <div className="detail-section">
                  <h3>🗺️ Tur Bilgileri</h3>
                  <p><strong>Lokasyon:</strong> {selectedReservation.tour.location}</p>
                  <p><strong>Süre:</strong> {selectedReservation.tour.duration}</p>
                  <p><strong>Kategori:</strong> {selectedReservation.tour.category}</p>
                  <p><strong>Açıklama:</strong> {selectedReservation.tour.description}</p>
                </div>

                {selectedReservation.specialRequests && (
                  <div className="detail-section">
                    <h3>📝 Özel İstekler</h3>
                    <p>{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İptal Onay Modal */}
      {showCancelModal && selectedReservation && (
        <div className="tour-modal-bg" onClick={() => setShowCancelModal(false)}>
          <div className="tour-modal cancel-confirmation-modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Rezervasyon İptali</h3>
            <p>
              <strong>{selectedReservation.tour.title}</strong> rezervasyonunu iptal etmek istediğinizden emin misiniz?
            </p>
            <p>Bu işlem geri alınamaz.</p>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="cancel-btn"
              >
                Vazgeç
              </button>
              <button 
                onClick={handleCancelReservation}
                className="confirm-cancel-btn"
              >
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList; 