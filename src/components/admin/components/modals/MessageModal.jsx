import React, { useState } from 'react';
import './MessageModal.css';

const MessageModal = ({ isOpen, onClose, message, onStatusUpdate, onAssignMessage, users }) => {
  const [selectedStatus, setSelectedStatus] = useState(message?.status || 'okunmamis');
  const [selectedAssignee, setSelectedAssignee] = useState(message?.assignedTo?._id || '');

  const handleStatusChange = async () => {
    if (selectedStatus !== message.status) {
      await onStatusUpdate(message._id, selectedStatus);
    }
  };

  const handleAssigneeChange = async () => {
    if (selectedAssignee !== (message.assignedTo?._id || '')) {
      await onAssignMessage(message._id, selectedAssignee || null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'okunmamis': return '#dc3545';
      case 'okundu': return '#ffc107';
      case 'yanitlandi': return '#28a745';
      case 'arsivlendi': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'acil': return '#dc3545';
      case 'yuksek': return '#fd7e14';
      case 'normal': return '#28a745';
      case 'dusuk': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'rezervasyon': return '📅';
      case 'sikayet': return '⚠️';
      case 'oneri': return '💡';
      case 'teknik': return '🔧';
      case 'diger': return '📝';
      default: return '📧';
    }
  };

  if (!isOpen || !message) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content message-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📬 Mesaj Detayları</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <div className="modal-body">
          {/* Message Header */}
          <div className="message-header">
            <div className="message-subject">
              <h4>{message.subject}</h4>
              <div className="message-meta">
                <span className="message-id">#{message._id.slice(-8)}</span>
                <span className="message-date">
                  {new Date(message.createdAt).toLocaleDateString('tr-TR')} - 
                  {new Date(message.createdAt).toLocaleTimeString('tr-TR')}
                </span>
              </div>
            </div>
            
            <div className="message-badges">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(message.status) }}
              >
                {message.status}
              </span>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(message.priority) }}
              >
                {message.priority}
              </span>
              <span className="category-badge">
                {getCategoryIcon(message.category)} {message.category}
              </span>
            </div>
          </div>

          {/* Sender Information */}
          <div className="sender-section">
            <h5>👤 Gönderen Bilgileri</h5>
            <div className="sender-details">
              <div className="sender-item">
                <label>Ad Soyad:</label>
                <span>{message.name}</span>
              </div>
              <div className="sender-item">
                <label>Email:</label>
                <span>{message.email}</span>
              </div>
              {message.phone && (
                <div className="sender-item">
                  <label>Telefon:</label>
                  <span>{message.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="message-content-section">
            <h5>📝 Mesaj İçeriği</h5>
            <div className="message-content">
              {message.message}
            </div>
          </div>

          {/* Message Metadata */}
          {message.metadata && (
            <div className="metadata-section">
              <h5>🔍 Mesaj Bilgileri</h5>
              <div className="metadata-grid">
                {message.metadata.source && (
                  <div className="metadata-item">
                    <label>Kaynak:</label>
                    <span>{message.metadata.source}</span>
                  </div>
                )}
                {message.metadata.ipAddress && (
                  <div className="metadata-item">
                    <label>IP Adresi:</label>
                    <span>{message.metadata.ipAddress}</span>
                  </div>
                )}
                {message.metadata.referrer && (
                  <div className="metadata-item">
                    <label>Referrer:</label>
                    <span>{message.metadata.referrer}</span>
                  </div>
                )}
                {message.tags && message.tags.length > 0 && (
                  <div className="metadata-item">
                    <label>Etiketler:</label>
                    <div className="tags-list">
                      {message.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Read History */}
          {message.readBy && message.readBy.length > 0 && (
            <div className="read-history-section">
              <h5>👁️ Okuma Geçmişi</h5>
              <div className="read-history">
                {message.readBy.map((read, index) => (
                  <div key={index} className="read-item">
                    <span className="reader-name">{read.user?.name || 'Bilinmeyen'}</span>
                    <span className="read-time">
                      {new Date(read.readAt).toLocaleDateString('tr-TR')} - 
                      {new Date(read.readAt).toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replies */}
          {message.replies && message.replies.length > 0 && (
            <div className="replies-section">
              <h5>💬 Yanıtlar ({message.replies.length})</h5>
              <div className="replies-list">
                {message.replies.map((reply, index) => (
                  <div key={index} className={`reply-item ${reply.isInternal ? 'internal' : ''}`}>
                    <div className="reply-header">
                      <span className="reply-author">{reply.user?.name || 'Bilinmeyen'}</span>
                      <span className="reply-time">
                        {new Date(reply.createdAt).toLocaleDateString('tr-TR')} - 
                        {new Date(reply.createdAt).toLocaleTimeString('tr-TR')}
                      </span>
                      {reply.isInternal && (
                        <span className="internal-badge">Dahili</span>
                      )}
                    </div>
                    <div className="reply-content">
                      {reply.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h5>⚡ Hızlı İşlemler</h5>
            
            {/* Status Update */}
            <div className="action-group">
              <label>Durum Güncelle:</label>
              <div className="action-controls">
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="action-select"
                >
                  <option value="okunmamis">Okunmamış</option>
                  <option value="okundu">Okundu</option>
                  <option value="yanitlandi">Yanıtlandı</option>
                  <option value="arsivlendi">Arşivlendi</option>
                </select>
                <button 
                  onClick={handleStatusChange}
                  className="action-btn"
                  disabled={selectedStatus === message.status}
                >
                  Güncelle
                </button>
              </div>
            </div>

            {/* Assign Message */}
            <div className="action-group">
              <label>Mesaj Ata:</label>
              <div className="action-controls">
                <select 
                  value={selectedAssignee} 
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="action-select"
                >
                  <option value="">Atanmamış</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
                <button 
                  onClick={handleAssigneeChange}
                  className="action-btn"
                  disabled={selectedAssignee === (message.assignedTo?._id || '')}
                >
                  Ata
                </button>
              </div>
            </div>

            {/* Current Assignment */}
            {message.assignedTo && (
              <div className="current-assignment">
                <label>Şu anda atanmış:</label>
                <span className="assigned-user">{message.assignedTo.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal; 