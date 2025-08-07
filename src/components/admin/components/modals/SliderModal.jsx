import React, { useState, useEffect } from 'react';
import FileUpload from '../common/FileUpload';
import './SliderModal.css';

const SliderModal = ({ isOpen, onClose, slide, onSave, title }) => {
  const [formData, setFormData] = useState({
    img: '',
    title: '',
    slogan: '',
    price: '',
    duration: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    if (slide) {
      setFormData({
        img: slide.img || '',
        title: slide.title || '',
        slogan: slide.slogan || '',
        price: slide.price || '',
        duration: slide.duration || '',
        category: slide.category || '',
        isActive: slide.isActive !== undefined ? slide.isActive : true
      });
    } else {
      setFormData({
        img: '',
        title: '',
        slogan: '',
        price: '',
        duration: '',
        category: '',
        isActive: true
      });
    }
  }, [slide]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.img || !formData.title || !formData.slogan || !formData.price || !formData.duration || !formData.category) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    onSave(formData);
  };

  const categories = [
    'Yaz Turlari',
    'Kultur Turlari',
    'Gemi Turlari',
    'Kibris Turlari',
    'Gunubirlik Turlar',
    'Doga Turlari'
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content slider-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Görsel Yükleme */}
          <div className="form-group">
            <FileUpload
              onUpload={(url) => {
                const event = {
                  target: {
                    name: 'img',
                    value: url
                  }
                };
                handleInputChange(event);
              }}
              onRemove={() => {
                const event = {
                  target: {
                    name: 'img',
                    value: ''
                  }
                };
                handleInputChange(event);
              }}
              currentImage={formData.img}
              label="Slider Görseli"
              maxSize={5}
            />
          </div>

          {/* Başlık */}
          <div className="form-group">
            <label>Başlık *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Slider başlığı"
            />
          </div>

          {/* Slogan */}
          <div className="form-group">
            <label>Slogan *</label>
            <textarea
              name="slogan"
              value={formData.slogan}
              onChange={handleInputChange}
              required
              className="form-textarea"
              placeholder="Slider sloganı..."
              rows="2"
            />
          </div>

          {/* Fiyat ve Süre */}
          <div className="form-row">
            <div className="form-group">
              <label>Fiyat *</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="₺2,999"
              />
            </div>

            <div className="form-group">
              <label>Süre *</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="3 Gün 2 Gece"
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label>Kategori *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Kategori Seçin</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Aktif/Pasif */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Slider Aktif
            </label>
          </div>

          {/* Önizleme */}
          {formData.img && (
            <div className="slide-preview">
              <h4>📱 Slider Önizleme</h4>
              <div className="preview-slide">
                <img src={formData.img} alt="Önizleme" />
                <div className="preview-overlay">
                  <div className="preview-badge category">{formData.category || 'Kategori'}</div>
                  <div className="preview-badge price">{formData.price || '₺0'}</div>
                  <div className="preview-content">
                    <h4>{formData.title || 'Başlık'}</h4>
                    <p>{formData.slogan || 'Slogan'}</p>
                    <div className="preview-details">
                      <span>⏱️ {formData.duration || 'Süre'}</span>
                      <span>💰 Kişi Başı</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn-primary">
              {slide ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SliderModal; 