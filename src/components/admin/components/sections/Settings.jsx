import React from 'react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Sistem Ayarları</h2>
      </div>

      <div className="settings-grid">
        <div className="setting-card">
          <h3>Genel Ayarlar</h3>
          <div className="setting-item">
            <label>Site Adı</label>
            <input type="text" defaultValue="Gezsek Travel" />
          </div>
          <div className="setting-item">
            <label>Site Açıklaması</label>
            <textarea defaultValue="Profesyonel seyahat hizmetleri" />
          </div>
          <div className="setting-item">
            <label>İletişim Email</label>
            <input type="email" defaultValue="info@gezsektravel.com" />
          </div>
        </div>

        <div className="setting-card">
          <h3>Email Ayarları</h3>
          <div className="setting-item">
            <label>SMTP Sunucu</label>
            <input type="text" defaultValue="smtp.gmail.com" />
          </div>
          <div className="setting-item">
            <label>SMTP Port</label>
            <input type="number" defaultValue="587" />
          </div>
          <div className="setting-item">
            <label>Email Kullanıcı Adı</label>
            <input type="email" defaultValue="admin@gezsektravel.com" />
          </div>
        </div>

        <div className="setting-card">
          <h3>Güvenlik Ayarları</h3>
          <div className="setting-item">
            <label>Minimum Şifre Uzunluğu</label>
            <input type="number" defaultValue="8" min="6" max="20" />
          </div>
          <div className="setting-item">
            <label>Oturum Süresi (Saat)</label>
            <input type="number" defaultValue="24" min="1" max="168" />
          </div>
          <div className="setting-item checkbox-group">
            <label>
              <input type="checkbox" defaultChecked />
              İki Faktörlü Doğrulama
            </label>
          </div>
        </div>

        <div className="setting-card">
          <h3>Bildirim Ayarları</h3>
          <div className="setting-item checkbox-group">
            <label>
              <input type="checkbox" defaultChecked />
              Email Bildirimleri
            </label>
          </div>
          <div className="setting-item checkbox-group">
            <label>
              <input type="checkbox" defaultChecked />
              Yeni Rezervasyon Bildirimleri
            </label>
          </div>
          <div className="setting-item checkbox-group">
            <label>
              <input type="checkbox" />
              Pazarlama Email'leri
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary">Ayarları Kaydet</button>
        <button className="btn-secondary">Varsayılana Döndür</button>
      </div>
    </div>
  );
};

export default Settings; 