import React from 'react';
import './UserModal.css';

const UserModal = ({ 
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
            <label>Ad Soyad *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Kullanıcı adı"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              required
              className="form-input"
              placeholder="kullanici@example.com"
            />
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="form-input"
              placeholder="5551234567"
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label>Şifre *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Güçlü şifre"
              />
            </div>
          )}

          {!isEdit && (
            <>
              <div className="form-group">
                <label>Doğum Tarihi</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={onChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Cinsiyet</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={onChange}
                  className="form-input"
                >
                  <option value="erkek">Erkek</option>
                  <option value="kadın">Kadın</option>
                  <option value="diğer">Diğer</option>
                </select>
              </div>
            </>
          )}

          {isEdit && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  onChange={onChange}
                />
                Hesap Doğrulandı
              </label>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={onChange}
              />
              Admin Yetkisi
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

export default UserModal; 