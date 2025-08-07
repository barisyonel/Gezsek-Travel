import React from 'react';
import Dashboard from './sections/Dashboard';
import UserManagement from './sections/UserManagement';
import TourManagement from './sections/TourManagement';
import BlogManagement from './sections/BlogManagement';
import ReservationManagement from './sections/ReservationManagement';
import Reports from './sections/Reports';
import Settings from './sections/Settings';
import EmailTest from './sections/EmailTest';
import './AdminMain.css';

const AdminMain = ({ 
  activeTab, 
  stats, 
  users, 
  tours, 
  blogs, 
  reservations, 
  recentActivities,
  fetchDashboardData 
}) => {
  const getPageTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'users': 'Kullanıcı Yönetimi',
      'tours': 'Tur Yönetimi',
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
        return <Dashboard stats={stats} recentActivities={recentActivities} />;
      case 'users':
        return <UserManagement users={users} fetchDashboardData={fetchDashboardData} />;
      case 'tours':
        return <TourManagement tours={tours} fetchDashboardData={fetchDashboardData} />;
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
        return <Dashboard stats={stats} recentActivities={recentActivities} />;
    }
  };

  return (
    <div className="admin-main">
      <div className="main-header">
        <h1>{getPageTitle()}</h1>
        <div className="header-actions">
          <button className="notification-btn">🔔</button>
          <button className="profile-btn">👤 Admin</button>
        </div>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminMain; 