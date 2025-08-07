import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import io from 'socket.io-client';
import './LiveChat.css';

const LiveChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket.IO bağlantısı kur
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Socket.IO bağlantısı
    const newSocket = io('http://localhost:5001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO bağlandı');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO bağlantısı kesildi');
      setIsConnected(false);
    });

    newSocket.on('user_connected', (data) => {
      console.log('Chat bağlantısı kuruldu:', data);
    });

    newSocket.on('new_message', (data) => {
      console.log('Yeni mesaj alındı:', data);
      setMessages(prev => [...prev, data.message]);
      
      // Mesajı okundu olarak işaretle
      if (data.message.sender._id !== user.id) {
        markAsRead([data.message._id]);
      }
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

    newSocket.on('admin_typing', (data) => {
      setAdminTyping(data.isTyping);
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
  }, [isAuthenticated, user]);

  // Mesajları getir
  const fetchMessages = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversation', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Okunmamış mesajları say
        const unread = data.messages?.filter(msg => 
          !msg.isFromUser && !msg.isRead
        ).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !isAuthenticated || !socket) return;
    
    try {
      setSending(true);
      
      // Socket.IO ile mesaj gönder
      socket.emit('send_message', {
        content: newMessage.trim(),
        receiverId: null // Kullanıcıdan admin'e gönderilecek, backend'te otomatik bulunacak
      });

      // Yazıyor durumunu temizle
      socket.emit('typing', { isTyping: false });
      setIsTyping(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Mesaj gönderilirken hata oluştu: ' + error.message);
      setSending(false);
    }
  };

  // Mesajları okundu olarak işaretle
  const markAsRead = async (messageIds) => {
    if (!isAuthenticated || !socket) return;
    
    try {
      // Socket.IO ile okundu bildirimi gönder
      socket.emit('mark_as_read', { messageIds });
      
      // API'ye de bildir
      const token = localStorage.getItem('token');
      await fetch('/api/messages/mark-as-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageIds })
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Yazıyor durumu
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { isTyping: true });
    }
    
    // Yazma durumunu temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { isTyping: false });
    }, 1000);
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

  // Mesajları otomatik yenile
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchMessages();
    }
  }, [isOpen, isAuthenticated]);

  // Yeni mesaj geldiğinde scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chat açıldığında mesajları okundu olarak işaretle
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => !msg.isFromUser && !msg.isRead)
        .map(msg => msg._id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
        setUnreadCount(0);
      }
    }
  }, [isOpen, messages]);

  if (!isAuthenticated) {
    return null; // Giriş yapmamış kullanıcılar için gizle
  }

  return (
    <div className="live-chat-container">
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''} ${!isConnected ? 'disconnected' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="chat-icon">
          {isConnected ? '💬' : '🔴'}
        </span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <span className="admin-avatar">👨‍💼</span>
              <div className="chat-info">
                <h3>Gezsek Travel Desteği</h3>
                <span className={`status ${isConnected ? 'online' : 'offline'}`}>
                  {isConnected ? 'Çevrimiçi' : 'Bağlantı Kesildi'}
                </span>
              </div>
            </div>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages" ref={chatContainerRef}>
            {loading ? (
              <div className="loading-messages">
                <div className="loading-spinner"></div>
                <p>Mesajlar yükleniyor...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-icon">💬</div>
                <h4>Henüz mesaj yok</h4>
                <p>Merhaba! Size nasıl yardımcı olabilirim?</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div 
                    key={message._id}
                    className={`message ${message.isFromUser ? 'user' : 'admin'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{message.timeAgo}</div>
                    </div>
                    {message.isFromUser && (
                      <div className="message-status">
                        {message.status === 'read' ? '✓✓' : '✓'}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Yazıyor göstergesi */}
                {adminTyping && (
                  <div className="message admin typing">
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
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <div className="input-container">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Mesajınızı yazın..." : "Bağlantı kesildi..."}
                rows="1"
                disabled={sending || !isConnected}
              />
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending || !isConnected}
              >
                {sending ? (
                  <div className="sending-spinner"></div>
                ) : (
                  '📤'
                )}
              </button>
            </div>
            <div className="input-hint">
              {isConnected ? 'Enter tuşu ile gönder, Shift+Enter ile yeni satır' : 'Bağlantı yeniden kuruluyor...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat; 