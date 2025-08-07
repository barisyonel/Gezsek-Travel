import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tourAPI } from '../../services/api';
import ReservationModal from '../user/ReservationModal';
import AuthModal from '../auth/AuthModal';

const TourCard = ({ tour, onDetail, onPurchaseSuccess }) => {
  const { isAuthenticated } = useAuth();
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const formatPrice = (price) => {
    return new window.Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: tour.currency || 'TRY'
    }).format(price);
  };

  const handleReservationSuccess = (reservation) => {
    setMessage('Rezervasyon başarıyla oluşturuldu!');
    if (onPurchaseSuccess) {
      onPurchaseSuccess(reservation);
    }
    // Modal otomatik kapanacak
  };

  const handleBuy = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setError('');
      setMessage('');
      return;
    }

    setShowReservationModal(true);
    setError('');
    setMessage('');
  };

  const handleAuthSuccess = () => {
    setShowReservationModal(true);
  };

  const renderRating = () => {
    if (!tour.rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= tour.rating ? '#FFD700' : '#ddd' }}>
          ★
        </span>
      );
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
        {stars}
        <span style={{ fontSize: '12px', color: '#666' }}>
          ({tour.reviewCount || 0} değerlendirme)
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="tour-card" style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }} onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <img 
            src={tour.image || tour.img} 
            alt={tour.title} 
            style={{
              width: '100%', 
              height: '200px', 
              objectFit: 'cover', 
              borderRadius: '8px'
            }} 
          />
          {tour.originalPrice && tour.originalPrice > tour.price && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: '#ff4757',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              %{Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)} İndirim
            </div>
          )}
          {tour.difficulty && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {tour.difficulty}
            </div>
          )}
        </div>
        
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#333'
        }}>
          {tour.title}
        </h3>
        
        {renderRating()}
        
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: '14px', 
          color: '#666',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {tour.description || tour.desc}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          {tour.duration && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              ⏱️ {tour.duration}
            </span>
          )}
          {tour.location && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              📍 {tour.location}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#2ed573'
            }}>
              {formatPrice(tour.price)}
            </span>
            {tour.originalPrice && tour.originalPrice > tour.price && (
              <span style={{ 
                fontSize: '14px', 
                color: '#999', 
                textDecoration: 'line-through',
                marginLeft: '8px'
              }}>
                {formatPrice(tour.originalPrice)}
              </span>
            )}
          </div>
          {tour.maxParticipants && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              {tour.currentParticipants || 0}/{tour.maxParticipants} kişi
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onDetail(tour)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📋 Detay
          </button>
          <button 
            onClick={handleBuy}
            disabled={!tour.isActive}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: !tour.isActive ? '#ccc' : '#2ed573',
              color: 'white',
              cursor: !tour.isActive ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {!tour.isActive ? '❌ Müsait Değil' : '📅 Rezervasyon Yap'}
          </button>
        </div>
        
        {error && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: '#ffe6e6', 
            color: '#d63031', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: '#e6ffe6', 
            color: '#00b894', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Rezervasyon Modal */}
      <ReservationModal
        tour={tour}
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onSuccess={handleReservationSuccess}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        tour={tour}
      />
    </>
  );
};

export default TourCard; 