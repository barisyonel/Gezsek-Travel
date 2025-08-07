import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseList from './PurchaseList';
import ReservationList from './ReservationList';

const API_URL = '/api/tours/my/purchases';

const UserPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'reservations', 'purchases'
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmalısınız.');
        setLoading(false);
        return;
      }

      try {
        // Kullanıcı bilgilerini API'den al
        const userResponse = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Satın alınan turları çek
        const purchasesResponse = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (purchasesResponse.ok) {
          const purchasesData = await purchasesResponse.json();
          setPurchases(purchasesData);
        }
      } catch (err) {
        setError('Veriler alınamadı.');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Yeni şifreler eşleşmiyor.');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('Yeni şifre en az 6 karakter olmalıdır.');
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Şifre başarıyla değiştirildi!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      } else {
        setPasswordMessage(data.message || 'Şifre değiştirme başarısız.');
      }
    } catch (err) {
      setPasswordMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Password change error:', err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

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

  if (loading) return <div className="user-panel">Yükleniyor...</div>;
  if (error) return <div className="user-panel user-panel-error">{error}</div>;

  return (
    <div className="user-panel">
      <h2>👤 Hesabım</h2>
      
      {/* Tab Navigation */}
      <div className="user-tabs">
        <button 
          className={`user-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profil
        </button>
        <button 
          className={`user-tab ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          📅 Rezervasyonlarım
        </button>
        <button 
          className={`user-tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          🛒 Satın Alınan Turlar
        </button>
      </div>

      {/* Tab Content */}
      <div className="user-tab-content">
        {activeTab === 'profile' && (
          <>
            {/* Kullanıcı Bilgileri */}
            <div className="user-info-section">
              <h3>📋 Kişisel Bilgiler</h3>
              <div className="user-info">
                <div className="info-row">
                  <span className="info-label">Ad Soyad:</span>
                  <span className="info-value">{user?.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">E-posta:</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Telefon:</span>
                  <span className="info-value">{user?.phone || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Doğum Tarihi:</span>
                  <span className="info-value">
                    {user?.birthDate ? formatDate(user.birthDate) : '-'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Yaş:</span>
                  <span className="info-value">
                    {user?.birthDate ? calculateAge(user.birthDate) : '-'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Cinsiyet:</span>
                  <span className="info-value">
                    {user?.gender === 'erkek' ? 'Erkek' : 
                     user?.gender === 'kadın' ? 'Kadın' : 
                     user?.gender === 'diğer' ? 'Diğer' : 
                     user?.gender === 'belirtmek_istemiyorum' ? 'Belirtmek İstemiyorum' : '-'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Üyelik Tarihi:</span>
                  <span className="info-value">
                    {user?.createdAt ? formatDate(user.createdAt) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Şifre Değiştirme */}
            <div className="password-section">
              <h3>🔐 Güvenlik</h3>
              {!showPasswordChange ? (
                <button 
                  className="change-password-btn"
                  onClick={() => setShowPasswordChange(true)}
                >
                  Şifre Değiştir
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Mevcut Şifre:</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Yeni Şifre:</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      required
                      className="form-input"
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Yeni Şifre (Tekrar):</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      required
                      className="form-input"
                      minLength={6}
                    />
                  </div>
                  {passwordMessage && (
                    <div className={`message ${passwordMessage.includes('başarıyla') ? 'success' : 'error'}`}>
                      {passwordMessage}
                    </div>
                  )}
                  <div className="password-actions">
                    <button 
                      type="submit" 
                      className="save-password-btn"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-password-btn"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setPasswordMessage('');
                      }}
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        {activeTab === 'reservations' && (
          <ReservationList />
        )}

        {activeTab === 'purchases' && (
          <div className="purchases-section">
            <h3>🛒 Satın Alınan Turlar</h3>
            <PurchaseList purchases={purchases} />
          </div>
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}>🚪 Çıkış Yap</button>
    </div>
  );
};

export default UserPanel; 