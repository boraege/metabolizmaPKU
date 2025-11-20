# 👥 Hasta Takip Sistemi

## Genel Bakış

Diyetisyenlerin hastalarını kaydetmesini, ölçümlerini takip etmesini ve gelişimlerini izlemesini sağlayan kapsamlı bir hasta yönetim sistemi.

## Özellikler

### 1. Hasta Yönetimi
- ✅ Yeni hasta ekleme (ad, soyad, doğum tarihi, cinsiyet)
- ✅ Hasta listesini görüntüleme
- ✅ Hasta arama
- ✅ Hasta silme

### 2. Ölçüm Takibi
- ✅ Her hasta için çoklu ölçüm kaydı
- ✅ Tarih, boy, kilo bilgileri
- ✅ Hesaplanan değerler (BMR, enerji, protein, fenilalanin)
- ✅ Persentil değerleri
- ✅ Günlük besin alımı
- ✅ Öğün planı

### 3. Gelişim Grafikleri
- ✅ Boy gelişim grafiği (Chart.js)
- ✅ Kilo gelişim grafiği (Chart.js)
- ✅ Zaman içinde değişim takibi

### 4. Entegrasyon
- ✅ Hesaplama sayfasından direkt hasta kaydı
- ✅ Mevcut hasta için yeni ölçüm ekleme
- ✅ Hasta detaylarından hesaplama sayfasına geçiş

## Kullanım Akışı

### Yeni Hasta Ekleme
1. Ana sayfada "👥 Hastalarım" butonuna tıklayın
2. "Yeni Hasta Ekle" butonuna tıklayın
3. Hasta bilgilerini girin (ad, doğum tarihi, cinsiyet)
4. "Kaydet" butonuna tıklayın

### Ölçüm Ekleme - Yöntem 1 (Hasta Listesinden)
1. Hasta listesinde hastanın kartındaki "➕" butonuna tıklayın
2. Hesaplama sayfası açılır, hasta bilgileri otomatik doldurulur
3. Sadece boy ve kilo bilgilerini girin
4. Hesaplama yapın
5. "💾 Hastaya Kaydet" butonuna tıklayın

### Ölçüm Ekleme - Yöntem 2 (Hesaplama Sayfasından)
1. Hesaplama sayfasında hasta bilgilerini girin
2. Boy, kilo ve diğer bilgileri girin
3. Hesaplama yapın
4. "💾 Hastaya Kaydet" butonuna tıklayın
5. Yeni hasta ise otomatik oluşturulur

### Hasta Detaylarını Görüntüleme
1. Hasta listesinde hastanın kartındaki "📊" butonuna tıklayın
2. Hasta bilgileri, tüm ölçümler ve grafikler görüntülenir
3. Geçmiş ölçümleri karşılaştırabilirsiniz

## Veri Yapısı

```
Firestore:
users/{userId}/
  ├── patients/{patientId}/
  │     ├── id: string
  │     ├── name: string
  │     ├── birthDate: string
  │     ├── gender: "male" | "female"
  │     ├── createdAt: timestamp
  │     ├── updatedAt: timestamp
  │     ├── lastMeasurement: {
  │     │     date: string
  │     │     height: number
  │     │     weight: number
  │     │   }
  │     └── measurements/{measurementId}/
  │           ├── id: string
  │           ├── date: string (ISO)
  │           ├── height: number (cm)
  │           ├── weight: number (kg)
  │           ├── percentileSource: "manual" | "neyzi" | "who"
  │           ├── percentileData: object
  │           ├── calculations: {
  │           │     bmr: number
  │           │     energyRef: number
  │           │     energyPractical: number
  │           │     protein: number
  │           │     phe: number
  │           │   }
  │           ├── dailyIntake: array
  │           ├── mealPlan: array
  │           └── createdAt: timestamp
```

## Dosya Yapısı

### HTML Sayfaları
- `patients.html` - Hasta listesi sayfası
- `patient-detail.html` - Hasta detay ve grafik sayfası
- `app.html` - Hesaplama sayfası (güncellenmiş)

### JavaScript Modülleri
- `js/patients/patient-manager.js` - Hasta veri yönetimi (CRUD işlemleri)
- `js/patients/patients-ui.js` - Hasta listesi UI mantığı
- `js/patients/patient-detail-ui.js` - Hasta detay sayfası UI mantığı
- `js/patients/save-to-patient.js` - Hesaplama sayfasından kaydetme mantığı

### CSS Dosyaları
- `css/patients.css` - Hasta listesi stilleri
- `css/patient-detail.css` - Hasta detay sayfası stilleri
- `css/main.css` - Genel stiller (güncellenmiş)

## Güvenlik

Firestore güvenlik kuralları güncellendi:
- Her kullanıcı sadece kendi hastalarını görebilir
- Her kullanıcı sadece kendi hastalarının ölçümlerini görebilir
- Tüm işlemler kimlik doğrulaması gerektirir

## Gelecek Geliştirmeler

- [ ] Hasta bilgilerini düzenleme
- [ ] Ölçüm detaylarını modal'da görüntüleme
- [ ] Persentil grafiklerini ekleme
- [ ] Hasta notları ekleme
- [ ] Toplu hasta dışa aktarma
- [ ] Hasta raporları (PDF)
- [ ] Hasta karşılaştırma
- [ ] Hedef belirleme ve takip

## Notlar

- Chart.js kütüphanesi CDN üzerinden yüklenir
- Tüm tarihler ISO 8601 formatında saklanır
- Grafikler responsive tasarıma sahiptir
- Bildirimler otomatik olarak 3 saniye sonra kaybolur
