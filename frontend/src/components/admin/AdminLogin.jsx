import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email ve şifre gerekli');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Admin kontrolü
        if (!data.user.isAdmin) {
          setError('Bu alana sadece admin kullanıcıları erişebilir');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Admin paneline yönlendir
        navigate('/admin-panel');
        window.location.reload();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>🔐 Admin Girişi</h1>
          <p>Gezsek Travel Admin Paneli</p>
        </div>

        <div className="admin-login-card">
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Email Adresi</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@gezsektravel.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="form-input"
              />
            </div>

            {error && (
              <div className="error-message">
                <i className="error-icon">⚠️</i>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <i className="login-icon">🔐</i>
                  <span>Admin Girişi</span>
                </>
              )}
            </button>
          </form>

          <div className="admin-login-info">
            <h3>Admin Bilgileri:</h3>
            <div className="admin-credentials">
              <div className="credential-item">
                <span className="credential-label">Email:</span>
                <span className="credential-value">admin@gezsektravel.com</span>
              </div>
              <div className="credential-item">
                <span className="credential-label">Şifre:</span>
                <span className="credential-value">admin123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-login-footer">
          <button 
            onClick={() => navigate('/')} 
            className="back-home-btn"
          >
            <i className="back-icon">🏠</i>
            <span>Ana Sayfaya Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 