# Yeni Persentil Gösterim ve Seçim Akışı

## 🎯 Amaç
Diyetisyenin hesaplama yapmadan önce hem WHO hem de Neyzi persentil tablolarını görmesini ve karşılaştırmasını sağlamak.

## 📋 Kullanım Akışı

### 1. Kişisel Bilgileri Gir
Kullanıcı aşağıdaki bilgileri girer:
- Ad Soyad
- Doğum Tarihi
- Boy (cm)
- Kilo (kg)
- Cinsiyet

### 2. Otomatik Persentil Gösterimi
Tüm bilgiler girildikten sonra **otomatik olarak** ekranda görünür:

#### 📊 Persentil Karşılaştırması Bölümü
- **Sol Taraf**: WHO (Dünya Sağlık Örgütü) persentil tablosu
  - Mavi kenarlı
  - Yaş, ağırlık ve boy persentil değerleri
  - P3, P10, P25, P50, P75, P90, P97 sütunları
  - Çocuğun mevcut persentili gösteriliyor (örn: ~P45)

- **Sağ Taraf**: Neyzi (Türkiye Referansı) persentil tablosu
  - Turuncu kenarlı
  - Aynı format
  - Türk çocuklarına özel değerler

### 3. Kaynak ve Persentil Seçimi
Persentil tablolarının altında:

#### 📚 Kaynak Seçimi
İki büyük buton:
- 🌍 **WHO** (Dünya Sağlık Örgütü)
- 🇹🇷 **Neyzi** (Türkiye Referansı)

Diyetisyen yukarıdaki tabloları karşılaştırıp hangisini kullanmak istediğini seçer.

#### 📊 Persentil Seçimi
8 seçenek:
- **P3, P10, P25, P50, P75, P90, P97**: Referans tablodaki standart değerler
- **P50 (Önerilen)**: Varsayılan seçenek, yeşil vurgu
- **Kendi Ağırlığı**: Girilen gerçek ağırlık, turuncu vurgu

### 4. Hesapla Butonuna Bas
Seçimler yapıldıktan sonra "Hesapla" butonuna basılır.

### 5. Sonuçlar
Seçilen kaynak ve persentile göre hesaplanır:
- BMR (Bazal Metabolizma Hızı)
- Enerji İhtiyacı
- Protein İhtiyacı
- Fenilalanin İhtiyacı

## 🔄 Otomatik Güncelleme
Kişisel bilgilerden herhangi biri değiştirildiğinde:
- Persentil tabloları otomatik güncellenir
- Yeni yaş/boy/kilo değerlerine göre persentiller yeniden hesaplanır
- Diyetisyen güncel verileri görür

## 💾 Kayıt Sistemi
- Seçilen kaynak (WHO/Neyzi) kaydedilir
- Seçilen persentil kaydedilir
- Sonraki kullanımda aynı seçimler hatırlanır

## 🎨 Görsel Özellikler

### Persentil Tabloları
- Yan yana grid layout (mobilde alt alta)
- Renkli kenarlıklar (WHO: mavi, Neyzi: turuncu)
- Gradient başlıklar
- P50 sütunu yeşil vurgu
- Mevcut persentil değerleri kalın yazı

### Seçim Butonları
- Büyük, tıklanabilir
- Hover efekti (büyüme animasyonu)
- Seçili olanlar renkli arka plan
- Responsive tasarım

### Bilgi Kutusu
- Mavi kenarlı bilgi kutusu
- Seçim hakkında açıklamalar
- İkonlar ve emoji kullanımı

## 📱 Mobil Uyumluluk
- Tablolar mobilde alt alta dizilir
- Butonlar touch-friendly boyutta
- Yazı boyutları responsive
- Kaydırma desteği

## 🔧 Teknik Detaylar

### Dosyalar
- `js/ui/user-input.js`: Otomatik persentil gösterimi
- `js/calculations/daily-needs.js`: Hesaplama mantığı
- `css/reference.css`: Stil tanımları

### Fonksiyonlar
- `updatePercentilePreview()`: Bilgi değiştiğinde çağrılır
- `displayBothPercentileTables()`: Her iki tabloyu gösterir
- `getPercentileData()`: Kaynak için persentil verisi alır
- `generatePercentileTable()`: Tablo HTML'i oluşturur
- `generatePercentileSelectionSection()`: Seçim arayüzü oluşturur
- `addPercentileSelectionListeners()`: Event listener'ları ekler

### Veri Akışı
1. Kullanıcı bilgi girer → `updatePercentilePreview()`
2. Tüm alanlar doluysa → `displayBothPercentileTables()`
3. WHO ve Neyzi verileri alınır → `getPercentileData()`
4. Tablolar oluşturulur → `generatePercentileTable()`
5. Seçim arayüzü eklenir → `generatePercentileSelectionSection()`
6. Event listener'lar bağlanır → `addPercentileSelectionListeners()`
7. Hesapla butonuna basılır → `updateDailyNeeds()`
8. Seçilen kaynak ve persentil kullanılır

## 🎯 Avantajlar

### Diyetisyen İçin
- Her iki kaynağı da görebilir
- Karşılaştırma yapabilir
- Bilinçli seçim yapabilir
- Çocuğun mevcut durumunu net görür

### Kullanım Kolaylığı
- Tek ekranda tüm bilgi
- Hesaplamadan önce karar verme
- Görsel ve anlaşılır
- Hızlı karşılaştırma

### Esneklik
- İstediği kaynağı seçebilir
- İstediği persentili kullanabilir
- Kendi ağırlığı seçeneği
- Seçimler kaydedilir

## 📝 Örnek Senaryo

1. Diyetisyen hasta bilgilerini girer:
   - Ahmet, 5 yaşında, 110 cm, 18 kg, Erkek

2. Ekranda otomatik görünür:
   - WHO tablosu: Ağırlık ~P35, Boy ~P40
   - Neyzi tablosu: Ağırlık ~P30, Boy ~P38

3. Diyetisyen karşılaştırır:
   - WHO değerleri biraz daha yüksek
   - Neyzi Türk çocuklarına özel
   - Neyzi'yi seçmeye karar verir

4. Persentil seçer:
   - P50 önerilen ama çocuk düşük
   - P25 veya P30 daha uygun
   - P25'i seçer

5. Hesapla butonuna basar

6. Sonuçlar:
   - Neyzi P25 referans ağırlığına göre
   - Tüm değerler hesaplanır
   - Tooltip'lerde hangi değer kullanıldığı gösterilir

## 🚀 Gelecek İyileştirmeler
- Persentil grafikleri
- Büyüme eğrisi gösterimi
- Geçmiş persentil karşılaştırması
- PDF'e persentil tabloları ekleme
- Persentil değişim takibi
