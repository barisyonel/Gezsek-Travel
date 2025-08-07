# 🌟 Gezsek Travel - Profesyonel Tur Rezervasyon ve Yönetim Sistemi

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Kullanıcı Rolleri](#-kullanıcı-rolleri)
- [Chat Sistemi](#-chat-sistemi)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## 🎯 Proje Hakkında

**Gezsek Travel**, modern web teknolojileri kullanılarak geliştirilmiş, tam özellikli bir tur rezervasyon ve yönetim sistemidir. Kullanıcıların tur arayıp rezervasyon yapabildiği, adminlerin tüm sistemi yönetebildiği ve gerçek zamanlı chat sistemi ile müşteri desteği sağlayabildiği kapsamlı bir platformdur.

### 🌍 Ana Hedefler
- **Kullanıcı Dostu Arayüz**: Modern ve responsive tasarım
- **Güvenli İşlemler**: JWT tabanlı kimlik doğrulama
- **Gerçek Zamanlı İletişim**: Socket.IO ile anlık mesajlaşma
- **Kapsamlı Yönetim**: Admin paneli ile tam kontrol
- **Ölçeklenebilir Mimari**: Mikroservis mimarisine uygun yapı

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Güvenlik
- **JWT Token Sistemi**: Güvenli oturum yönetimi
- **Şifre Hashleme**: bcrypt ile güvenli şifre saklama
- **Role-based Access Control**: Kullanıcı ve admin rolleri
- **Email Doğrulama**: Hesap aktivasyonu
- **Session Yönetimi**: Otomatik oturum yenileme

### 🎫 Tur Yönetimi
- **Tur Arama ve Filtreleme**: Gelişmiş arama algoritması
- **Kategori Yönetimi**: Tur kategorileri ve etiketleme
- **Konum Bazlı Arama**: Harita entegrasyonu
- **Fiyat Karşılaştırma**: Dinamik fiyatlandırma
- **Rezervasyon Sistemi**: Otomatik rezervasyon işlemleri
- **Instagram Tur Entegrasyonu**: Sosyal medya bağlantısı

### 💬 Gerçek Zamanlı Chat Sistemi
- **Anlık Mesajlaşma**: Socket.IO ile real-time iletişim
- **Kullanıcı-Admin Chat**: Müşteri destek sistemi
- **Mesaj Durumu Takibi**: Gönderildi, teslim edildi, okundu
- **Typing Indicators**: Yazıyor göstergesi
- **Mesaj Geçmişi**: Tüm konuşmaları saklama
- **Otomatik Temizleme**: Eski mesajları temizleme servisi

### 📊 Admin Panel Özellikleri
- **Dashboard Analytics**: Detaylı istatistikler
- **Kullanıcı Yönetimi**: Tam kullanıcı kontrolü
- **Tur Yönetimi**: CRUD işlemleri
- **Rezervasyon Takibi**: Rezervasyon durumları
- **Blog Yönetimi**: İçerik yönetim sistemi
- **Bildirim Sistemi**: Toplu bildirim gönderme
- **Rapor Sistemi**: Detaylı raporlama
- **Email Template Yönetimi**: Özelleştirilebilir email şablonları
- **Güvenlik Yönetimi**: Sistem güvenlik ayarları
- **Multi-language Support**: Çoklu dil desteği

### 📱 Kullanıcı Özellikleri
- **Profil Yönetimi**: Kişisel bilgi güncelleme
- **Rezervasyon Geçmişi**: Geçmiş rezervasyonları görüntüleme
- **Favoriler**: Beğenilen turları kaydetme
- **Değerlendirme Sistemi**: Tur yorumlama ve puanlama
- **Bildirim Tercihleri**: Kişiselleştirilebilir bildirimler
- **Live Chat**: Admin ile anlık iletişim

## 🛠 Teknoloji Stack

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.19+ | Web framework |
| **MongoDB** | 6+ | NoSQL veritabanı |
| **Mongoose** | 8+ | MongoDB ODM |
| **Socket.IO** | 4+ | Real-time iletişim |
| **JWT** | 9+ | Token tabanlı auth |
| **bcryptjs** | 2.4+ | Şifre hashleme |
| **Cloudinary** | 1.41+ | Medya yönetimi |
| **Nodemailer** | 6+ | Email servisi |
| **dotenv** | 16+ | Environment variables |
| **cors** | 2.8+ | Cross-origin resource sharing |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **React** | 18+ | UI framework |
| **Vite** | 5+ | Build tool |
| **React Router** | 6+ | Client-side routing |
| **Socket.IO Client** | 4+ | Real-time client |
| **CSS3** | - | Modern styling |
| **JavaScript ES6+** | - | Modern JavaScript |

### DevOps & Tools
| Teknoloji | Açıklama |
|-----------|----------|
| **npm** | Package manager |
| **Git** | Version control |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- MongoDB 6+
- npm veya yarn
- Git

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/yourusername/gezsek-travel.git
cd gezsek-travel
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

### 3. Environment Değişkenleri
Backend klasöründe `.env` dosyası oluşturun:
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/gezsekk
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_FROM=noreply@gezsektravel.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4. Test Kullanıcıları Oluşturun
```bash
cd backend
node create-test-user.js
```

### 5. Backend'i Başlatın
```bash
npm start
# veya development için
npm run dev
```

### 6. Frontend Kurulumu
```bash
cd ../frontend
npm install
npm run dev
```

### 7. Tarayıcıda Açın
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3000/admin-panel

## 🎮 Kullanım

### Test Hesapları
| Rol | Email | Şifre | Açıklama |
|-----|-------|-------|----------|
| **Admin** | admin@gezsektravel.com | admin123 | Tam yönetici erişimi |
| **User** | user@gezsektravel.com | user123 | Standart kullanıcı |

### Hızlı Başlangıç
1. **Kullanıcı Olarak**: Ana sayfada tur arayın, rezervasyon yapın, chat kullanın
2. **Admin Olarak**: Admin paneline giriş yapın, sistemi yönetin

## 📡 API Dokümantasyonu

### Authentication Endpoints
```http
POST /api/auth/register    # Kullanıcı kaydı
POST /api/auth/login       # Giriş yapma
GET  /api/auth/profile     # Profil bilgileri
PUT  /api/auth/profile     # Profil güncelleme
```

### Tour Endpoints
```http
GET    /api/tours          # Tüm turlar
GET    /api/tours/:id      # Tek tur detayı
POST   /api/tours          # Tur oluşturma (Admin)
PUT    /api/tours/:id      # Tur güncelleme (Admin)
DELETE /api/tours/:id      # Tur silme (Admin)
```

### Message Endpoints
```http
GET  /api/messages/conversation           # Kullanıcı mesajları
POST /api/messages/send                   # Mesaj gönderme
GET  /api/messages/admin/conversations    # Admin konuşmalar
POST /api/messages/admin/send            # Admin mesaj gönderme
```

### Admin Endpoints
```http
GET    /api/admin/users           # Kullanıcı listesi
GET    /api/admin/statistics      # Sistem istatistikleri
GET    /api/admin/reports         # Raporlar
POST   /api/admin/notifications   # Toplu bildirim
```

## 👥 Kullanıcı Rolleri

### 🔵 Normal Kullanıcı Yetkileri
- ✅ Tur arama ve görüntüleme
- ✅ Rezervasyon yapma ve iptal etme
- ✅ Profil yönetimi
- ✅ Rezervasyon geçmişi
- ✅ Admin ile chat yapma
- ✅ Tur değerlendirme ve yorum
- ✅ Favorilere ekleme
- ✅ Blog okuma
- ✅ Bildirim alma

### 🔴 Admin Yetkileri
- ✅ **Tüm kullanıcı yetkilerine ek olarak:**
- ✅ Kullanıcı yönetimi (CRUD)
- ✅ Tur yönetimi (CRUD)
- ✅ Rezervasyon yönetimi
- ✅ Blog yönetimi
- ✅ Instagram tur yönetimi
- ✅ Slider yönetimi
- ✅ Email template yönetimi
- ✅ Toplu bildirim gönderme
- ✅ Sistem istatistikleri
- ✅ Rapor görüntüleme
- ✅ Güvenlik ayarları
- ✅ Çoklu dil yönetimi
- ✅ Chat sistemi yönetimi
- ✅ Kullanıcı mesajlarını okuma ve yanıtlama

## 💬 Chat Sistemi Özellikleri

### Real-time Özellikler
- **Anlık Mesajlaşma**: Socket.IO ile 0 gecikme
- **Bağlantı Durumu**: Online/offline göstergeleri
- **Typing Indicators**: Karşı taraf yazıyor göstergesi
- **Message Status**: Gönderildi ✓, Teslim Edildi ✓✓, Okundu 👁️
- **Room Management**: Otomatik oda yönetimi

### Kullanıcı Chat Özellikleri
- **LiveChat Widget**: Sayfanın her yerinden erişim
- **Mesaj Geçmişi**: Tüm konuşma geçmişi
- **File Upload**: Dosya ve resim gönderme
- **Emoji Support**: Emoji desteği
- **Auto-scroll**: Otomatik mesaj kaydırma

### Admin Chat Özellikleri
- **Multi-user Support**: Birden fazla kullanıcı ile chat
- **Conversation List**: Tüm konuşmaları listeleme
- **Unread Counter**: Okunmamış mesaj sayacı
- **Quick Replies**: Hızlı yanıt şablonları
- **Message Analytics**: Mesaj istatistikleri

### Chat Mimarisi
```
┌─────────────────┐    Socket.IO    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│                 │                 │                 │
│ ┌─────────────┐ │                 │ ┌─────────────┐ │
│ │ LiveChat    │ │    Events:      │ │ Socket.IO   │ │
│ │ Component   │ │    - send_msg   │ │ Server      │ │
│ └─────────────┘ │    - new_msg    │ └─────────────┘ │
│                 │    - typing     │                 │
│ ┌─────────────┐ │    - read       │ ┌─────────────┐ │
│ │ Admin Chat  │ │                 │ │ Message     │ │
│ │ Management  │ │                 │ │ Model       │ │
│ └─────────────┘ │                 │ └─────────────┘ │
└─────────────────┘                 └─────────────────┘
```

## 📊 Veritabanı Şeması

### Ana Modeller
- **User**: Kullanıcı bilgileri ve kimlik doğrulama
- **Tour**: Tur detayları ve fiyatlandırma
- **Message**: Chat sistemi mesajları
- **Purchase**: Rezervasyon ve satın alma kayıtları
- **Blog**: Blog yazıları ve içerik yönetimi
- **InstagramTour**: Instagram entegrasyonu
- **Analytics**: Sistem kullanım istatistikleri
- **Notification**: Bildirim sistemi
- **Review**: Kullanıcı değerlendirmeleri
- **Language**: Çoklu dil desteği
- **EmailTemplate**: Email şablonları

### İlişkiler
```
User ──┬── Purchase (1:N)
       ├── Message (1:N)
       ├── Review (1:N)
       └── Notification (1:N)

Tour ──┬── Purchase (1:N)
       ├── Review (1:N)
       └── InstagramTour (1:1)

Message ── User (N:1)
```

## 🔧 Geliştirme

### Kod Yapısı
```
gezsekk/
├── backend/                 # Node.js Backend
│   ├── config/             # Konfigürasyon dosyaları
│   ├── middleware/         # Express middleware
│   ├── models/            # Mongoose modelleri
│   ├── routes/            # API route'ları
│   ├── services/          # Business logic
│   └── uploads/           # Yüklenen dosyalar
├── frontend/              # React Frontend
│   ├── public/           # Statik dosyalar
│   └── src/
│       ├── components/   # React bileşenleri
│       ├── context/      # React Context
│       ├── hooks/        # Custom hooks
│       └── services/     # API servisleri
└── docs/                 # Dokümantasyon
```

### Geliştirme Komutları
```bash
# Backend development
cd backend
npm run dev          # Development server with nodemon
npm start           # Production server
npm test            # Test suite

# Frontend development  
cd frontend
npm run dev         # Vite development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint check
```

## 🚀 Deployment

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend için PM2 kullanımı
npm install -g pm2
cd backend
pm2 start index.js --name "gezsek-api"
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gezsekk
JWT_SECRET=your_production_jwt_secret_very_long_and_secure
# ... diğer production ayarları
```

## 🔒 Güvenlik Özellikleri

### Implemented Security Measures
- **JWT Authentication**: Stateless token authentication
- **Password Hashing**: bcrypt ile güvenli şifre saklama
- **CORS Protection**: Cross-origin request kontrolü
- **Rate Limiting**: API rate limiting (gelecek güncelleme)
- **Input Validation**: Mongoose schema validation
- **XSS Protection**: Input sanitization
- **SQL Injection Prevention**: NoSQL injection koruması

### Best Practices
- Environment variables for sensitive data
- Secure HTTP headers
- Error handling without information disclosure
- Regular dependency updates
- Code review process

## 📈 Performans Optimizasyonları

### Backend Optimizations
- **Database Indexing**: MongoDB index optimizasyonu
- **Connection Pooling**: MongoDB connection pool
- **Caching Strategy**: Memory caching (Redis entegrasyonu planlanıyor)
- **Compression**: Response compression
- **Static File Serving**: Efficient static file delivery

### Frontend Optimizations
- **Code Splitting**: React lazy loading
- **Bundle Optimization**: Vite build optimizations
- **Image Optimization**: Cloudinary integration
- **Caching**: Browser caching strategies
- **Minification**: CSS ve JS minification

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Model ve utility testleri
- **Integration Tests**: API endpoint testleri  
- **E2E Tests**: Cypress ile end-to-end testler (planlanıyor)

### Test Commands
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend  
npm test
```

## 📱 Mobile Responsiveness

### Responsive Design Features
- **Mobile-first Approach**: Önce mobil tasarım
- **Flexible Grid System**: CSS Grid ve Flexbox
- **Touch-friendly Interface**: Mobil dokunmatik optimizasyonu
- **Performance Optimization**: Mobil performans optimizasyonu
- **Progressive Web App**: PWA özellikleri (gelecek güncelleme)

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## 🤝 Katkıda Bulunma

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
1. Clone your fork
2. Install dependencies
3. Create `.env` files
4. Start development servers
5. Make changes and test
6. Submit pull request

### Code Style
- ESLint configuration for JavaScript
- Prettier for code formatting
- Conventional commits
- Comprehensive documentation

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Complete user authentication system
- ✅ Tour management and booking system
- ✅ Real-time chat system with Socket.IO
- ✅ Comprehensive admin panel
- ✅ Blog management system
- ✅ Instagram integration
- ✅ Multi-language support foundation
- ✅ Email notification system
- ✅ Analytics and reporting
- ✅ File upload with Cloudinary

### Planned Features (v1.1.0)
- 🔄 Payment gateway integration
- 🔄 Advanced search filters
- 🔄 Mobile app development
- 🔄 Redis caching implementation
- 🔄 Advanced analytics dashboard
- 🔄 Push notifications
- 🔄 Social media login
- 🔄 API rate limiting
- 🔄 Automated testing suite

## 🐛 Known Issues

### Current Issues
- Tour image upload optimization needed
- Chat system room management can be improved
- Email template editor needs enhancement

### Bug Reports
Please report bugs by creating an issue with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 📞 Support

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Create a GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: contact@gezsektravel.com

### FAQ
**Q: How do I reset the admin password?**
A: Run the `create-test-user.js` script again or update directly in MongoDB.

**Q: Can I customize the chat widget?**
A: Yes, modify the `LiveChat.jsx` component and its CSS.

**Q: How do I add new languages?**
A: Add language entries to the Language model and update frontend translations.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Express.js** for the robust backend framework
- **Socket.IO** for real-time communication
- **MongoDB** for the flexible database
- **Cloudinary** for media management
- **All contributors** who helped improve this project

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Components**: 50+ React components
- **API Endpoints**: 40+ REST endpoints
- **Database Models**: 12 Mongoose models
- **Features**: 30+ major features
- **Development Time**: 3+ months
- **Technologies Used**: 20+ different technologies

---

<div align="center">

### 🌟 Star this repository if you found it helpful!

**Made with ❤️ by the Gezsek Travel Team**

[🔗 Live Demo](https://gezsek-travel.com) | [📧 Contact](mailto:contact@gezsektravel.com) | [🐛 Report Bug](https://github.com/yourusername/gezsek-travel/issues)

</div>