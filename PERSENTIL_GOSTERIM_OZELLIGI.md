# Persentil Gösterim ve Seçim Özelliği

## Yapılan Değişiklikler

### 1. Persentil Tablosu Görünümü İyileştirildi
- Persentil referans tablosu daha belirgin ve görsel olarak çekici hale getirildi
- Başlık bölümü gradient arka plan ve büyük yazı tipiyle vurgulandı
- Kaynak, yaş ve cinsiyet bilgileri daha net gösteriliyor

### 2. Mevcut Persentil Değerleri Gösterimi
Çocuğun girilen boy ve kilo değerlerine göre:
- **Ağırlık Persentili**: Mavi kenarlı kartla gösteriliyor
- **Boy Persentili**: Yeşil kenarlı kartla gösteriliyor
- Her iki değer de büyük ve net bir şekilde görüntüleniyor
- Persentiller arası değerler için interpolasyon yapılıyor (örn: ~P45)

### 3. Persentil Seçim Sistemi
Kullanıcı hesaplamalar için hangi persentil değerini kullanmak istediğini seçebilir:

#### Seçenekler:
- **P3, P10, P25, P50, P75, P90, P97**: Referans tablodaki standart persentil değerleri
- **P50 (Önerilen)**: Varsayılan ve önerilen seçenek (yeşil vurgu)
- **Kendi Ağırlığı**: Girilen gerçek ağırlık değerini kullanır (turuncu vurgu)

#### Özellikler:
- Grid layout ile düzenli görünüm
- Her seçenek büyük, tıklanabilir butonlar
- Hover efekti ile görsel geri bildirim
- Seçim yapıldığında otomatik hesaplama
- Seçim kaydediliyor (localStorage)

### 4. Otomatik Hesaplama
- Persentil seçildiğinde tüm beslenme değerleri otomatik güncelleniyor:
  - BMR (Bazal Metabolizma Hızı)
  - Enerji İhtiyacı
  - Protein İhtiyacı
  - Fenilalanin İhtiyacı

### 5. Görsel Bildirimler
- Persentil değiştirildiğinde sağ üstte animasyonlu bildirim
- Yeşil gradient arka plan
- 4 saniye sonra otomatik kaybolma
- Slide-in/slide-out animasyonları

### 6. Varsayılan Davranış
- İlk hesaplamada otomatik olarak P50 seçiliyor
- Kullanıcı tercihi kaydediliyor ve sonraki hesaplamalarda kullanılıyor

## Kullanım Akışı

1. **Kişisel Bilgileri Gir**: Ad, doğum tarihi, boy, kilo, cinsiyet
2. **Kaynak Seç**: Manuel, Neyzi veya WHO
3. **Hesapla Butonuna Tıkla**
4. **Persentil Tablosunu Gör**: 
   - Yaşa uygun referans değerler
   - Çocuğun mevcut persentil değerleri (mavi ve yeşil kartlar)
5. **Persentil Seç**: 
   - Hesaplamalar için kullanılacak persentil değerini seç
   - P50 önerilen, "Kendi Ağırlığı" gerçek değeri kullanır
6. **Otomatik Güncelleme**: 
   - Seçilen persentile göre tüm değerler güncellenir
   - Bildirim mesajı görüntülenir

## Teknik Detaylar

### Dosyalar
- `js/calculations/daily-needs.js`: Ana hesaplama ve persentil mantığı
- `css/reference.css`: Persentil gösterimi için stiller

### Fonksiyonlar
- `displayReferenceValues()`: Persentil tablosunu ve seçim arayüzünü gösterir
- `calculateCurrentPercentiles()`: Çocuğun mevcut persentil değerlerini hesaplar
- `findPercentile()`: Bir değerin hangi persentile denk geldiğini bulur
- `updateDailyNeedsWithPercentile()`: Seçilen persentile göre hesaplamaları günceller
- `showPercentileNotification()`: Görsel bildirim gösterir

### Veri Saklama
- `localStorage.setItem('selectedPercentile', value)`: Seçilen persentil kaydedilir
- Sayfa yenilendiğinde son seçim hatırlanır

## Mobil Uyumluluk
- Responsive grid layout
- Mobilde tek sütun, masaüstünde çift sütun
- Touch-friendly buton boyutları
- Hover efektleri mobilde de çalışıyor

## Görsel Özellikler
- Gradient arka planlar
- Renkli kenarlıklar (mavi: ağırlık, yeşil: boy)
- Animasyonlu geçişler
- Box shadow efektleri
- İkonlar ve emoji kullanımı
