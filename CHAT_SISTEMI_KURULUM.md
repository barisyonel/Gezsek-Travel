# 🚀 Gerçek Zamanlı Chat Sistemi Kurulumu

Bu dokümanda, Gezsekk projesine entegre edilen gerçek zamanlı chat sisteminin kurulumu ve kullanımı açıklanmaktadır.

## 📋 Sistem Özellikleri

### ✅ Tamamlanan Özellikler
- **Socket.IO entegrasyonu** - Gerçek zamanlı mesajlaşma
- **JWT kimlik doğrulama** - Güvenli bağlantı
- **Kullanıcı-Admin chat** - İki yönlü iletişim
- **Yazıyor göstergesi** - Gerçek zamanlı durum bildirimi
- **Mesaj okundu bildirimi** - Çift tik sistemi
- **Bağlantı durumu** - Online/offline göstergesi
- **Responsive tasarım** - Mobil uyumlu
- **Admin paneli** - Mesaj yönetimi

### 🔧 Teknik Detaylar
- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React + Socket.IO Client
- **Veritabanı**: MongoDB (Message modeli)
- **Kimlik Doğrulama**: JWT tokens

## 🛠️ Kurulum Adımları

### 1. Backend Kurulumu

```bash
cd backend
npm install
```

### 2. Frontend Kurulumu

```bash
cd frontend
npm install
```

### 3. Veritabanı Kurulumu

```bash
cd backend
node seed.js
```

Bu komut admin kullanıcısını oluşturacak:
- **Email**: admin@gezsektravel.com
- **Şifre**: admin123

### 4. Sistem Başlatma

**Backend (Terminal 1):**
```bash
cd backend
npm start
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

## 🎯 Kullanım

### Kullanıcı Tarafı
1. Siteye giriş yapın
2. Sağ alt köşedeki chat butonuna tıklayın
3. Mesajınızı yazın ve gönderin
4. Admin'den gelen mesajları gerçek zamanlı görün

### Admin Tarafı
1. Admin paneline giriş yapın (/admin)
2. Sol menüden "Mesaj Yönetimi"ni seçin
3. Kullanıcılarla olan konuşmaları görün
4. Gerçek zamanlı mesajlaşma yapın

## 🔌 Socket.IO Events

### Kullanıcı Events
- `send_message` - Mesaj gönderme
- `mark_as_read` - Mesajları okundu işaretleme
- `typing` - Yazıyor durumu

### Server Events
- `user_connected` - Kullanıcı bağlandı
- `new_message` - Yeni mesaj geldi
- `message_sent` - Mesaj gönderildi
- `message_error` - Mesaj hatası
- `admin_typing` - Admin yazıyor
- `messages_read` - Mesajlar okundu

## 🎨 Özelleştirme

### CSS Stilleri
- `frontend/src/components/common/LiveChat.css` - Kullanıcı chat stilleri
- `frontend/src/components/admin/sections/MessageManagement.css` - Admin panel stilleri

### Konfigürasyon
- `backend/index.js` - Socket.IO ayarları
- `backend/routes/message.js` - Mesaj API'leri

## 🧪 Test

### Basit Test
```bash
# Test HTML dosyasını açın
open test-chat.html
```

### Manuel Test
1. İki farklı tarayıcıda siteyi açın
2. Birinde kullanıcı, diğerinde admin olarak giriş yapın
3. Chat sistemini test edin

## 🔧 Sorun Giderme

### Bağlantı Sorunları
1. Backend'in çalıştığından emin olun (port 5000)
2. Frontend'in çalıştığından emin olun (port 5173)
3. CORS ayarlarını kontrol edin

### Mesaj Gönderme Sorunları
1. JWT token'ın geçerli olduğundan emin olun
2. Admin kullanıcısının veritabanında olduğunu kontrol edin
3. Console'da hata mesajlarını kontrol edin

### Veritabanı Sorunları
1. MongoDB bağlantısını kontrol edin
2. Message modelinin doğru tanımlandığından emin olun
3. Seed dosyasını çalıştırın

## 📱 Mobil Uyumluluk

Chat sistemi tamamen responsive tasarlanmıştır:
- Mobil cihazlarda otomatik boyutlandırma
- Touch-friendly butonlar
- Mobil optimizasyonlu mesaj görünümü

## 🔒 Güvenlik

- JWT token doğrulaması
- Socket.IO middleware güvenliği
- Input validasyonu
- XSS koruması

## 🚀 Performans

- Mesajlar veritabanında saklanır
- Gerçek zamanlı güncelleme
- Otomatik bağlantı yenileme
- Mesaj geçmişi korunur

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console hatalarını kontrol edin
2. Network sekmesinde bağlantıları inceleyin
3. Socket.IO debug modunu aktifleştirin

---

**Not**: Bu sistem production ortamında kullanılmadan önce ek güvenlik önlemleri alınmalıdır. 