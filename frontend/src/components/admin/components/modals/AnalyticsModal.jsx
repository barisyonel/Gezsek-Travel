import React, { useState, useEffect } from 'react';
import './AnalyticsModal.css';

const AnalyticsModal = ({ isOpen, onClose, analytics, onSave, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'user_activity',
    status: 'draft',
    chartType: 'bar',
    schedule: {
      isScheduled: false,
      frequency: 'daily',
      recipients: []
    },
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (analytics) {
      setFormData({
        name: analytics.name || '',
        description: analytics.description || '',
        type: analytics.type || 'user_activity',
        status: analytics.status || 'draft',
        chartType: analytics.visualization?.chartType || 'bar',
        schedule: {
          isScheduled: analytics.schedule?.isScheduled || false,
          frequency: analytics.schedule?.frequency || 'daily',
          recipients: analytics.schedule?.recipients || []
        },
        tags: analytics.tags || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'user_activity',
        status: 'draft',
        chartType: 'bar',
        schedule: {
          isScheduled: false,
          frequency: 'daily',
          recipients: []
        },
        tags: []
      });
    }
    setErrors({});
  }, [analytics]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Analitik adı zorunludur';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama zorunludur';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving analytics:', error);
      setErrors({ submit: 'Analitik kaydedilirken hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const getTypeOptions = () => [
    { value: 'user_activity', label: 'Kullanıcı Aktivitesi', icon: '👥' },
    { value: 'tour_analytics', label: 'Tur Analitiği', icon: '🗺️' },
    { value: 'revenue_analytics', label: 'Gelir Analitiği', icon: '💰' },
    { value: 'performance_analytics', label: 'Performans Analitiği', icon: '⚡' },
    { value: 'security_analytics', label: 'Güvenlik Analitiği', icon: '🔒' },
    { value: 'custom_report', label: 'Özel Rapor', icon: '📊' }
  ];

  const getChartTypeOptions = () => [
    { value: 'line', label: 'Çizgi Grafik', icon: '📈' },
    { value: 'bar', label: 'Sütun Grafik', icon: '📊' },
    { value: 'pie', label: 'Pasta Grafik', icon: '🥧' },
    { value: 'doughnut', label: 'Halka Grafik', icon: '🍩' },
    { value: 'area', label: 'Alan Grafik', icon: '📊' },
    { value: 'scatter', label: 'Dağılım Grafik', icon: '🔍' },
    { value: 'table', label: 'Tablo', icon: '📋' },
    { value: 'heatmap', label: 'Isı Haritası', icon: '🔥' },
    { value: 'gauge', label: 'Gösterge', icon: '🎯' },
    { value: 'funnel', label: 'Huni', icon: '🫖' }
  ];

  if (!isOpen) return null;

  return (
    <div className="analytics-modal-overlay">
      <div className="analytics-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Analitik Adı *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Analitik adını girin"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Açıklama *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Analitik açıklamasını girin"
              rows="3"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Analitik Türü</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {getTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Durum</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="paused">Duraklatıldı</option>
                <option value="archived">Arşivlendi</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="chartType">Grafik Türü</label>
            <select
              id="chartType"
              name="chartType"
              value={formData.chartType}
              onChange={handleInputChange}
            >
              {getChartTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Etiketler</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagChange}
              placeholder="Etiketleri virgülle ayırarak girin"
            />
            <small>Örnek: analitik, rapor, dashboard</small>
          </div>

          <div className="schedule-section">
            <h3>📅 Zamanlama Ayarları</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isScheduled"
                  checked={formData.schedule.isScheduled}
                  onChange={handleScheduleChange}
                />
                Otomatik zamanlama aktif
              </label>
            </div>

            {formData.schedule.isScheduled && (
              <div className="form-group">
                <label htmlFor="frequency">Sıklık</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.schedule.frequency}
                  onChange={handleScheduleChange}
                >
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                  <option value="monthly">Aylık</option>
                  <option value="quarterly">Üç Aylık</option>
                  <option value="yearly">Yıllık</option>
                </select>
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="error-message global-error">{errors.submit}</div>
          )}

          <div className="modal-actions">
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
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnalyticsModal; 