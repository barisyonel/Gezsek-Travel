import React from 'react';
import './Reports.css';

const Reports = ({ stats }) => {
  return (
    <div className="reports-section">
      <div className="section-header">
        <h2>Raporlar</h2>
        <div className="header-actions">
          <button className="export-btn">📊 PDF İndir</button>
          <button className="export-btn">📈 Excel İndir</button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Gelir Raporu</h3>
          <div className="report-content">
            <p>Toplam Gelir: ₺{stats?.totalRevenue || 0}</p>
            <p>Aylık Ortalama: ₺{stats?.monthlyAverage || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Kullanıcı Raporu</h3>
          <div className="report-content">
            <p>Toplam Kullanıcı: {stats?.totalUsers || 0}</p>
            <p>Yeni Kayıtlar: {stats?.newUsers || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Tur Raporu</h3>
          <div className="report-content">
            <p>Toplam Tur: {stats?.totalTours || 0}</p>
            <p>Aktif Tur: {stats?.activeTours || 0}</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Rezervasyon Raporu</h3>
          <div className="report-content">
            <p>Toplam Rezervasyon: {stats?.totalReservations || 0}</p>
            <p>Bekleyen: {stats?.pendingReservations || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 