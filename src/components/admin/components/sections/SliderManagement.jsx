import React, { useState } from 'react';
import SliderModal from '../modals/SliderModal';
import FileUpload from '../common/FileUpload';
import './SliderManagement.css';

const SliderManagement = () => {
  const [slides, setSlides] = useState([
    {
      id: 1,
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      title: 'Ege\'nin Berrak Koylari',
      slogan: 'Hayalindeki deniz tatili burada baslar.',
      price: '₺2,999',
      duration: '3 Gün 2 Gece',
      category: 'Yaz Turlari',
      isActive: true,
      order: 1
    },
    {
      id: 2,
      img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
      title: 'Kapadokya Balonları',
      slogan: 'Gökyüzünde özgürlüğü keşfet!',
      price: '₺1,899',
      duration: '2 Gün 1 Gece',
      category: 'Kultur Turlari',
      isActive: true,
      order: 2
    },
    {
      id: 3,
      img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
      title: 'Antalya Sahilleri',
      slogan: 'Gunes, kum ve huzur dolu anlar.',
      price: '₺3,499',
      duration: '4 Gün 3 Gece',
      category: 'Yaz Turlari',
      isActive: true,
      order: 3
    },
    {
      id: 4,
      img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      title: 'Fethiye Oludeniz',
      slogan: 'Doganin en guzel tonlariyla bulus.',
      price: '₺2,799',
      duration: '3 Gün 2 Gece',
      category: 'Doga Turlari',
      isActive: true,
      order: 4
    },
    {
      id: 5,
      img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      title: 'Karadeniz Yaylalari',
      slogan: 'Yesilin binbir tonunda serin bir nefes.',
      price: '₺1,599',
      duration: '2 Gün 1 Gece',
      category: 'Doga Turlari',
      isActive: true,
      order: 5
    },
    {
      id: 6,
      img: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=1200&q=80',
      title: 'Kusadasi Gunbatimi',
      slogan: 'Her ani unutulmaz bir yolculuk.',
      price: '₺2,299',
      duration: '3 Gün 2 Gece',
      category: 'Yaz Turlari',
      isActive: true,
      order: 6
    }
  ]);

  const [showSliderModal, setShowSliderModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEditSlide = (slide) => {
    setEditingSlide(slide);
    setShowSliderModal(true);
  };

  const handleAddSlide = () => {
    setEditingSlide(null);
    setShowAddModal(true);
  };

  const handleSaveSlide = (slideData) => {
    if (editingSlide) {
      // Düzenleme
      setSlides(prev => prev.map(slide => 
        slide.id === editingSlide.id ? { ...slideData, id: slide.id } : slide
      ));
    } else {
      // Yeni ekleme
      const newSlide = {
        ...slideData,
        id: Date.now(),
        order: slides.length + 1
      };
      setSlides(prev => [...prev, newSlide]);
    }
    setShowSliderModal(false);
    setShowAddModal(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = (slideId) => {
    if (window.confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      setSlides(prev => prev.filter(slide => slide.id !== slideId));
    }
  };

  const handleToggleActive = (slideId) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, isActive: !slide.isActive } : slide
    ));
  };

  const handleReorder = (slideId, direction) => {
    setSlides(prev => {
      const currentIndex = prev.findIndex(slide => slide.id === slideId);
      if (currentIndex === -1) return prev;

      const newSlides = [...prev];
      if (direction === 'up' && currentIndex > 0) {
        [newSlides[currentIndex], newSlides[currentIndex - 1]] = 
        [newSlides[currentIndex - 1], newSlides[currentIndex]];
      } else if (direction === 'down' && currentIndex < newSlides.length - 1) {
        [newSlides[currentIndex], newSlides[currentIndex + 1]] = 
        [newSlides[currentIndex + 1], newSlides[currentIndex]];
      }

      return newSlides.map((slide, index) => ({ ...slide, order: index + 1 }));
    });
  };

  const activeSlides = slides.filter(slide => slide.isActive);

  return (
    <div className="slider-management-section">
      <div className="section-header">
        <h2>🎠 Slider Yönetimi</h2>
        <div className="header-actions">
          <button onClick={handleAddSlide} className="add-btn">
            ➕ Yeni Slider Ekle
          </button>
        </div>
      </div>

      {/* Önizleme */}
      <div className="slider-preview">
        <h3>📱 Slider Önizleme</h3>
        <div className="preview-container">
          <div className="preview-slider">
            {activeSlides.slice(0, 3).map((slide, index) => (
              <div key={slide.id} className="preview-slide">
                <img src={slide.img} alt={slide.title} />
                <div className="preview-overlay">
                  <div className="preview-badge category">{slide.category}</div>
                  <div className="preview-badge price">{slide.price}</div>
                  <div className="preview-content">
                    <h4>{slide.title}</h4>
                    <p>{slide.slogan}</p>
                    <div className="preview-details">
                      <span>⏱️ {slide.duration}</span>
                      <span>💰 Kişi Başı</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="preview-info">
            <p><strong>Aktif Slider Sayısı:</strong> {activeSlides.length}</p>
            <p><strong>Toplam Slider:</strong> {slides.length}</p>
          </div>
        </div>
      </div>

      {/* Slider Listesi */}
      <div className="slider-list">
        <h3>📋 Slider Listesi</h3>
        <div className="slider-grid">
          {slides.map((slide) => (
            <div key={slide.id} className="slider-card">
              <div className="slider-image">
                <img src={slide.img} alt={slide.title} />
                <div className="slider-overlay">
                  <div className="slider-badge order">#{slide.order}</div>
                                     <div className={`slider-badge status ${slide.isActive ? 'active' : 'inactive'}`}>
                     {slide.isActive ? 'Aktif' : 'Donduruldu'}
                   </div>
                </div>
              </div>
              
              <div className="slider-content">
                <h4>{slide.title}</h4>
                <p className="slider-slogan">{slide.slogan}</p>
                
                <div className="slider-details">
                  <div className="detail-item">
                    <span className="label">Kategori:</span>
                    <span className="value">{slide.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Fiyat:</span>
                    <span className="value price">{slide.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Süre:</span>
                    <span className="value">{slide.duration}</span>
                  </div>
                </div>

                <div className="slider-actions">
                  <button 
                    onClick={() => handleEditSlide(slide)}
                    className="edit-btn"
                    title="Düzenle"
                  >
                    ✏️ Düzenle
                  </button>
                  
                                     <button 
                     onClick={() => handleToggleActive(slide.id)}
                     className={`toggle-btn ${slide.isActive ? 'deactivate' : 'activate'}`}
                     title={slide.isActive ? 'Dondur' : 'Aktif Yap'}
                   >
                     {slide.isActive ? '⏸️ Dondur' : '▶️ Aktif Yap'}
                   </button>
                  
                  <button 
                    onClick={() => handleReorder(slide.id, 'up')}
                    className="reorder-btn"
                    disabled={slide.order === 1}
                    title="Yukarı Taşı"
                  >
                    ⬆️
                  </button>
                  
                  <button 
                    onClick={() => handleReorder(slide.id, 'down')}
                    className="reorder-btn"
                    disabled={slide.order === slides.length}
                    title="Aşağı Taşı"
                  >
                    ⬇️
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteSlide(slide.id)}
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
      </div>

      {/* Slider Modal */}
      {showSliderModal && (
        <SliderModal
          isOpen={showSliderModal}
          onClose={() => setShowSliderModal(false)}
          slide={editingSlide}
          onSave={handleSaveSlide}
          title="Slider Düzenle"
        />
      )}

      {/* Add Slider Modal */}
      {showAddModal && (
        <SliderModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          slide={null}
          onSave={handleSaveSlide}
          title="Yeni Slider Ekle"
        />
      )}
    </div>
  );
};

export default SliderManagement; 