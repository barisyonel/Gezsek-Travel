import React, { useState } from 'react';
import notificationService from '../../services/notificationService';
import '../../App.css';

const ReservationModal = ({ tour, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    participants: 1,
    tourDate: '',
    specialRequests: '',
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tours/${tour._id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        
        // Bildirim gönder
        notificationService.notifyReservationCreated(
          tour.title,
          formData.tourDate,
          formData.participants,
          calculateTotalPrice()
        );
        
        setTimeout(() => {
          onSuccess(data.reservation);
          onClose();
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Reservation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return tour.price * formData.participants;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="tour-modal-bg" onClick={onClose}>
      <div className="tour-modal reservation-modal" onClick={e => e.stopPropagation()}>
        <button className="tour-modal-close" onClick={onClose}>&times;</button>
        
        <div className="reservation-header">
          <h2>📅 Rezervasyon Oluştur</h2>
          <div className="tour-summary">
            <img src={tour.image} alt={tour.title} />
            <div>
              <h3>{tour.title}</h3>
              <p>📍 {tour.location}</p>
              <p>⏱️ {tour.duration}</p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-group">
            <label>👥 Katılımcı Sayısı</label>
            <input
              type="number"
              name="participants"
              min="1"
              max={tour.maxParticipants}
              value={formData.participants}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            <small>Maksimum: {tour.maxParticipants} kişi</small>
          </div>

          <div className="form-group">
            <label>📅 Tur Tarihi</label>
            <input
              type="date"
              name="tourDate"
              min={getMinDate()}
              value={formData.tourDate}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>📝 Özel İstekler (Opsiyonel)</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
              className="form-input"
              rows="3"
            />
          </div>

          <div className="contact-info-section">
            <h4>📞 İletişim Bilgileri</h4>
            <div className="form-group">
              <label>👤 Ad Soyad</label>
              <input
                type="text"
                name="contactInfo.name"
                value={formData.contactInfo.name}
                onChange={handleInputChange}
                placeholder="Ad Soyad"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>📱 Telefon</label>
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleInputChange}
                placeholder="Telefon numarası"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>✉️ Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                placeholder="Email adresi"
                className="form-input"
              />
            </div>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Kişi Başı Fiyat:</span>
              <span>₺{tour.price}</span>
            </div>
            <div className="price-row">
              <span>Katılımcı Sayısı:</span>
              <span>{formData.participants}</span>
            </div>
            <div className="price-row total">
              <span>Toplam Fiyat:</span>
              <span>₺{calculateTotalPrice()}</span>
            </div>
          </div>

          <div className="reservation-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              disabled={loading}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="reserve-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  İşleniyor...
                </>
              ) : (
                'Rezervasyon Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal; 