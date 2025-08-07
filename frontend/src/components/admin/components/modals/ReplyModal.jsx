import React, { useState } from 'react';
import './ReplyModal.css';

const ReplyModal = ({ isOpen, onClose, message, onSubmit, templates }) => {
  const [replyData, setReplyData] = useState({
    message: '',
    isInternal: false,
    sendEmail: true
  });
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReplyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      let content = template.content;
      
      // Replace placeholders
      content = content.replace(/{name}/g, message.name);
      content = content.replace(/{email}/g, message.email);
      
      setReplyData(prev => ({
        ...prev,
        message: content
      }));
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!replyData.message.trim()) {
      alert('Lütfen yanıt mesajını yazın!');
      return;
    }

    onSubmit(replyData);
  };

  const handleClose = () => {
    setReplyData({
      message: '',
      isInternal: false,
      sendEmail: true
    });
    setSelectedTemplate('');
    onClose();
  };

  if (!isOpen || !message) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content reply-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💬 Mesaj Yanıtla</h3>
          <button onClick={handleClose} className="modal-close">✕</button>
        </div>
        
        <div className="modal-body">
          {/* Original Message Preview */}
          <div className="original-message-section">
            <h5>📧 Orijinal Mesaj</h5>
            <div className="original-message">
              <div className="original-header">
                <span className="original-sender">{message.name} ({message.email})</span>
                <span className="original-date">
                  {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="original-subject">
                <strong>Konu:</strong> {message.subject}
              </div>
              <div className="original-content">
                {message.message}
              </div>
            </div>
          </div>

          {/* Templates */}
          {templates && templates.length > 0 && (
            <div className="templates-section">
              <h5>📋 Yanıt Şablonları</h5>
              <div className="templates-grid">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`template-btn ${selectedTemplate === template.id ? 'active' : ''}`}
                  >
                    <div className="template-name">{template.name}</div>
                    <div className="template-subject">{template.subject}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="reply-form">
            <div className="form-group">
              <label>Yanıt Mesajı *</label>
              <textarea
                name="message"
                value={replyData.message}
                onChange={handleInputChange}
                required
                className="form-textarea"
                placeholder="Yanıt mesajınızı yazın..."
                rows="8"
              />
            </div>

            <div className="form-options">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isInternal"
                    checked={replyData.isInternal}
                    onChange={handleInputChange}
                  />
                  Dahili Not (Müşteriye gönderilmez)
                </label>
              </div>

              {!replyData.isInternal && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="sendEmail"
                      checked={replyData.sendEmail}
                      onChange={handleInputChange}
                    />
                    Email Gönder
                  </label>
                </div>
              )}
            </div>

            {/* Reply Preview */}
            {replyData.message && (
              <div className="reply-preview">
                <h5>👀 Yanıt Önizleme</h5>
                <div className="preview-content">
                  <div className="preview-header">
                    <span className="preview-to">Kime: {message.name} ({message.email})</span>
                    <span className="preview-subject">Konu: Re: {message.subject}</span>
                  </div>
                  <div className="preview-message">
                    {replyData.message}
                  </div>
                  {replyData.isInternal && (
                    <div className="internal-note">
                      <strong>Not:</strong> Bu dahili bir nottur, müşteriye gönderilmeyecektir.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={handleClose} className="btn-secondary">
                İptal
              </button>
              <button type="submit" className="btn-primary">
                {replyData.isInternal ? 'Not Ekle' : 'Yanıt Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal; 