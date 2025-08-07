import React from 'react';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Kullanıcılar', icon: '👥' },
    { id: 'tours', label: 'Turlar', icon: '🗺️' },
    { id: 'blogs', label: 'Blog', icon: '📝' },
    { id: 'reservations', label: 'Rezervasyonlar', icon: '📅' },
    { id: 'reports', label: 'Raporlar', icon: '📈' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
    { id: 'email-test', label: 'Email Test', icon: '📧' }
  ];

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>🔒 Admin Panel</h2>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar; 