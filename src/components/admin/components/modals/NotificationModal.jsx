import React, { useState, useEffect } from 'react';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, notification, onSave, users, title }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    title: '',
    message: '',
    type: 'info',
    category: 'general',
    priority: 'normal',
    actionUrl: '',
    actionText: '',
    deliveryChannels: ['in-app'],
    scheduledAt: '',
    expiresAt: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (notification) {
      setFormData({
        recipient: notification.recipient?._id || '',
        title: notification.title || '',
        message: notification.message || '',
        type: notification.type || 'info',
        category: notification.category || 'general',
        priority: notification.priority || 'normal',
        actionUrl: notification.actionUrl || '',
        actionText: notification.actionText || '',
        deliveryChannels: notification.deliveryChannels || ['in-app'],
        scheduledAt: notification.scheduledAt ? new Date(notification.scheduledAt).toISOString().slice(0, 16) : '',
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
        tags: notification.tags || []
      });
    } else {
      setFormData({
        recipient: '',
        title: '',
        message: '',
        type: 'info',
        category: 'general',
        priority: 'normal',
        actionUrl: '',
        actionText: '',
        deliveryChannels: ['in-app'],
        scheduledAt: '',
        expiresAt: '',
        tags: []
      });
    }
  }, [notification]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'deliveryChannels') {
      const channel = value;
      setFormData(prev => ({
        ...prev,
        deliveryChannels: checked
          ? [...prev.deliveryChannels, channel]
          : prev.deliveryChannels.filter(c => c !== channel)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
    if (!formData.recipient || !formData.title || !formData.message) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    if (formData.deliveryChannels.length === 0) {
      alert('En az bir iletişim kanalı seçin!');
      return;
    }

    // Convert dates
    const notificationData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
    };

    onSave(notificationData);
  };

  const types = [
    { value: 'info', label: 'Bilgi', icon: 'ℹ️' },
    { value: 'success', label: 'Başarı', icon: '✅' },
    { value: 'warning', label: 'Uyarı', icon: '⚠️' },
    { value: 'error', label: 'Hata', icon: '❌' },
    { value: 'reservation', label: 'Rezervasyon', icon: '📅' },
    { value: 'message', label: 'Mesaj', icon: '💬' },
    { value: 'system', label: 'Sistem', icon: '⚙️' },
    { value: 'promotion', label: 'Promosyon', icon: '🎉' }
  ];

  const categories = [
    { value: 'general', label: 'Genel' },
    { value: 'reservation', label: 'Rezervasyon' },
    { value: 'payment', label: 'Ödeme' },
    { value: 'tour', label: 'Tur' },
    { value: 'message', label: 'Mesaj' },
    { value: 'system', label: 'Sistem' },
    { value: 'marketing', label: 'Pazarlama' }
  ];

  const priorities = [
    { value: 'low', label: 'Düşük' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' }
  ];

  const channels = [
    { value: 'in-app', label: 'Uygulama İçi', icon: '📱' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'sms', label: 'SMS', icon: '📱' },
    { value: 'push', label: 'Push', icon: '🔔' }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notification-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Recipient Selection */}
          <div className="form-group">
            <label>Alıcı *</label>
            <select
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Alıcı seçin...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Title and Type */}
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
                placeholder="Bildirim başlığı"
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label>Tür</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="form-group">
            <label>Mesaj *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              className="form-textarea"
              placeholder="Bildirim mesajı..."
              rows="4"
              maxLength={1000}
            />
          </div>

          {/* Category and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label>Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Öncelik</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action URL and Text */}
          <div className="form-row">
            <div className="form-group">
              <label>Eylem URL</label>
              <input
                type="url"
                name="actionUrl"
                value={formData.actionUrl}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label>Eylem Metni</label>
              <input
                type="text"
                name="actionText"
                value={formData.actionText}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Eylem butonu metni"
                maxLength={100}
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="form-group">
            <label>İletim Kanalları *</label>
            <div className="channels-grid">
              {channels.map(channel => (
                <label key={channel.value} className="channel-option">
                  <input
                    type="checkbox"
                    name="deliveryChannels"
                    value={channel.value}
                    checked={formData.deliveryChannels.includes(channel.value)}
                    onChange={handleInputChange}
                  />
                  <span className="channel-icon">{channel.icon}</span>
                  <span className="channel-label">{channel.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="form-row">
            <div className="form-group">
              <label>Planlanan Tarih</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                className="form-input"
              />
              <small>Boş bırakılırsa hemen gönderilir</small>
            </div>
            <div className="form-group">
              <label>Son Kullanma Tarihi</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="form-input"
              />
              <small>Bildirimin geçerlilik süresi</small>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Etiketler</label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="form-input"
                placeholder="Etiket ekle..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag} className="add-tag-btn">
                Ekle
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="remove-tag">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {formData.title && formData.message && (
            <div className="notification-preview">
              <h4>👀 Bildirim Önizleme</h4>
              <div className="preview-content">
                <div className="preview-header">
                  <span className="preview-type">
                    {types.find(t => t.value === formData.type)?.icon} {formData.type}
                  </span>
                  <span className="preview-priority">
                    {priorities.find(p => p.value === formData.priority)?.label}
                  </span>
                </div>
                <div className="preview-title">{formData.title}</div>
                <div className="preview-message">{formData.message}</div>
                {formData.actionText && (
                  <div className="preview-action">
                    <button className="preview-action-btn">{formData.actionText}</button>
                  </div>
                )}
                <div className="preview-channels">
                  <small>Kanal: {formData.deliveryChannels.join(', ')}</small>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn-primary">
              {notification ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal; 