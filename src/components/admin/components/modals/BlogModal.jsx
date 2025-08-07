import React from 'react';
import FileUpload from '../common/FileUpload';
import './BlogModal.css';

const BlogModal = ({ 
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
            <label>Başlık *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Blog başlığı"
            />
          </div>

          <div className="form-group">
            <label>İçerik *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={onChange}
              required
              className="form-textarea"
              placeholder="Blog içeriği..."
              rows="8"
            />
          </div>

          <div className="form-group">
            <label>Özet</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={onChange}
              className="form-textarea"
              placeholder="Blog özeti..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Yazar</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={onChange}
              className="form-input"
              placeholder="Yazar adı"
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              className="form-input"
            >
              <option value="">Kategori Seçin</option>
              <option value="Seyahat">Seyahat</option>
              <option value="Kültür">Kültür</option>
              <option value="Yemek">Yemek</option>
              <option value="Doğa">Doğa</option>
              <option value="Tarih">Tarih</option>
              <option value="Teknoloji">Teknoloji</option>
            </select>
          </div>

          <div className="form-group">
            <label>Etiketler</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={onChange}
              className="form-input"
              placeholder="Etiketler (virgülle ayırın)"
            />
          </div>

          <div className="form-group">
            <FileUpload
              onUpload={(url) => {
                const event = {
                  target: {
                    name: 'img',
                    value: url
                  }
                };
                onChange(event);
              }}
              onRemove={() => {
                const event = {
                  target: {
                    name: 'img',
                    value: ''
                  }
                };
                onChange(event);
              }}
              currentImage={formData.img}
              label="Blog Görseli"
              maxSize={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={onChange}
              />
              Yayınla
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={onChange}
              />
              Öne Çıkan Blog
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

export default BlogModal; 