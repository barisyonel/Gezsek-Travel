import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import FileUpload from '../common/FileUpload';
import MessageManagement from './sections/MessageManagement';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [instagramTours, setInstagramTours] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAddTour, setShowAddTour] = useState(false);
  const [showEditTour, setShowEditTour] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showAddInstagramTour, setShowAddInstagramTour] = useState(false);
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    location: '',
    image: '',
    category: '',
    highlights: '',
    dates: '',
    maxParticipants: ''
  });
  const [newInstagramTour, setNewInstagramTour] = useState({
    title: '',
    description: '',
    image: '',
    instagramUrl: '',
    likes: '',
    views: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [usersResponse, statsResponse, toursResponse, instagramResponse] = await Promise.all([
        fetch('/api/auth/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/tours', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/instagram-tours', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersResponse.ok && statsResponse.ok) {
        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        setUsers(usersData);
        setStats(statsData);
      }

      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        setTours(toursData.tours || toursData);
      }

      if (instagramResponse.ok) {
        const instagramData = await instagramResponse.json();
        setInstagramTours(instagramData.instagramTours || instagramData);
      }
    } catch (err) {
      setError('Veriler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      verified: user.verified,
      isAdmin: user.isAdmin
    });
    setEditMode(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setEditMode(false);
        setSelectedUser(null);
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Güncelleme hatası');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Silme hatası');
    }
  };

  const handleAddTour = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTour)
      });

      if (response.ok) {
        setShowAddTour(false);
        setNewTour({
          title: '',
          description: '',
          price: '',
          duration: '',
          location: '',
          image: '',
          category: '',
          highlights: '',
          dates: '',
          maxParticipants: ''
        });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Tur ekleme hatası');
    }
  };

  const handleEditTour = (tour) => {
    setSelectedTour(tour);
    setNewTour({
      title: tour.title,
      description: tour.description,
      price: tour.price.toString(),
      duration: tour.duration,
      location: tour.location,
      image: tour.image,
      category: tour.category,
      highlights: tour.highlights || '',
      dates: tour.dates || '',
      maxParticipants: tour.maxParticipants.toString()
    });
    setShowEditTour(true);
  };

  const handleUpdateTour = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tours/${selectedTour._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTour)
      });

      if (response.ok) {
        setShowEditTour(false);
        setSelectedTour(null);
        setNewTour({
          title: '',
          description: '',
          price: '',
          duration: '',
          location: '',
          image: '',
          category: '',
          highlights: '',
          dates: '',
          maxParticipants: ''
        });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Tur güncelleme hatası');
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Bu turu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Tur silme hatası');
    }
  };

  const handleAddInstagramTour = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/instagram-tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInstagramTour)
      });

      if (response.ok) {
        setShowAddInstagramTour(false);
        setNewInstagramTour({
          title: '',
          description: '',
          image: '',
          instagramUrl: '',
          likes: '',
          views: ''
        });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Instagram turu ekleme hatası');
    }
  };

  const handleDeleteInstagramTour = async (tourId) => {
    if (!window.confirm('Bu Instagram turunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/instagram-tours/${tourId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Instagram turu silme hatası');
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

  if (loading) return <LoadingSpinner text="Admin paneli yükleniyor..." />;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Paneli</h2>
      
      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Kullanıcılar
        </button>
        <button 
          className={`admin-tab ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          🗺️ Turlar
        </button>
        <button 
          className={`admin-tab ${activeTab === 'instagram' ? 'active' : ''}`}
          onClick={() => setActiveTab('instagram')}
        >
          📸 Instagram Turları
        </button>
        <button 
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Mesajlar
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="admin-stats">
          <h3>Genel İstatistikler</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Toplam Kullanıcı</h4>
              <span className="stat-number">{stats.totalUsers}</span>
            </div>
            <div className="stat-card">
              <h4>Toplam Tur</h4>
              <span className="stat-number">{tours.length}</span>
            </div>
            <div className="stat-card">
              <h4>Instagram Turları</h4>
              <span className="stat-number">{instagramTours.length}</span>
            </div>
            <div className="stat-card">
              <h4>Admin</h4>
              <span className="stat-number">{stats.adminUsers}</span>
            </div>
          </div>

          {stats.ageGroups && stats.ageGroups.length > 0 && (
            <div className="age-groups">
              <h4>Yaş Grupları</h4>
              <div className="age-groups-grid">
                {stats.ageGroups.map(group => (
                  <div key={group._id} className="age-group">
                    <span>{group._id}</span>
                    <span>{group.count} kişi</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.genderStats && stats.genderStats.length > 0 && (
            <div className="gender-stats">
              <h4>Cinsiyet Dağılımı</h4>
              <div className="gender-stats-grid">
                {stats.genderStats.map(stat => (
                  <div key={stat._id} className="gender-stat">
                    <span>{stat._id}</span>
                    <span>{stat.count} kişi</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <h3>Kullanıcı Yönetimi</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Doğum Tarihi</th>
                  <th>Yaş</th>
                  <th>Cinsiyet</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{formatDate(user.birthDate)}</td>
                    <td>{calculateAge(user.birthDate)}</td>
                    <td>{user.gender}</td>
                    <td>
                      <span className={`status ${user.verified ? 'verified' : 'unverified'}`}>
                        {user.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                      </span>
                      {user.isAdmin && <span className="admin-badge">Admin</span>}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="edit-btn"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="delete-btn"
                        disabled={user.isAdmin}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tours Tab */}
      {activeTab === 'tours' && (
        <div className="admin-tours">
          <div className="tours-header">
            <h3>Tur Yönetimi</h3>
            <button 
              onClick={() => setShowAddTour(true)}
              className="add-btn"
            >
              ➕ Yeni Tur Ekle
            </button>
          </div>
          <div className="tours-table">
            <table>
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Süre</th>
                  <th>Konum</th>
                  <th>Katılımcı</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {tours.map(tour => (
                  <tr key={tour._id}>
                    <td>{tour.title}</td>
                    <td>{tour.category}</td>
                    <td>{tour.price} ₺</td>
                    <td>{tour.duration}</td>
                    <td>{tour.location}</td>
                    <td>{tour.maxParticipants}</td>
                    <td>
                      <button 
                        onClick={() => handleEditTour(tour)}
                        className="edit-btn"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDeleteTour(tour._id)}
                        className="delete-btn"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instagram Tours Tab */}
      {activeTab === 'instagram' && (
        <div className="admin-instagram">
          <div className="instagram-header">
            <h3>Instagram Tur Yönetimi</h3>
            <button 
              onClick={() => setShowAddInstagramTour(true)}
              className="add-btn"
            >
              ➕ Yeni Instagram Turu Ekle
            </button>
          </div>
          <div className="instagram-grid">
            {instagramTours.map(tour => (
              <div key={tour._id} className="instagram-card">
                <img src={tour.image} alt={tour.title} />
                <div className="instagram-info">
                  <h4>{tour.title}</h4>
                  <p>{tour.description}</p>
                  <div className="instagram-stats">
                    <span>❤️ {tour.likes}</span>
                    <span>👁️ {tour.views}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteInstagramTour(tour._id)}
                    className="delete-btn"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <MessageManagement />
      )}

      {/* Add Tour Modal */}
      {showAddTour && (
        <div className="admin-modal-bg" onClick={() => setShowAddTour(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Yeni Tur Ekle</h3>
            <form onSubmit={handleAddTour} className="add-form">
              <div className="form-group">
                <label>Başlık:</label>
                <input
                  type="text"
                  value={newTour.title}
                  onChange={e => setNewTour({...newTour, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Açıklama:</label>
                <textarea
                  value={newTour.description}
                  onChange={e => setNewTour({...newTour, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fiyat (₺):</label>
                  <input
                    type="number"
                    value={newTour.price}
                    onChange={e => setNewTour({...newTour, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Süre:</label>
                  <input
                    type="text"
                    value={newTour.duration}
                    onChange={e => setNewTour({...newTour, duration: e.target.value})}
                    placeholder="3 gün 2 gece"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Konum:</label>
                  <input
                    type="text"
                    value={newTour.location}
                    onChange={e => setNewTour({...newTour, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kategori:</label>
                  <select
                    value={newTour.category}
                    onChange={e => setNewTour({...newTour, category: e.target.value})}
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="Yaz Turları">Yaz Turları</option>
                    <option value="Kültür Turları">Kültür Turları</option>
                    <option value="Gemi Turları">Gemi Turları</option>
                    <option value="Kıbrıs Turları">Kıbrıs Turları</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Resim URL:</label>
                <input
                  type="url"
                  value={newTour.image}
                  onChange={e => setNewTour({...newTour, image: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Öne Çıkanlar:</label>
                <textarea
                  value={newTour.highlights}
                  onChange={e => setNewTour({...newTour, highlights: e.target.value})}
                  placeholder="Her satıra bir özellik"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tarihler:</label>
                  <input
                    type="text"
                    value={newTour.dates}
                    onChange={e => setNewTour({...newTour, dates: e.target.value})}
                    placeholder="15-17 Haziran 2024"
                  />
                </div>
                <div className="form-group">
                  <label>Maks. Katılımcı:</label>
                  <input
                    type="number"
                    value={newTour.maxParticipants}
                    onChange={e => setNewTour({...newTour, maxParticipants: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Ekle
                </button>
                <button type="button" onClick={() => setShowAddTour(false)} className="cancel-btn">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Instagram Tour Modal */}
      {showAddInstagramTour && (
        <div className="admin-modal-bg" onClick={() => setShowAddInstagramTour(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Yeni Instagram Turu Ekle</h3>
            <form onSubmit={handleAddInstagramTour} className="add-form">
              <div className="form-group">
                <label>Başlık:</label>
                <input
                  type="text"
                  value={newInstagramTour.title}
                  onChange={e => setNewInstagramTour({...newInstagramTour, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Açıklama:</label>
                <textarea
                  value={newInstagramTour.description}
                  onChange={e => setNewInstagramTour({...newInstagramTour, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Resim URL:</label>
                <input
                  type="url"
                  value={newInstagramTour.image}
                  onChange={e => setNewInstagramTour({...newInstagramTour, image: e.target.value})}
                  placeholder="Veya aşağıdan dosya yükleyin"
                />
              </div>
              <div className="form-group">
                <label>Resim Yükle:</label>
                <FileUpload
                  onUpload={(data) => setNewInstagramTour({...newInstagramTour, image: data.url})}
                  accept="image/*"
                />
              </div>
              <div className="form-group">
                <label>Instagram URL:</label>
                <input
                  type="url"
                  value={newInstagramTour.instagramUrl}
                  onChange={e => setNewInstagramTour({...newInstagramTour, instagramUrl: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Beğeni Sayısı:</label>
                  <input
                    type="number"
                    value={newInstagramTour.likes}
                    onChange={e => setNewInstagramTour({...newInstagramTour, likes: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Görüntülenme:</label>
                  <input
                    type="number"
                    value={newInstagramTour.views}
                    onChange={e => setNewInstagramTour({...newInstagramTour, views: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Ekle
                </button>
                <button type="button" onClick={() => setShowAddInstagramTour(false)} className="cancel-btn">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tour Modal */}
      {showEditTour && selectedTour && (
        <div className="admin-modal-bg" onClick={() => setShowEditTour(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Tur Düzenle</h3>
            <form onSubmit={handleUpdateTour} className="add-form">
              <div className="form-group">
                <label>Başlık:</label>
                <input
                  type="text"
                  value={newTour.title}
                  onChange={e => setNewTour({...newTour, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Açıklama:</label>
                <textarea
                  value={newTour.description}
                  onChange={e => setNewTour({...newTour, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fiyat (₺):</label>
                  <input
                    type="number"
                    value={newTour.price}
                    onChange={e => setNewTour({...newTour, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Süre:</label>
                  <input
                    type="text"
                    value={newTour.duration}
                    onChange={e => setNewTour({...newTour, duration: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Konum:</label>
                  <input
                    type="text"
                    value={newTour.location}
                    onChange={e => setNewTour({...newTour, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Resim URL:</label>
                  <input
                    type="url"
                    value={newTour.image}
                    onChange={e => setNewTour({...newTour, image: e.target.value})}
                    placeholder="Veya aşağıdan dosya yükleyin"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Resim Yükle:</label>
                <FileUpload
                  onUpload={(data) => setNewTour({...newTour, image: data.url})}
                  accept="image/*"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori:</label>
                  <select
                    value={newTour.category}
                    onChange={e => setNewTour({...newTour, category: e.target.value})}
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    <option value="Yaz Turları">Yaz Turları</option>
                    <option value="Kültür Turları">Kültür Turları</option>
                    <option value="Gemi Turları">Gemi Turları</option>
                    <option value="Kıbrıs Turları">Kıbrıs Turları</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Maksimum Katılımcı:</label>
                  <input
                    type="number"
                    value={newTour.maxParticipants}
                    onChange={e => setNewTour({...newTour, maxParticipants: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Öne Çıkanlar:</label>
                <textarea
                  value={newTour.highlights}
                  onChange={e => setNewTour({...newTour, highlights: e.target.value})}
                  placeholder="Tur öne çıkanları..."
                />
              </div>
              <div className="form-group">
                <label>Tarihler:</label>
                <textarea
                  value={newTour.dates}
                  onChange={e => setNewTour({...newTour, dates: e.target.value})}
                  placeholder="Tur tarihleri..."
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Güncelle
                </button>
                <button type="button" onClick={() => setShowEditTour(false)} className="cancel-btn">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editMode && selectedUser && (
        <div className="admin-modal-bg" onClick={() => setEditMode(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Kullanıcı Düzenle</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Ad Soyad:</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={e => setEditData({...editData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Telefon:</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={e => setEditData({...editData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editData.verified}
                    onChange={e => setEditData({...editData, verified: e.target.checked})}
                  />
                  Doğrulanmış
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editData.isAdmin}
                    onChange={e => setEditData({...editData, isAdmin: e.target.checked})}
                  />
                  Admin
                </label>
              </div>
              <div className="modal-actions">
                <button onClick={handleUpdateUser} className="save-btn">
                  Kaydet
                </button>
                <button onClick={() => setEditMode(false)} className="cancel-btn">
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 