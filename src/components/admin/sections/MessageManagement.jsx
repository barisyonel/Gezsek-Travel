import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../../../services/api';
import io from 'socket.io-client';
import './MessageManagement.css';

const MessageManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userTyping, setUserTyping] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    setupSocket();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user._id);
    }
  }, [selectedConversation]);

  // Socket.IO bağlantısı kur
  const setupSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Admin Socket.IO bağlandı');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Admin Socket.IO bağlantısı kesildi');
      setIsConnected(false);
    });

    newSocket.on('admin_connected', (data) => {
      console.log('Admin paneli bağlandı:', data);
    });

    newSocket.on('user_online', (data) => {
      console.log('Kullanıcı çevrimiçi:', data);
      // Kullanıcı çevrimiçi olduğunda konuşma listesini güncelle
      fetchConversations();
    });

    newSocket.on('user_offline', (data) => {
      console.log('Kullanıcı çevrimdışı:', data);
      // Kullanıcı çevrimdışı olduğunda konuşma listesini güncelle
      fetchConversations();
    });

    newSocket.on('new_message', (data) => {
      console.log('Yeni mesaj alındı:', data);
      
      // Mesajı doğru konuşmaya ekle
      if (selectedConversation && data.userId === selectedConversation.user._id) {
        setMessages(prev => [...prev, data.message]);
      }
      
      // Konuşma listesini güncelle
      fetchConversations();
      fetchUnreadCount();
    });

    newSocket.on('message_sent', (data) => {
      console.log('Mesaj gönderildi:', data);
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      setSending(false);
    });

    newSocket.on('message_error', (data) => {
      console.error('Mesaj hatası:', data);
      alert('Mesaj gönderilemedi: ' + data.message);
      setSending(false);
    });

    newSocket.on('user_typing', (data) => {
      setUserTyping(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));
    });

    newSocket.on('messages_read', (data) => {
      // Mesajlar okundu olarak işaretlendi
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg._id) 
          ? { ...msg, status: 'read', readAt: new Date() }
          : msg
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  };

  // Tüm konuşmaları getir
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get('/api/messages/admin/conversations');
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Conversations fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Okunmamış mesaj sayısını getir
  const fetchUnreadCount = async () => {
    try {
      const response = await authAPI.get('/api/messages/admin/unread-count');
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Unread count fetch error:', error);
    }
  };

  // Belirli bir kullanıcı ile olan mesajları getir
  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await authAPI.get(`/api/messages/admin/conversation/${userId}`);
      setMessages(response.messages || []);
      
      // Mesajları okundu olarak işaretle
      if (response.messages?.length > 0) {
        await markAsRead(response.conversationId);
      }
    } catch (error) {
      console.error('Messages fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mesajları okundu olarak işaretle
  const markAsRead = async (conversationId) => {
    try {
      // Socket.IO ile okundu bildirimi gönder
      if (socket) {
        const unreadMessageIds = messages
          .filter(msg => !msg.isFromAdmin && msg.status !== 'read')
          .map(msg => msg._id);
        
        if (unreadMessageIds.length > 0) {
          socket.emit('mark_as_read', { messageIds: unreadMessageIds });
        }
      }

      // API'ye de bildir
      await authAPI.put('/api/messages/admin/mark-as-read', {
        conversationId
      });
      fetchUnreadCount(); // Okunmamış sayısını güncelle
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;
    
    try {
      setSending(true);
      
      // Socket.IO ile mesaj gönder
      socket.emit('send_message', {
        content: newMessage.trim(),
        receiverId: selectedConversation.user._id
      });

      // Yazıyor durumunu temizle
      socket.emit('typing', { isTyping: false, userId: selectedConversation.user._id });
      setIsTyping(false);
      
    } catch (error) {
      console.error('Send message error:', error);
      alert('Mesaj gönderilemedi: ' + error.message);
      setSending(false);
    }
  };

  // Yazıyor durumu
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { 
        isTyping: true, 
        userId: selectedConversation?.user._id 
      });
    }
    
    // Yazma durumunu temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { 
        isTyping: false, 
        userId: selectedConversation?.user._id 
      });
    }, 1000);
  };

  // Enter tuşu ile mesaj gönder
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Konuşma seç
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  // Mesaj zamanını formatla
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  // Son mesajı kısalt
  const truncateMessage = (message, maxLength = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <div className="message-management">
      <div className="message-header">
        <h2>💬 Mesaj Yönetimi</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢' : '🔴'}
          </span>
          <span>{isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}</span>
        </div>
        <div className="unread-badge">
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          <span>Okunmamış Mesaj</span>
        </div>
      </div>

      <div className="message-container">
        {/* Sol Panel - Konuşma Listesi */}
        <div className="conversations-panel">
          <div className="panel-header">
            <h3>Konuşmalar</h3>
            <button 
              className="btn btn-refresh"
              onClick={fetchConversations}
              disabled={loading}
            >
              🔄
            </button>
          </div>
          
          <div className="conversations-list">
            {loading ? (
              <div className="loading">Yükleniyor...</div>
            ) : conversations.length === 0 ? (
              <div className="empty-state">Henüz mesaj yok</div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`conversation-item ${selectedConversation?.user._id === conversation.user._id ? 'active' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="user-info">
                    <div className="user-avatar">
                      {conversation.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{conversation.user.name}</div>
                      <div className="user-email">{conversation.user.email}</div>
                    </div>
                  </div>
                  
                  <div className="conversation-preview">
                    <div className="last-message">
                      {truncateMessage(conversation.lastMessage?.content || 'Henüz mesaj yok')}
                    </div>
                    <div className="message-time">
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                    </div>
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="unread-indicator">
                      <span className="unread-count">{conversation.unreadCount}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sağ Panel - Mesaj Alanı */}
        <div className="messages-panel">
          {selectedConversation ? (
            <>
              {/* Kullanıcı Bilgileri */}
              <div className="user-header">
                <div className="user-avatar large">
                  {selectedConversation.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <h3>{selectedConversation.user.name}</h3>
                  <p>{selectedConversation.user.email}</p>
                  <div className="user-details-grid">
                    <span>📞 {selectedConversation.user.phone || 'Telefon yok'}</span>
                    <span>📅 {selectedConversation.user.birthDate ? new Date(selectedConversation.user.birthDate).toLocaleDateString('tr-TR') : 'Doğum tarihi yok'}</span>
                    <span>👤 {selectedConversation.user.gender || 'Belirtilmemiş'}</span>
                  </div>
                </div>
              </div>

              {/* Mesajlar */}
              <div className="messages-container">
                {loading ? (
                  <div className="loading">Mesajlar yükleniyor...</div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">Henüz mesaj yok</div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`message-item ${message.isFromAdmin ? 'admin' : 'user'}`}
                      >
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">
                            {formatTime(message.createdAt)}
                            {message.isFromAdmin && <span className="status">✓</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Kullanıcı yazıyor göstergesi */}
                    {userTyping[selectedConversation.user._id] && (
                      <div className="message-item user typing">
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <div className="message-time">Yazıyor...</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mesaj Gönderme */}
              <div className="message-input">
                <textarea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Mesajınızı yazın..." : "Bağlantı kesildi..."}
                  disabled={sending || !isConnected}
                />
                <button
                  className="btn btn-send"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending || !isConnected}
                >
                  {sending ? 'Gönderiliyor...' : '📤'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="empty-state">
                <h3>💬 Mesaj Seçin</h3>
                <p>Sol panelden bir konuşma seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageManagement; 