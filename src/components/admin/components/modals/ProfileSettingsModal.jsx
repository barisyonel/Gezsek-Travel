import React, { useState } from 'react';
import './ProfileSettingsModal.css';

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@gezsektravel.com',
    phone: '5551234567',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profil ayarları güncelleniyor:', formData);
    // Burada API çağrısı yapılacak
    onClose();
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    console.log('Şifre değiştiriliyor...');
    // Burada API çağrısı yapılacak
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Profil Ayarları</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profil Bilgileri
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔐 Şifre Değiştir
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            📧 Bildirimler
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Mevcut Şifre</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Yeni Şifre</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label>Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Şifre Değiştir
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                  />
                  Email Bildirimleri
                </label>
                <small>Rezervasyon onayları ve önemli güncellemeler için email al</small>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleInputChange}
                  />
                  SMS Bildirimleri
                </label>
                <small>Acil durumlar ve önemli hatırlatmalar için SMS al</small>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  İptal
                </button>
                <button type="button" onClick={handleSubmit} className="btn-primary">
                  Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal; 