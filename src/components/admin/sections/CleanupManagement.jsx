import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/api';
import './CleanupManagement.css';

const CleanupManagement = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get('/api/messages/admin/cleanup-status');
      setStatus(response.status);
    } catch (error) {
      console.error('Status fetch error:', error);
      setMessage('Durum bilgisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCleanup = async () => {
    if (!window.confirm('Eski sohbet verilerini temizlemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const response = await authAPI.post('/api/messages/admin/cleanup');
      setStatus(response.status);
      setMessage('Manuel temizleme başarıyla tamamlandı!');
      
      // 3 saniye sonra mesajı temizle
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Manual cleanup error:', error);
      setMessage('Temizleme işlemi sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  if (loading && !status) {
    return (
      <div className="cleanup-management">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="cleanup-management">
      <div className="cleanup-header">
        <h2>🧹 Sohbet Verileri Temizleme</h2>
        <p>12 saatten eski sohbet verilerini otomatik olarak temizler</p>
      </div>

      {message && (
        <div className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="cleanup-status">
        <h3>Servis Durumu</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Servis Durumu:</span>
            <span className={`value ${status?.isRunning ? 'running' : 'stopped'}`}>
              {status?.isRunning ? '🟢 Çalışıyor' : '🔴 Durdu'}
            </span>
          </div>
          
          {status?.nextCleanup && (
            <>
              <div className="status-item">
                <span className="label">Sonraki Temizleme (Gece):</span>
                <span className="value">
                  {formatDate(status.nextCleanup.midnight)}
                </span>
              </div>
              
              <div className="status-item">
                <span className="label">Sonraki Temizleme (Öğle):</span>
                <span className="value">
                  {formatDate(status.nextCleanup.noon)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cleanup-actions">
        <h3>Manuel İşlemler</h3>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleManualCleanup}
            disabled={loading}
          >
            {loading ? 'Temizleniyor...' : '🔧 Manuel Temizleme'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={fetchStatus}
            disabled={loading}
          >
            🔄 Durumu Yenile
          </button>
        </div>
      </div>

      <div className="cleanup-info">
        <h3>ℹ️ Bilgi</h3>
        <div className="info-content">
          <ul>
            <li>• Sohbet verileri her 12 saatte bir otomatik olarak temizlenir</li>
            <li>• Temizleme işlemi soft delete kullanır (veriler tamamen silinmez)</li>
            <li>• Manuel temizleme ile istediğiniz zaman eski verileri silebilirsiniz</li>
            <li>• Temizleme işlemi sadece 12 saatten eski mesajları etkiler</li>
            <li>• Aktif sohbetler etkilenmez</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CleanupManagement; 