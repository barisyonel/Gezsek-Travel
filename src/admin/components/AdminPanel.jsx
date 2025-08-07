import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminMain from './AdminMain';
import { useAdminData } from '../hooks/useAdminData';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { 
    loading, 
    error, 
    stats, 
    users, 
    tours, 
    blogs, 
    reservations, 
    recentActivities,
    fetchDashboardData 
  } = useAdminData();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Hata</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Tekrar Dene</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <AdminMain 
        activeTab={activeTab}
        stats={stats}
        users={users}
        tours={tours}
        blogs={blogs}
        reservations={reservations}
        recentActivities={recentActivities}
        fetchDashboardData={fetchDashboardData}
      />
    </div>
  );
};

export default AdminPanel; 