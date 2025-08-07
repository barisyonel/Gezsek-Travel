import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onSuccess, tour }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register } = useAuth();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await login(loginData);
      setMessage('Giriş başarılı!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Giriş yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      await register(registerData);
      setMessage('Kayıt başarılı! Otomatik giriş yapılıyor...');
      
      // Kayıt başarılı olduktan sonra otomatik giriş yap
      setTimeout(async () => {
        try {
          await login({
            email: registerData.email,
            password: registerData.password
          });
          setMessage('Giriş başarılı!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        } catch (loginErr) {
          setError('Otomatik giriş başarısız. Lütfen manuel olarak giriş yapın.');
          setIsLogin(true);
        }
      }, 1500);
      
      setRegisterData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Kayıt olurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        
        <div className="auth-modal-header">
          <h2>🔐 {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
          {tour && (
            <div className="tour-info">
              <p>Bu turu rezervasyon yapmak için {isLogin ? 'giriş yapmalısınız' : 'kayıt olmalısınız'}</p>
              <div className="tour-preview">
                <img src={tour.image} alt={tour.title} />
                <div>
                  <h4>{tour.title}</h4>
                  <p>₺{tour.price}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Giriş Yap
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Kayıt Ol
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                className="form-input"
                placeholder="Email adresiniz"
              />
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                className="form-input"
                placeholder="Şifreniz"
              />
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Ad Soyad</label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                className="form-input"
                placeholder="Ad Soyad"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                className="form-input"
                placeholder="Email adresiniz"
              />
            </div>

            <div className="form-group">
              <label>Telefon</label>
              <input
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                required
                className="form-input"
                placeholder="Telefon numaranız"
              />
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                minLength="6"
                className="form-input"
                placeholder="Şifreniz (en az 6 karakter)"
              />
            </div>

            <div className="form-group">
              <label>Şifre Tekrar</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                minLength="6"
                className="form-input"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button 
              type="button"
              className="auth-switch-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Kayıt olun' : 'Giriş yapın'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 