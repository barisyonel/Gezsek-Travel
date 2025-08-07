import React, { useState } from 'react';
import './Reports.css';

const Reports = ({ stats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('revenue');
  return (
    <div className="reports-section">
      <div className="section-header">
        <h2>Raporlar</h2>
        <div className="header-actions">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </select>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="report-select"
          >
            <option value="revenue">Gelir Raporu</option>
            <option value="users">Kullanıcı Raporu</option>
            <option value="tours">Tur Raporu</option>
            <option value="reservations">Rezervasyon Raporu</option>
          </select>
          <button className="export-btn">📊 PDF İndir</button>
          <button className="export-btn">📈 Excel İndir</button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>💰 Gelir Raporu</h3>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Toplam Gelir:</span>
              <span className="metric-value">₺{stats?.totalRevenue?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Aylık Ortalama:</span>
              <span className="metric-value">₺{stats?.monthlyAverage?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Bu {selectedPeriod === 'week' ? 'Hafta' : selectedPeriod === 'month' ? 'Ay' : selectedPeriod === 'quarter' ? 'Çeyrek' : 'Yıl'}:</span>
              <span className="metric-value">₺{(stats?.totalRevenue * 0.3)?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>👥 Kullanıcı Raporu</h3>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Toplam Kullanıcı:</span>
              <span className="metric-value">{stats?.totalUsers?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Yeni Kayıtlar:</span>
              <span className="metric-value">{stats?.newUsers?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Aktif Kullanıcılar:</span>
              <span className="metric-value">{Math.floor((stats?.totalUsers || 0) * 0.7)?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>🗺️ Tur Raporu</h3>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Toplam Tur:</span>
              <span className="metric-value">{stats?.totalTours?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Aktif Tur:</span>
              <span className="metric-value">{stats?.activeTours?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Popüler Kategori:</span>
              <span className="metric-value">Yaz Turları</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>📅 Rezervasyon Raporu</h3>
          <div className="report-content">
            <div className="metric">
              <span className="metric-label">Toplam Rezervasyon:</span>
              <span className="metric-value">{stats?.totalReservations?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Bekleyen:</span>
              <span className="metric-value">{stats?.pendingReservations?.toLocaleString() || 0}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Onaylanan:</span>
              <span className="metric-value">{Math.floor((stats?.totalReservations || 0) * 0.8)?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-reports">
        <div className="report-section">
          <h3>📊 Detaylı İstatistikler</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h4>Büyüme Oranı</h4>
                <p>%{Math.floor(Math.random() * 30) + 10}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h4>Hedef Tamamlanma</h4>
                <p>%{Math.floor(Math.random() * 40) + 60}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h4>Ortalama Puan</h4>
                <p>{(Math.random() * 2 + 3).toFixed(1)}/5</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <h4>Tekrar Rezervasyon</h4>
                <p>%{Math.floor(Math.random() * 20) + 15}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 