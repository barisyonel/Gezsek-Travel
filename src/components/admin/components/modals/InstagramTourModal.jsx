import React, { useState, useEffect } from 'react';
import FileUpload from '../common/FileUpload';
import './InstagramTourModal.css';

const InstagramTourModal = ({ isOpen, onClose, tour, onSave, title }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    image: '',
    instagramUrl: '',
    hashtags: [],
    suggestedHashtags: [],
    category: 'Instagram Ozel',
    location: '',
    price: '',
    duration: '',
    isActive: true,
    isFeatured: false,
    order: 0,
    scheduledDate: '',
    tags: [],
    metadata: {
      caption: '',
      altText: '',
      colorScheme: '',
      mood: ''
    }
  });

  const [hashtagInput, setHashtagInput] = useState('');
  const [suggestedHashtagInput, setSuggestedHashtagInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title || '',
        description: tour.description || '',
        shortDescription: tour.shortDescription || '',
        image: tour.image || '',
        instagramUrl: tour.instagramUrl || '',
        hashtags: tour.hashtags || [],
        suggestedHashtags: tour.suggestedHashtags || [],
        category: tour.category || 'Instagram Ozel',
        location: tour.location || '',
        price: tour.price || '',
        duration: tour.duration || '',
        isActive: tour.isActive !== undefined ? tour.isActive : true,
        isFeatured: tour.isFeatured || false,
        order: tour.order || 0,
        scheduledDate: tour.scheduledDate ? new Date(tour.scheduledDate).toISOString().split('T')[0] : '',
        tags: tour.tags || [],
        metadata: tour.metadata || {
          caption: '',
          altText: '',
          colorScheme: '',
          mood: ''
        }
      });
    } else {
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        image: '',
        instagramUrl: '',
        hashtags: [],
        suggestedHashtags: [],
        category: 'Instagram Ozel',
        location: '',
        price: '',
        duration: '',
        isActive: true,
        isFeatured: false,
        order: 0,
        scheduledDate: '',
        tags: [],
        metadata: {
          caption: '',
          altText: '',
          colorScheme: '',
          mood: ''
        }
      });
    }
  }, [tour]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('metadata.')) {
      const metadataField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !formData.hashtags.includes(hashtagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtagInput.trim()]
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (index) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index)
    }));
  };

  const addSuggestedHashtag = () => {
    if (suggestedHashtagInput.trim() && !formData.suggestedHashtags.includes(suggestedHashtagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        suggestedHashtags: [...prev.suggestedHashtags, suggestedHashtagInput.trim()]
      }));
      setSuggestedHashtagInput('');
    }
  };

  const removeSuggestedHashtag = (index) => {
    setFormData(prev => ({
      ...prev,
      suggestedHashtags: prev.suggestedHashtags.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.image || !formData.instagramUrl) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    // Convert scheduledDate to Date object if provided
    const tourData = {
      ...formData,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null
    };

    onSave(tourData);
  };

  const categories = [
    'Yaz Turlari',
    'Kultur Turlari',
    'Gemi Turlari',
    'Kibris Turlari',
    'Gunubirlik Turlar',
    'Doga Turlari',
    'Instagram Ozel'
  ];

  const popularHashtags = [
    'gezsek', 'travel', 'turkey', 'turkiye', 'seyahat', 'tatil', 'tur',
    'istanbul', 'antalya', 'kapadokya', 'fethiye', 'kusadasi', 'karadeniz',
    'yaz', 'kultur', 'doga', 'deniz', 'dag', 'tarih', 'muzeler', 'yemek'
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content instagram-tour-modal" onClick={e => e.stopPropagation()}>
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
                    name: 'image',
                    value: url
                  }
                };
                handleInputChange(event);
              }}
              onRemove={() => {
                const event = {
                  target: {
                    name: 'image',
                    value: ''
                  }
                };
                handleInputChange(event);
              }}
              currentImage={formData.image}
              label="Instagram Görseli"
              maxSize={5}
            />
          </div>

          {/* Başlık ve Kategori */}
          <div className="form-row">
            <div className="form-group">
              <label>Başlık *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Instagram tour başlığı"
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Açıklama */}
          <div className="form-group">
            <label>Açıklama *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-textarea"
              placeholder="Instagram tour açıklaması..."
              rows="3"
              maxLength={500}
            />
          </div>

          {/* Kısa Açıklama */}
          <div className="form-group">
            <label>Kısa Açıklama</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Kısa açıklama (Instagram caption için)"
              rows="2"
              maxLength={200}
            />
          </div>

          {/* Instagram URL */}
          <div className="form-group">
            <label>Instagram URL *</label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="https://www.instagram.com/p/..."
            />
          </div>

          {/* Lokasyon ve Fiyat */}
          <div className="form-row">
            <div className="form-group">
              <label>Lokasyon</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Tur lokasyonu"
              />
            </div>
            <div className="form-group">
              <label>Fiyat</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                placeholder="₺2,999"
              />
            </div>
          </div>

          {/* Süre ve Planlanan Tarih */}
          <div className="form-row">
            <div className="form-group">
              <label>Süre</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="form-input"
                placeholder="3 Gün 2 Gece"
              />
            </div>
            <div className="form-group">
              <label>Planlanan Paylaşım Tarihi</label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div className="form-group">
            <label>Hashtag'ler</label>
            <div className="hashtag-input-group">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                className="form-input"
                placeholder="Hashtag ekle..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
              />
              <button type="button" onClick={addHashtag} className="add-hashtag-btn">
                Ekle
              </button>
            </div>
            {formData.hashtags.length > 0 && (
              <div className="hashtags-list">
                {formData.hashtags.map((tag, index) => (
                  <span key={index} className="hashtag-tag">
                    #{tag}
                    <button type="button" onClick={() => removeHashtag(index)} className="remove-hashtag">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="popular-hashtags">
              <small>Popüler hashtag'ler:</small>
              <div className="popular-tags">
                {popularHashtags.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!formData.hashtags.includes(tag)) {
                        setFormData(prev => ({
                          ...prev,
                          hashtags: [...prev.hashtags, tag]
                        }));
                      }
                    }}
                    className="popular-tag"
                    disabled={formData.hashtags.includes(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Önerilen Hashtag'ler */}
          <div className="form-group">
            <label>Önerilen Hashtag'ler</label>
            <div className="hashtag-input-group">
              <input
                type="text"
                value={suggestedHashtagInput}
                onChange={(e) => setSuggestedHashtagInput(e.target.value)}
                className="form-input"
                placeholder="Önerilen hashtag ekle..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSuggestedHashtag())}
              />
              <button type="button" onClick={addSuggestedHashtag} className="add-hashtag-btn">
                Ekle
              </button>
            </div>
            {formData.suggestedHashtags.length > 0 && (
              <div className="hashtags-list">
                {formData.suggestedHashtags.map((tag, index) => (
                  <span key={index} className="hashtag-tag suggested">
                    #{tag}
                    <button type="button" onClick={() => removeSuggestedHashtag(index)} className="remove-hashtag">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Etiketler */}
          <div className="form-group">
            <label>Etiketler</label>
            <div className="hashtag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="form-input"
                placeholder="Etiket ekle..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag} className="add-hashtag-btn">
                Ekle
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="hashtags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="hashtag-tag tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="remove-hashtag">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="metadata-section">
            <h4>📝 Instagram Metadata</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Caption</label>
                <textarea
                  name="metadata.caption"
                  value={formData.metadata.caption}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Instagram caption metni..."
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Alt Text</label>
                <textarea
                  name="metadata.altText"
                  value={formData.metadata.altText}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Görsel alt metni..."
                  rows="2"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Renk Şeması</label>
                <input
                  type="text"
                  name="metadata.colorScheme"
                  value={formData.metadata.colorScheme}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Örn: Mavi, Turuncu"
                />
              </div>
              <div className="form-group">
                <label>Mood</label>
                <input
                  type="text"
                  name="metadata.mood"
                  value={formData.metadata.mood}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Örn: Huzurlu, Enerjik"
                />
              </div>
            </div>
          </div>

          {/* Durum Ayarları */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Aktif Tour
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
              />
              Öne Çıkan Tour
            </label>
          </div>

          {/* Önizleme */}
          {formData.image && (
            <div className="instagram-preview">
              <h4>📱 Instagram Önizleme</h4>
              <div className="preview-container">
                <div className="preview-image">
                  <img src={formData.image} alt="Önizleme" />
                </div>
                <div className="preview-content">
                  <h5>{formData.title || 'Başlık'}</h5>
                  <p>{formData.shortDescription || formData.description || 'Açıklama'}</p>
                  {formData.hashtags.length > 0 && (
                    <div className="preview-hashtags">
                      {formData.hashtags.slice(0, 5).map((tag, index) => (
                        <span key={index} className="preview-hashtag">#{tag}</span>
                      ))}
                      {formData.hashtags.length > 5 && (
                        <span className="preview-hashtag-more">+{formData.hashtags.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn-primary">
              {tour ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstagramTourModal; 