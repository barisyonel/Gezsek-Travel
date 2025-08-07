import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import NotificationPanel from '../common/NotificationPanel';
import notificationService from '../../services/notificationService';
import '../../App.css';

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAuthenticated = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated) {
        try {
          // Önce localStorage'dan user bilgisini al
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAdmin(userData.isAdmin);
          }
          
          // Sonra server'dan güncel bilgileri al
          const token = localStorage.getItem('token');
          const response = await fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAdmin(userData.isAdmin);
            // localStorage'ı güncelle
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.error('Profile request failed:', response.status);
          }
        } catch (error) {
          console.error('User status check failed:', error);
        }
      }
    };
    checkUserStatus();

    // Bildirim listener'ı ekle
    const unsubscribe = notificationService.addListener((notifications, count) => {
      setUnreadCount(count);
    });

    // Bildirim izni durumunu kontrol et (otomatik istemez)
    // notificationService.requestPermission();

    return unsubscribe;
  }, [isAuthenticated]);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
      setShowDropdown(false);
      window.location.reload();
    } else {
      navigate('/login');
    }
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setShowDropdown(false);
    navigate('/');
    window.location.reload();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header-modern">
      {/* Top Bar - User Controls */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <div className="contact-info">
              <span className="contact-item">
                <i className="contact-icon">📞</i>
                <span>+90 555 123 45 67</span>
              </span>
              <span className="contact-item">
                <i className="contact-icon">✉️</i>
                <span>info@gezsektravel.com</span>
              </span>
            </div>
          </div>
          <div className="top-bar-right">
            <ThemeToggle />
            {isAuthenticated && (
              <button 
                onClick={() => setShowNotifications(true)}
                className="notification-btn-top"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
            )}
            {isAuthenticated && user ? (
              <div className="user-menu-top">
                <button 
                  onClick={handleUserClick} 
                  className="user-btn-top"
                >
                  <div className="user-avatar-top">
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="user-name-top">{user.name}</span>
                  <i className="dropdown-arrow-top">▼</i>
                </button>
                {showDropdown && (
                  <div className="user-dropdown-top">
                    <button onClick={() => handleNavigation('/profile')} className="dropdown-item-top">
                      <i className="dropdown-icon-top">👤</i>
                      <span>Profil</span>
                    </button>
                                                {isAdmin && (
                              <button onClick={() => handleNavigation('/admin-panel')} className="dropdown-item-top">
                                <i className="dropdown-icon-top">⚙️</i>
                                <span>Admin Panel</span>
                              </button>
                            )}
                    <button onClick={handleLogout} className="dropdown-item-top logout">
                      <i className="dropdown-icon-top">🚪</i>
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleAuthClick} 
                className="auth-btn-top"
              >
                <i className="auth-icon-top">🔐</i>
                <span>Giriş Yap</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="main-navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="logo-container" onClick={() => handleNavigation('/')}>
              <img src="/logo.png" alt="Gezsek Travel Logo" className="logo-image" />
              <div className="logo-text">
                <span className="logo-title">Gezsek</span>
                <span className="logo-subtitle">Travel</span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`navbar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-list">
              <li className={`nav-item ${isActivePage('/') ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('/')} className="nav-link">
                  <i className="nav-icon">🏠</i>
                  <span>Ana Sayfa</span>
                </button>
              </li>
              <li className={`nav-item ${isActivePage('/tours') ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('/tours')} className="nav-link">
                  <i className="nav-icon">🗺️</i>
                  <span>Turlar</span>
                </button>
              </li>
              <li className={`nav-item ${isActivePage('/destinations') ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('/destinations')} className="nav-link">
                  <i className="nav-icon">✈️</i>
                  <span>Destinasyonlar</span>
                </button>
              </li>

              <li className={`nav-item ${isActivePage('/about') ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('/about')} className="nav-link">
                  <i className="nav-icon">ℹ️</i>
                  <span>Hakkımızda</span>
                </button>
              </li>
              <li className={`nav-item ${isActivePage('/contact') ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('/contact')} className="nav-link">
                  <i className="nav-icon">📞</i>
                  <span>İletişim</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Bildirim Paneli */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header; 