import React from 'react';
import FileUpload from '../common/FileUpload';
import './TourModal.css';

const TourModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  title, 
  submitText, 
  isEdit = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Tur Başlığı *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Tur başlığı"
            />
          </div>

          <div className="form-group">
            <label>Açıklama *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              required
              className="form-textarea"
              placeholder="Tur açıklaması..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fiyat (₺) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onChange}
                required
                min="0"
                className="form-input"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Süre *</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Örn: 3 gün 2 gece"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Lokasyon *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Tur lokasyonu"
              />
            </div>

            <div className="form-group">
              <label>Kategori *</label>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
                required
                className="form-input"
              >
                <option value="">Kategori Seçin</option>
                <option value="Yaz Turları">Yaz Turları</option>
                <option value="Kültür Turları">Kültür Turları</option>
                <option value="Gemi Turları">Gemi Turları</option>
                <option value="Kıbrıs Turları">Kıbrıs Turları</option>
                <option value="Doğa Turları">Doğa Turları</option>
                <option value="Günübirlik Turlar">Günübirlik Turlar</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Öne Çıkan Özellikler</label>
            <textarea
              name="highlights"
              value={formData.highlights}
              onChange={onChange}
              className="form-textarea"
              placeholder="Tur özellikleri..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tarihler</label>
              <input
                type="text"
                name="dates"
                value={formData.dates}
                onChange={onChange}
                className="form-input"
                placeholder="Örn: Her hafta sonu"
              />
            </div>

            <div className="form-group">
              <label>Maksimum Katılımcı</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={onChange}
                min="1"
                className="form-input"
                placeholder="20"
              />
            </div>
          </div>

          <div className="form-group">
            <FileUpload
              onUpload={(url) => {
                const event = {
                  target: {
                    name: 'image',
                    value: url
                  }
                };
                onChange(event);
              }}
              onRemove={() => {
                const event = {
                  target: {
                    name: 'image',
                    value: ''
                  }
                };
                onChange(event);
              }}
              currentImage={formData.image}
              label="Tur Görseli"
              maxSize={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onChange}
              />
              Aktif Tur
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn-primary">
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourModal; 