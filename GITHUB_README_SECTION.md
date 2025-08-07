# 🌟 Gezsek Travel - Professional Travel Booking & Management System

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🚀 Overview

**Gezsek Travel** is a comprehensive, full-stack travel booking and management platform built with modern web technologies. It features a powerful admin panel, real-time chat system, secure authentication, and a responsive user interface for seamless travel experience management.

### ✨ Key Features

🎫 **Tour Management** - Complete CRUD operations for tours with advanced filtering  
💬 **Real-time Chat** - Socket.IO powered instant messaging between users and admins  
🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing  
👑 **Admin Dashboard** - Comprehensive management panel with analytics  
📱 **Responsive Design** - Mobile-first approach with modern UI/UX  
📊 **Analytics & Reports** - Detailed system statistics and user insights  
🔔 **Notification System** - Real-time notifications and alerts  
📝 **Blog Management** - Content management system for travel blogs  

## 🛠 Tech Stack

**Backend:**
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.IO** - Real-time communication
- **JWT** + **bcryptjs** - Authentication & security
- **Cloudinary** - Media management

**Frontend:**
- **React 18** + **Hooks** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time features
- **Modern CSS3** - Responsive styling

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gezsek-travel.git
cd gezsek-travel
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
node create-test-user.js  # Create test users
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3000/admin-panel

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@gezsektravel.com | admin123 |
| **User** | user@gezsektravel.com | user123 |

## 🎯 Features in Detail

### 👤 User Features
- ✅ Browse and search tours with advanced filters
- ✅ Secure user registration and authentication
- ✅ Real-time chat with admin support
- ✅ Booking management and history
- ✅ Profile management
- ✅ Tour reviews and ratings
- ✅ Notification preferences

### 👑 Admin Features
- ✅ **User Management** - Complete user CRUD operations
- ✅ **Tour Management** - Create, edit, delete tours
- ✅ **Booking Management** - Track and manage reservations
- ✅ **Chat Management** - Handle multiple user conversations
- ✅ **Blog Management** - Content creation and editing
- ✅ **Analytics Dashboard** - System statistics and insights
- ✅ **Notification System** - Send bulk notifications
- ✅ **Report Generation** - Detailed system reports

### 💬 Real-time Chat System
- **Instant Messaging** - Zero-latency communication
- **Message Status** - Sent ✓, Delivered ✓✓, Read 👁️
- **Typing Indicators** - Real-time typing status
- **Message History** - Persistent conversation storage
- **Multi-user Support** - Admin can handle multiple chats
- **Auto-cleanup** - Scheduled message cleanup service

## 🏗 Architecture

```
┌─────────────────┐    HTTP/WS     ┌─────────────────┐    MongoDB    ┌─────────────┐
│   React Client  │◄──────────────►│  Express Server │◄─────────────►│  Database   │
│                 │                 │                 │               │             │
│ • Components    │   Socket.IO     │ • REST API      │   Mongoose    │ • Users     │
│ • Context API   │   JWT Auth      │ • Socket.IO     │   Aggregation │ • Tours     │
│ • Hooks         │   CORS          │ • Middleware    │   Indexing    │ • Messages  │
│ • Routing       │                 │ • Services      │               │ • Analytics │
└─────────────────┘                 └─────────────────┘               └─────────────┘
```

## 📡 API Documentation

The API provides 40+ endpoints covering:

- **Authentication** - Register, login, profile management
- **Tours** - CRUD operations with advanced filtering
- **Messages** - Real-time chat functionality
- **Admin** - User management, analytics, reports
- **Blog** - Content management
- **Notifications** - Alert system

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Password Hashing** - bcrypt with 12 rounds
- **Input Validation** - Mongoose schema validation
- **CORS Protection** - Cross-origin request security
- **Error Handling** - Secure error messages
- **Environment Variables** - Sensitive data protection

## 📊 Project Statistics

| Metric | Value |
|--------|--------|
| **Total Code Lines** | 15,000+ |
| **React Components** | 50+ |
| **API Endpoints** | 40+ |
| **Database Models** | 12 |
| **Major Features** | 30+ |
| **Technologies Used** | 20+ |

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend && npm run build

# Backend with PM2
npm install -g pm2
cd backend && pm2 start index.js --name "gezsek-api"
```

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
# ... other production variables
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.IO for real-time functionality
- MongoDB for flexible data storage
- All open source contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gezsek-travel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gezsek-travel/discussions)
- **Email**: contact@gezsektravel.com

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ for the travel community**

[🔗 Live Demo](https://gezsek-travel.com) • [📚 Documentation](API_DOCUMENTATION.md) • [🐛 Report Bug](https://github.com/yourusername/gezsek-travel/issues/new)

</div>