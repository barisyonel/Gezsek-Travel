# 🎛️ Admin Panel - Kullanıcı Yönetimi

## 📋 Mevcut Özellikler

### ✅ **Kullanıcı Listeleme**
- Tüm kullanıcıları tablo halinde görüntüleme
- Kullanıcı bilgileri: Ad, Email, Telefon, Durum, Rol, Kayıt Tarihi
- Filtreleme özellikleri:
  - Arama (ad veya email ile)
  - Durum filtresi (Doğrulanmış/Doğrulanmamış)
  - Rol filtresi (Admin/Kullanıcı)

### ✅ **Yeni Kullanıcı Ekleme**
- **"➕ Yeni Kullanıcı"** butonu ile modal açma
- Gerekli alanlar:
  - Ad Soyad *
  - Email *
  - Telefon
  - Şifre *
  - Doğum Tarihi
  - Cinsiyet
  - Admin Yetkisi (checkbox)

### ✅ **Kullanıcı Düzenleme**
- **"✏️"** butonu ile düzenleme modal'ı açma
- Düzenlenebilir alanlar:
  - Ad Soyad
  - Email
  - Telefon
  - Hesap Doğrulandı (checkbox)
  - Admin Yetkisi (checkbox)

### ✅ **Kullanıcı Silme**
- **"🗑️"** butonu ile silme işlemi
- Onay dialog'u ile güvenlik
- Admin kendini silemez

## 🔧 Teknik Detaylar

### **Frontend Component'leri:**
- `UserManagement.jsx` - Ana kullanıcı yönetimi sayfası
- `UserModal.jsx` - Kullanıcı ekleme/düzenleme modal'ı
- `useUserManagement.js` - Kullanıcı işlemleri hook'u

### **Backend Endpoint'leri:**
- `POST /api/auth/admin/users` - Yeni kullanıcı ekleme
- `GET /api/auth/admin/users` - Tüm kullanıcıları listeleme
- `PUT /api/auth/admin/users/:userId` - Kullanıcı güncelleme
- `DELETE /api/auth/admin/users/:userId` - Kullanıcı silme

### **Güvenlik Özellikleri:**
- Admin yetkisi kontrolü
- Kendini silme koruması
- Email benzersizlik kontrolü
- Şifre hash'leme

## 🎯 Kullanım Talimatları

### **1. Kullanıcı Ekleme:**
1. Admin paneline giriş yapın
2. "Kullanıcılar" sekmesine tıklayın
3. "➕ Yeni Kullanıcı" butonuna tıklayın
4. Gerekli bilgileri doldurun
5. "Kullanıcı Ekle" butonuna tıklayın

### **2. Kullanıcı Düzenleme:**
1. Kullanıcı listesinde "✏️" butonuna tıklayın
2. Modal'da bilgileri güncelleyin
3. "Güncelle" butonuna tıklayın

### **3. Kullanıcı Silme:**
1. Kullanıcı listesinde "🗑️" butonuna tıklayın
2. Onay dialog'unda "Tamam"a tıklayın

### **4. Filtreleme:**
1. Arama kutusuna ad veya email yazın
2. Durum dropdown'ından seçim yapın
3. Rol dropdown'ından seçim yapın

## 🚀 Gelecek Özellikler

- [ ] Toplu kullanıcı işlemleri
- [ ] Kullanıcı aktivite logları
- [ ] Gelişmiş filtreleme seçenekleri
- [ ] Kullanıcı istatistikleri
- [ ] Email bildirimleri
- [ ] Kullanıcı profil fotoğrafı
- [ ] İki faktörlü doğrulama yönetimi

## 🔍 Sorun Giderme

### **Yaygın Sorunlar:**

1. **"Admin yetkisi gerekli" hatası:**
   - Kullanıcının `isAdmin: true` olduğundan emin olun

2. **"Bu email adresi zaten kullanılıyor" hatası:**
   - Farklı bir email adresi kullanın

3. **"Kendinizi silemezsiniz" hatası:**
   - Admin kendini silemez, başka bir admin kullanın

4. **Modal açılmıyor:**
   - JavaScript console'da hata olup olmadığını kontrol edin

### **Debug İpuçları:**
- Browser Developer Tools'u açın
- Network sekmesinde API çağrılarını kontrol edin
- Console'da hata mesajlarını kontrol edin
- LocalStorage'da token'ın geçerli olduğunu kontrol edin 