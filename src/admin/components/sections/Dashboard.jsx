import React from 'react';
import './Dashboard.css';

const Dashboard = ({ stats, recentActivities }) => {
  return (
    <div className="dashboard-grid">
      {/* İstatistik Kartları */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Toplam Kullanıcı</p>
            <span className="stat-change positive">+12%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🗺️</div>
          <div className="stat-content">
            <h3>{stats?.totalTours || 0}</h3>
            <p>Aktif Tur</p>
            <span className="stat-change positive">+5%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₺{stats?.totalRevenue || 0}</h3>
            <p>Toplam Gelir</p>
            <span className="stat-change positive">+18%</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats?.totalReservations || 0}</h3>
            <p>Toplam Rezervasyon</p>
            <span className="stat-change positive">+8%</span>
          </div>
        </div>
      </div>

      {/* Grafikler ve Raporlar */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Gelir Grafiği</h3>
          <div className="chart-placeholder">
            📊 Gelir grafiği burada görünecek
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Rezervasyon Trendi</h3>
          <div className="chart-placeholder">
            📈 Rezervasyon trendi burada görünecek
          </div>
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="recent-activities">
        <h3>Son Aktiviteler</h3>
        <div className="activity-list">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{activity.icon || '📝'}</div>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span>{new Date(activity.timestamp).toLocaleString('tr-TR')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <p>Henüz aktivite bulunmuyor</p>
                <span>Yeni aktiviteler burada görünecek</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="quick-actions">
        <h3>Hızlı İşlemler</h3>
        <div className="action-buttons">
          <button className="action-btn">👥 Yeni Kullanıcı</button>
          <button className="action-btn">🗺️ Yeni Tur</button>
          <button className="action-btn">📝 Yeni Blog</button>
          <button className="action-btn">📊 Rapor İndir</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 