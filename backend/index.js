require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const errorHandler = require('./middleware/errorHandler');
const cleanupService = require('./services/cleanupService');

const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tour');
const blogRoutes = require('./routes/blog');
const instagramTourRoutes = require('./routes/instagramTour');
const messageRoutes = require('./routes/message');
const notificationRoutes = require('./routes/notification');
const reportRoutes = require('./routes/report');
const dashboardRoutes = require('./routes/dashboard');
const emailTemplateRoutes = require('./routes/emailTemplate');
const searchRoutes = require('./routes/search');
const languageRoutes = require('./routes/language');
const securityRoutes = require('./routes/security');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// CORS ayarları - Önce CORS'u ayarla
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Socket.IO kurulumu - CORS ile uyumlu
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(express.json());

// Static dosya servisi
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Socket.IO bağlantı yönetimi
const connectedUsers = new Map(); // userId -> socket
const connectedAdmins = new Map(); // adminId -> socket

// Socket.IO middleware - JWT doğrulama
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gezsekk_default_secret');
    socket.userId = decoded.userId;
    socket.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO bağlantı olayları
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (Admin: ${socket.isAdmin})`);

  if (socket.isAdmin) {
    // Admin bağlandı
    connectedAdmins.set(socket.userId, socket);
    socket.join('admins'); // Admin room'una katıl
    console.log(`Admin connected: ${socket.userId}`);
    
    // Admin'e bağlı kullanıcıları bildir
    socket.emit('admin_connected', { message: 'Admin paneli bağlandı' });
  } else {
    // Kullanıcı bağlandı
    connectedUsers.set(socket.userId, socket);
    socket.join(`user_${socket.userId}`); // Kullanıcı-specific room'a katıl
    console.log(`User connected: ${socket.userId}`);
    
    // Kullanıcıya bağlantı onayı gönder
    socket.emit('user_connected', { message: 'Chat bağlantısı kuruldu' });
    
    // Tüm admin'lere yeni kullanıcı bildirimi gönder
    connectedAdmins.forEach((adminSocket) => {
      adminSocket.emit('user_online', { userId: socket.userId });
    });
  }

  // Mesaj gönderme olayı
  socket.on('send_message', async (data) => {
    try {
      const { content, receiverId } = data;
      
      // Mesajı veritabanına kaydet
      const Message = require('./models/Message');
      const User = require('./models/User');
      
      let receiver;
      if (socket.isAdmin) {
        // Admin kullanıcıya mesaj gönderiyor
        receiver = await User.findById(receiverId);
      } else {
        // Kullanıcı admin'e mesaj gönderiyor
        receiver = await User.findOne({ email: 'admin@gezsektravel.com' });
      }
      
      if (!receiver) {
        socket.emit('message_error', { message: 'Alıcı bulunamadı' });
        return;
      }

      const messageData = {
        sender: socket.userId,
        receiver: receiver._id,
        content: content.trim(),
        messageType: 'text',
        isFromUser: !socket.isAdmin,
        isFromAdmin: socket.isAdmin,
        status: 'sent',
        conversationId: Message.createConversationId(socket.userId, receiver._id)
      };

      const message = new Message(messageData);
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email avatar')
        .populate('receiver', 'name email avatar');

      // Mesajı gönderen kişiye onay gönder
      socket.emit('message_sent', { message: populatedMessage });

      // Mesajı alıcıya gönder
      if (socket.isAdmin) {
        // Admin'den kullanıcıya
        const userSocket = connectedUsers.get(receiverId);
        if (userSocket) {
          userSocket.emit('new_message', { message: populatedMessage });
        }
      } else {
        // Kullanıcıdan admin'e
        connectedAdmins.forEach((adminSocket) => {
          adminSocket.emit('new_message', { 
            message: populatedMessage,
            userId: socket.userId 
          });
        });
      }

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', { message: 'Mesaj gönderilemedi' });
    }
  });

  // Mesaj okundu olayı
  socket.on('mark_as_read', async (data) => {
    try {
      const { messageIds } = data;
      
      const Message = require('./models/Message');
      
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          receiver: socket.userId,
          isDeleted: false
        },
        {
          status: 'read',
          readAt: new Date()
        }
      );

      // Karşı tarafa okundu bildirimi gönder
      if (socket.isAdmin) {
        // Admin mesajları okudu, kullanıcıya bildir
        connectedUsers.forEach((userSocket) => {
          userSocket.emit('messages_read', { messageIds });
        });
      } else {
        // Kullanıcı mesajları okudu, admin'e bildir
        connectedAdmins.forEach((adminSocket) => {
          adminSocket.emit('messages_read', { 
            messageIds,
            userId: socket.userId 
          });
        });
      }

    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // Yazıyor olayı
  socket.on('typing', (data) => {
    const { isTyping } = data;
    
    if (socket.isAdmin) {
      // Admin yazıyor, kullanıcıya bildir
      const userSocket = connectedUsers.get(data.userId);
      if (userSocket) {
        userSocket.emit('admin_typing', { isTyping });
      }
    } else {
      // Kullanıcı yazıyor, admin'e bildir
      connectedAdmins.forEach((adminSocket) => {
        adminSocket.emit('user_typing', { 
          isTyping,
          userId: socket.userId 
        });
      });
    }
  });

  // Bağlantı kesme olayı
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    if (socket.isAdmin) {
      connectedAdmins.delete(socket.userId);
      socket.leave('admins'); // Admin room'undan çık
      console.log(`Admin disconnected: ${socket.userId}`);
    } else {
      connectedUsers.delete(socket.userId);
      socket.leave(`user_${socket.userId}`); // Kullanıcı room'undan çık
      console.log(`User disconnected: ${socket.userId}`);
      
      // Admin'lere kullanıcının çevrimdışı olduğunu bildir
      connectedAdmins.forEach((adminSocket) => {
        adminSocket.emit('user_offline', { userId: socket.userId });
      });
    }
  });
});

// Socket.IO'yu global olarak erişilebilir yap
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/instagram-tours', instagramTourRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Gezsekk API Çalışıyor!');
});

// Error handling middleware (en son)
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gezsekk', {
  // Deprecated options kaldırıldı
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
  
  // Cleanup servisini başlat
  cleanupService.startCleanupJob();
  
  server.listen(process.env.PORT || 5000, () => {
    console.log(`API http://localhost:${process.env.PORT || 5000} üzerinde çalışıyor`);
    console.log(`Socket.IO aktif - Gerçek zamanlı chat sistemi hazır`);
  });
}).catch(err => {
  console.error('MongoDB bağlantı hatası:', err);
  console.log('Lütfen .env dosyasındaki MONGO_URI değerini kontrol edin');
}); 