# Firebase Authentication Kurulum Talimatları

## ✅ Tamamlanan İşlemler

1. ✅ Firebase config dosyası oluşturuldu (`js/auth/firebase-config.js`)
2. ✅ Authentication manager eklendi (`js/auth/auth-manager.js`)
3. ✅ User data manager eklendi (`js/auth/user-data-manager.js`)
4. ✅ Login sayfası oluşturuldu (`login.html`)
5. ✅ Kayıt sayfası oluşturuldu (`register.html`)
6. ✅ Auth CSS stilleri eklendi (`css/auth.css`)
7. ✅ Ana uygulama auth kontrolü eklendi (`index.html`, `js/main.js`)

## 🔧 Firebase Console'da Yapılması Gerekenler

### 1. Firestore Güvenlik Kurallarını Güncelle

Firebase Console'da:
1. **Firestore Database** → **Rules** sekmesine git
2. Aşağıdaki kuralları yapıştır (veya `firestore.rules` dosyasındaki kuralları kullan):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's calculations subcollection
      match /calculations/{calculationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **Publish** butonuna tıkla

### 2. Authentication Domain'i Ekle (GitHub Pages için)

Firebase Console'da:
1. **Authentication** → **Settings** → **Authorized domains** sekmesine git
2. **Add domain** butonuna tıkla
3. GitHub Pages domain'ini ekle: `[kullaniciadi].github.io`
4. Kaydet

## 🚀 Özellikler

### Kullanıcı Yönetimi
- ✅ Email/şifre ile kayıt olma
- ✅ Giriş yapma
- ✅ Şifremi unuttum
- ✅ Otomatik giriş (remember me)
- ✅ Çıkış yapma
- ✅ Kullanıcı bilgilerini gösterme

### Veri Yönetimi
- ✅ Kullanıcı verilerini Firestore'da saklama
- ✅ Her kullanıcının kendi verileri
- ✅ Güvenli veri erişimi
- ✅ Çoklu cihaz senkronizasyonu

### Güvenlik
- ✅ Sadece giriş yapan kullanıcılar uygulamayı görebilir
- ✅ Her kullanıcı sadece kendi verilerine erişebilir
- ✅ Firebase güvenlik kuralları ile korunmuş

## 📝 Kullanım

### İlk Kullanıcı Kaydı
1. `register.html` sayfasına git
2. Ad soyad, email ve şifre gir
3. "Hesap Oluştur" butonuna tıkla
4. Otomatik olarak ana uygulamaya yönlendirileceksin

### Giriş Yapma
1. `login.html` sayfasına git
2. Email ve şifre gir
3. İsteğe bağlı "Beni hatırla" seçeneğini işaretle
4. "Giriş Yap" butonuna tıkla

### Şifre Sıfırlama
1. Login sayfasında "Şifremi unuttum" linkine tıkla
2. Email adresini gir
3. Email'ine gelen linke tıkla
4. Yeni şifre belirle

## 🔄 Veri Migrasyonu (İsteğe Bağlı)

Eğer localStorage'da mevcut veriler varsa, bunları Firestore'a taşıyabilirsiniz:

```javascript
// Browser console'da çalıştır
await userDataManager.migrateLocalStorageData();
```

## 🧪 Test

### Yerel Test
1. HTTP sunucusu başlat: `python -m http.server 8000`
2. Tarayıcıda aç: `http://localhost:8000/login.html`
3. Yeni hesap oluştur ve test et

### GitHub Pages Test
1. Kodu GitHub'a push et
2. GitHub Pages'i aktif et
3. `https://[kullaniciadi].github.io/[repo-adi]/login.html` adresine git
4. Test et

## 📊 Firestore Veri Yapısı

```
users/
  {userId}/
    email: string
    displayName: string
    createdAt: timestamp
    role: "dietitian"
    preferences: object
    
    calculations/
      {calculationId}/
        patientName: string
        birthDate: string
        weight: number
        height: number
        gender: string
        bmr: number
        energy: number
        protein: number
        phenylalanine: number
        createdAt: timestamp
        updatedAt: timestamp
```

## 🎯 Sonraki Adımlar

1. ✅ Firebase Console'da güvenlik kurallarını güncelle
2. ✅ GitHub Pages domain'ini authorized domains'e ekle
3. ✅ İlk kullanıcı hesabını oluştur ve test et
4. 🔜 Kullanıcı verilerini Firestore'a kaydetme entegrasyonu (history-viewer.js güncelleme)
5. 🔜 Çoklu hasta yönetimi özellikleri

## 💡 Notlar

- Firebase ücretsiz planı günde 10,000 kullanıcı için yeterli
- Firestore ücretsiz planı günde 50,000 okuma, 20,000 yazma içerir
- Veriler otomatik olarak yedeklenir
- Çoklu cihazdan aynı hesaba erişilebilir

## 🆘 Sorun Giderme

### "Firebase not defined" hatası
- Firebase SDK scriptlerinin doğru yüklendiğinden emin ol
- Network sekmesinde Firebase CDN'lerinin yüklendiğini kontrol et

### "Permission denied" hatası
- Firestore güvenlik kurallarının doğru ayarlandığından emin ol
- Kullanıcının giriş yaptığından emin ol

### Redirect loop
- Browser cache'i temizle
- Incognito/Private modda test et
