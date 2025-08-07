import React, { useState, useEffect, useRef } from 'react';
import AnalyticsManagement from './sections/AnalyticsManagement';
import UserManagement from './sections/UserManagement';
import TourManagement from './sections/TourManagement';
import SliderManagement from './sections/SliderManagement';
import InstagramTourManagement from './sections/InstagramTourManagement';
import MessageManagement from './sections/MessageManagement';
import NotificationManagement from './sections/NotificationManagement';
import BlogManagement from './sections/BlogManagement';
import ReservationManagement from './sections/ReservationManagement';
import Reports from './sections/Reports';
import Settings from './sections/Settings';
import EmailTest from './sections/EmailTest';
import ProfileSettingsModal from './modals/ProfileSettingsModal';
import './AdminMain.css';

const AdminMain = ({ 
  activeTab, 
  stats, 
  users, 
  tours, 
  blogs, 
  reservations, 
  recentActivities,
  fetchDashboardData,
  sidebarCollapsed 
}) => {
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const adminDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const getPageTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'users': 'Kullanıcı Yönetimi',
      'tours': 'Tur Yönetimi',
      'slider': 'Slider Yönetimi',
      'instagram-tours': 'Instagram Tour Yönetimi',
      'messages': 'Mesaj Yönetimi',
      'notifications': 'Bildirim Yönetimi',
      'blogs': 'Blog Yönetimi',
      'reservations': 'Rezervasyonlar',
      'reports': 'Raporlar',
      'settings': 'Ayarlar',
      'email-test': 'Email Test'
    };
    return titles[activeTab] || 'Admin Panel';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsManagement />;
      case 'users':
        return <UserManagement users={users} fetchDashboardData={fetchDashboardData} />;
      case 'tours':
        return <TourManagement tours={tours} fetchDashboardData={fetchDashboardData} />;
      case 'slider':
        return <SliderManagement />;
      case 'instagram-tours':
        return <InstagramTourManagement />;
      case 'messages':
        return <MessageManagement />;
      case 'notifications':
        return <NotificationManagement />;
      case 'blogs':
        return <BlogManagement blogs={blogs} fetchDashboardData={fetchDashboardData} />;
      case 'reservations':
        return <ReservationManagement reservations={reservations} fetchDashboardData={fetchDashboardData} />;
      case 'reports':
        return <Reports stats={stats} />;
      case 'settings':
        return <Settings />;
      case 'email-test':
        return <EmailTest />;
      default:
        return <AnalyticsManagement />;
    }
  };

  const handleAdminClick = () => {
    setShowAdminDropdown(!showAdminDropdown);
    setShowNotifications(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowAdminDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin';
  };

  const handleProfileSettings = () => {
    setShowProfileModal(true);
    setShowAdminDropdown(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setShowAdminDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="main-header">
        <h1>{getPageTitle()}</h1>
        <div className="header-actions">
          <div className="notification-container" ref={notificationDropdownRef}>
            <button className="notification-btn" onClick={handleNotificationClick}>
              🔔
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-item">
                  <span>📧 Yeni rezervasyon bildirimi</span>
                  <small>2 dakika önce</small>
                </div>
                <div className="notification-item">
                  <span>👥 Yeni kullanıcı kaydı</span>
                  <small>5 dakika önce</small>
                </div>
                <div className="notification-item">
                  <span>🗺️ Tur güncellemesi</span>
                  <small>10 dakika önce</small>
                </div>
              </div>
            )}
          </div>
          
          <div className="admin-container" ref={adminDropdownRef}>
            <button className="profile-btn" onClick={handleAdminClick}>
              👤 Admin
            </button>
            {showAdminDropdown && (
              <div className="admin-dropdown">
                <div className="dropdown-item" onClick={handleProfileSettings}>
                  <span>⚙️ Profil Ayarları</span>
                </div>
                <div className="dropdown-item" onClick={handleProfileSettings}>
                  <span>🔐 Şifre Değiştir</span>
                </div>
                <div className="dropdown-item" onClick={handleProfileSettings}>
                  <span>📧 Email Ayarları</span>
                </div>
                <div className="dropdown-separator"></div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <span>🚪 Çıkış Yap</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>
      
      <ProfileSettingsModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default AdminMain; 