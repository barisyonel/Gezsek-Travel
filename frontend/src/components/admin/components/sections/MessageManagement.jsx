import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './MessageManagement.css';

const MessageManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Konuşmaları getir
  const fetchConversations = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/admin/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        setConversations(data.conversations || []);
      } else {
        setError('Konuşmalar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Konuşmalar yüklenirken hata oluştu');
    }
  };

  // İstatistikleri getir
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Okunmamış mesaj sayısını getir
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/admin/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Konuşma seç
  const selectConversation = async (conversation) => {
    try {

      setSelectedConversation(conversation);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/admin/conversation/${conversation.user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        setMessages(data.messages || []);
        
        // Mesajları okundu olarak işaretle
        if (data.messages && data.messages.length > 0) {
          const unreadMessageIds = data.messages
            .filter(msg => !msg.isFromAdmin && !msg.isRead)
            .map(msg => msg._id);
          
          if (unreadMessageIds.length > 0) {
            await markAsRead(data.conversationId);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/admin/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedConversation.user._id,
          content: newMessage.trim()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Konuşma listesini güncelle
        fetchConversations();
      } else {
        const errorData = await response.json();
        alert('Mesaj gönderilemedi: ' + (errorData.message || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Mesaj gönderilirken hata oluştu: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Mesajları okundu olarak işaretle
  const markAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
              await fetch('/api/messages/admin/mark-as-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId })
      });
      
      // Okunmamış sayısını güncelle
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Enter tuşu ile mesaj gönder
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // İlk yükleme
  useEffect(() => {
    fetchConversations();
    fetchStatistics();
    fetchUnreadCount();
    setLoading(false);
  }, []);

  // Yeni mesaj geldiğinde scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    // Otomatik yenileme
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 10000); // 10 saniyede bir
    
    return () => clearInterval(interval);
  }, []);

  // Socket.IO bağlantısı
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:5001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Admin Socket.IO bağlandı');
    });

    newSocket.on('new_message', (data) => {
      console.log('Admin yeni mesaj aldı:', data);
      
      // Mevcut konuşmada mesaj varsa, mesajları güncelle
      if (selectedConversation && 
          (data.message.sender._id === selectedConversation.user._id || 
           data.message.receiver._id === selectedConversation.user._id)) {
        setMessages(prev => [...prev, data.message]);
      }
      
      // Konuşmaları yeniden yükle
      fetchConversations();
      fetchUnreadCount();
    });

    newSocket.on('disconnect', () => {
      console.log('Admin Socket.IO bağlantısı kesildi');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [selectedConversation]);



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="message-management-section">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  // Error handling
  if (error) {
    return (
      <div className="message-management-section">
        <div className="error-message">
          <h3>❌ Hata Oluştu</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Sayfayı Yenile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="message-management-section">
      <div className="section-header">
        <h2>💬 Mesaj Yönetimi</h2>
        <div className="header-actions">
          <button onClick={() => { fetchConversations(); fetchUnreadCount(); }} className="refresh-btn">
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      {statistics && (
        <div className="statistics-dashboard">
          <h3>📊 Mesaj İstatistikleri</h3>
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h4>Toplam Mesaj</h4>
                <p>{statistics.totalMessages}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h4>Kullanıcıdan Gelen</h4>
                <p>{statistics.fromUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-content">
                <h4>Adminden Giden</h4>
                <p>{statistics.fromAdmin}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔴</div>
              <div className="stat-content">
                <h4>Okunmamış</h4>
                <p>{statistics.unreadMessages}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💭</div>
              <div className="stat-content">
                <h4>Aktif Konuşma</h4>
                <p>{statistics.uniqueConversations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="message-container">
        {/* Konuşma Listesi */}
        <div className="conversations-list">
          <h3>💬 Konuşmalar ({conversations.length})</h3>
          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <div className="empty-icon">💬</div>
              <h4>Henüz konuşma yok</h4>
              <p>Kullanıcılar mesaj gönderdiğinde burada görünecek</p>
            </div>
          ) : (
            <div className="conversations">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.user?.avatar || '👤'}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{conversation.user?.name || 'Bilinmeyen Kullanıcı'}</h4>
                      <span className="conversation-time">
                        {formatDate(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <p>{conversation.lastMessage?.content?.substring(0, 50) || 'Mesaj yok'}...</p>
                    </div>
                    <div className="conversation-meta">
                      <span className="message-count">{conversation.messageCount} mesaj</span>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mesaj Alanı */}
        <div className="messages-area">
          {selectedConversation ? (
            <>
              <div className="messages-header">
                                  <div className="user-info">
                    <span className="user-avatar">{selectedConversation.user?.avatar || '👤'}</span>
                    <div>
                      <h3>{selectedConversation.user?.name || 'Bilinmeyen Kullanıcı'}</h3>
                      <p>{selectedConversation.user?.email || 'Email yok'}</p>
                    </div>
                  </div>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <div className="empty-icon">💬</div>
                    <h4>Henüz mesaj yok</h4>
                    <p>Bu kullanıcı ile konuşmaya başlayın</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`message ${message.isFromAdmin ? 'admin' : 'user'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">{formatDate(message.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input">
                <div className="input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Mesajınızı yazın..."
                    rows="1"
                    disabled={sending}
                  />
                  <button
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? (
                      <div className="sending-spinner"></div>
                    ) : (
                      '📤'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="empty-icon">💬</div>
              <h3>Konuşma Seçin</h3>
              <p>Mesajlaşmak için sol taraftan bir konuşma seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageManagement; 