import React, { useEffect, useState } from 'react';
import TourCard from './TourCard';
import SearchFilter from '../common/SearchFilter';
import LoadingSpinner from '../common/LoadingSpinner';

const API_URL = '/api/tours';

const TourList = () => {
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async (params = {}) => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}?${queryString}`);
      const data = await response.json();
      
      if (response.ok) {
        setFilteredTours(data.tours || data);
      } else {
        setError(data.message || 'Turlar alınamadı.');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    fetchTours(newFilters);
  };

  const handlePurchaseSuccess = (purchase) => {
    // Satın alma başarılı olduğunda yapılacak işlemler
    console.log('Rezervasyon başarılı:', purchase);
  };

  if (loading) return <LoadingSpinner text="Turlar yükleniyor..." />;
  if (error) return <div className="tour-list tour-list-error">{error}</div>;

  return (
    <div className="tour-list-container">
      <SearchFilter onFilterChange={handleFilterChange} />
      <div className="tour-list">
        {filteredTours.map(tour => (
          <TourCard 
            key={tour._id} 
            tour={tour} 
            onDetail={setDetail}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        ))}
        {filteredTours.length === 0 && !loading && (
          <div className="no-tours">
            <p>Aradığınız kriterlere uygun tur bulunamadı.</p>
          </div>
        )}
      </div>
      {detail && (
        <div className="tour-modal-bg" onClick={() => setDetail(null)}>
          <div className="tour-modal" onClick={e => e.stopPropagation()}>
            <button className="tour-modal-close" onClick={() => setDetail(null)}>&times;</button>
            
            <div className="tour-modal-content">
              <div className="tour-modal-images">
                <img src={detail.img} alt={detail.title} className="tour-modal-main-image" />
                {detail.images && detail.images.length > 1 && (
                  <div className="tour-modal-thumbnails">
                    {detail.images.slice(0, 4).map((img, index) => (
                      <img key={index} src={img} alt={`${detail.title} ${index + 1}`} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="tour-modal-info">
                <h2>{detail.title}</h2>
                
                {detail.rating && (
                  <div className="tour-modal-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < detail.rating ? '#FFD700' : '#ddd' }}>★</span>
                    ))}
                    <span>({detail.reviewCount || 0} değerlendirme)</span>
                  </div>
                )}
                
                <p className="tour-modal-desc">{detail.desc}</p>
                
                <div className="tour-modal-details">
                  {detail.location && <span>📍 {detail.location}</span>}
                  {detail.duration && <span>⏱️ {detail.duration}</span>}
                  {detail.difficulty && <span>🏃 {detail.difficulty}</span>}
                  {detail.category && <span>🏷️ {detail.category}</span>}
                </div>
                
                {detail.highlights && detail.highlights.length > 0 && (
                  <div className="tour-modal-highlights">
                    <h4>Öne Çıkanlar:</h4>
                    <ul>
                      {detail.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {detail.included && detail.included.length > 0 && (
                  <div className="tour-modal-included">
                    <h4>Dahil Olanlar:</h4>
                    <ul>
                      {detail.included.map((item, index) => (
                        <li key={index}>✅ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {detail.notIncluded && detail.notIncluded.length > 0 && (
                  <div className="tour-modal-not-included">
                    <h4>Dahil Olmayanlar:</h4>
                    <ul>
                      {detail.notIncluded.map((item, index) => (
                        <li key={index}>❌ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {detail.dates && detail.dates.length > 0 && (
                  <div className="tour-modal-dates">
                    <h4>Müsait Tarihler:</h4>
                    <div className="tour-dates-grid">
                      {detail.dates.map((date, index) => (
                        <span key={index} className="tour-date">{date}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="tour-modal-price">
                  <div className="price-info">
                    <span className="current-price">
                      {new window.Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: detail.currency || 'TRY'
                      }).format(detail.price)}
                    </span>
                    {detail.originalPrice && detail.originalPrice > detail.price && (
                      <span className="original-price">
                        {new window.Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: detail.currency || 'TRY'
                        }).format(detail.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {detail.maxParticipants && (
                    <div className="participants-info">
                      {detail.currentParticipants || 0}/{detail.maxParticipants} kişi
                    </div>
                  )}
                </div>
                
                <div className="tour-modal-actions">
                  <button className="tour-modal-book-btn">Rezervasyon Yap</button>
                  <button className="tour-modal-contact-btn">İletişime Geç</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourList; 