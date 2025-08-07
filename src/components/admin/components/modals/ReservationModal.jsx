import React from 'react';
import './ReservationModal.css';

const ReservationModal = ({ 
  isOpen, 
  onClose, 
  reservation, 
  onStatusUpdate 
}) => {
  if (!isOpen || !reservation) return null;

  const handleStatusUpdate = (newStatus) => {
    onStatusUpdate(reservation._id, newStatus);
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rezervasyon Detayları</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <div className="modal-body">
          <div className="reservation-info">
            <div className="info-section">
              <h4>📋 Rezervasyon Bilgileri</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Rezervasyon No:</label>
                  <span>#{reservation._id.slice(-8)}</span>
                </div>
                <div className="info-item">
                  <label>Tarih:</label>
                  <span>{new Date(reservation.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="info-item">
                  <label>Durum:</label>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(reservation.status) }}
                  >
                    {getStatusText(reservation.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>👤 Müşteri Bilgileri</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Ad Soyad:</label>
                  <span>{reservation.userName}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{reservation.userEmail}</span>
                </div>
                <div className="info-item">
                  <label>Telefon:</label>
                  <span>{reservation.userPhone || 'Belirtilmemiş'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>🗺️ Tur Bilgileri</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tur Adı:</label>
                  <span>{reservation.tourTitle}</span>
                </div>
                <div className="info-item">
                  <label>Tur Tarihi:</label>
                  <span>{new Date(reservation.tourDate).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="info-item">
                  <label>Kişi Sayısı:</label>
                  <span>{reservation.participantCount} kişi</span>
                </div>
                <div className="info-item">
                  <label>Kişi Başı Fiyat:</label>
                  <span>₺{reservation.pricePerPerson}</span>
                </div>
                <div className="info-item">
                  <label>Toplam Tutar:</label>
                  <span className="total-price">₺{reservation.totalPrice}</span>
                </div>
              </div>
            </div>

            {reservation.notes && (
              <div className="info-section">
                <h4>📝 Notlar</h4>
                <div className="notes">
                  {reservation.notes}
                </div>
              </div>
            )}
          </div>

          <div className="status-actions">
            <h4>Durum Güncelle</h4>
            <div className="action-buttons">
              {reservation.status !== 'confirmed' && (
                <button 
                  className="btn-confirm"
                  onClick={() => handleStatusUpdate('confirmed')}
                >
                  ✅ Onayla
                </button>
              )}
              {reservation.status !== 'cancelled' && (
                <button 
                  className="btn-cancel"
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  ❌ İptal Et
                </button>
              )}
              {reservation.status !== 'pending' && (
                <button 
                  className="btn-pending"
                  onClick={() => handleStatusUpdate('pending')}
                >
                  ⏳ Beklemede
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 