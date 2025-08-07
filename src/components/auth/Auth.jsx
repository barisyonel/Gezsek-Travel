import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    birthDate: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Doğum tarihi değiştiğinde yaş kontrolü
    if (name === 'birthDate' && value) {
      const age = calculateAge(value);
      if (age < 18) {
        setError('18 yaşından büyük olmalısınız. Yaşınız: ' + age);
        return;
      } else {
        setError('');
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Form validasyonu
    if (!formData.email || !formData.password || !formData.name || !formData.phone || !formData.birthDate || !formData.gender) {
      setError('Tüm alanları doldurunuz');
      setLoading(false);
      return;
    }

    // Yaş kontrolü
    if (formData.birthDate) {
      const age = calculateAge(formData.birthDate);
      if (age < 18) {
        setError('18 yaşından büyük olmalısınız. Yaşınız: ' + age);
        setLoading(false);
        return;
      }
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir email adresi giriniz');
      setLoading(false);
      return;
    }

    // Telefon format kontrolü
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Geçerli bir telefon numarası giriniz (10-11 haneli)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          birthDate: formData.birthDate,
          gender: formData.gender
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Kayıt başarılı, token'ı kaydet ve ana sayfaya yönlendir
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setTimeout(() => {
            navigate('/');
            window.location.reload();
          }, 1500);
        }
        // Formu temizle
        setFormData({
          email: '',
          password: '',
          name: '',
          phone: '',
          birthDate: '',
          gender: ''
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify function removed - no longer needed

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resend code function removed - no longer needed

  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Ad Soyad"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Telefon (Zorunlu)"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10,11}"
                title="10-11 haneli telefon numarası giriniz"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                name="birthDate"
                placeholder="Doğum Tarihi"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
                className="form-input"
                max={new Date().toISOString().split('T')[0]}
                min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                title="18 yaşından büyük olmalısınız"
              />
            </div>
            <div className="form-group">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Cinsiyet Seçin</option>
                <option value="erkek">Erkek</option>
                <option value="kadın">Kadın</option>
                <option value="diğer">Diğer</option>
                <option value="belirtmek_istemiyorum">Belirtmek İstemiyorum</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="form-input"
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Kayıt Ol'}
            </button>
          </form>
        );

      // Verify case removed - no longer needed

      default: // login
        return (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Giriş Yap'}
            </button>
          </form>
        );
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-header">
          <h2>🔐 Hesap Yönetimi</h2>
          <p>
            {mode === 'login' && 'Tur rezervasyonlarınızı yönetmek için giriş yapın'}
            {mode === 'register' && 'Yeni hesap oluşturun ve turlarımızdan faydalanın'}
          </p>
        </div>
        
        <div className="auth-card">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Giriş Yap
            </button>
            <button 
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Kayıt Ol
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {renderForm()}

          {mode !== 'verify' && (
            <div className="auth-features">
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Güvenli Giriş</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-history"></i>
                <span>Rezervasyon Geçmişi</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-bell"></i>
                <span>Fırsat Bildirimleri</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Auth; 