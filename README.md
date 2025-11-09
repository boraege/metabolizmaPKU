# Metabolizma Hesaplayıcı Web Uygulaması

Modern, modüler bir metabolizma ve beslenme hesaplama web uygulaması.

## 🆕 Yeni: WHO Persentil Veri Entegrasyonu

**Tam WHO persentil verileri entegre edildi!**
- ✅ 1,856 günlük veri (0-5 yaş)
- ✅ Erkek ve kız çocuk için ayrı veriler
- ✅ 15 farklı persentil değeri (P01-P999)
- ✅ L, M, S parametreleri
- 📄 Detaylar: [WHO_DATA_INTEGRATION.md](WHO_DATA_INTEGRATION.md)
- 🧪 Test: [test-who-data.html](test-who-data.html)

## Özellikler

### ✅ Tamamlanan Özellikler

1. **Kişisel Bilgiler Girişi**
   - Ad Soyad, Doğum Tarihi, Boy, Kilo, Cinsiyet
   - Otomatik yaş hesaplama (Yıl, Ay, Gün formatında)

2. **Persentil Kaynağı Seçimi**
   - Manuel hesaplama
   - Neyzi referansı (Türk çocukları için)
   - WHO referansı (Uluslararası standart)

3. **Günlük İhtiyaç Hesaplamaları**
   - BMR (Bazal Metabolizma Hızı)
   - Enerji ihtiyacı (Referans ve Pratik)
   - Protein ihtiyacı
   - Fenilalanin ihtiyacı

4. **Besin Değişim Listesi** 🆕
   - Besin grupları için önerilen porsiyon sayıları
   - Her grup için örnek porsiyonlar
   - Görsel kategori ayırımı

5. **Besin Seçimi ve Takibi**
   - 3 kategori: Ekmek/Tahıl, Sebzeler, Meyveler
   - Sürükle-bırak özelliği
   - Miktar ayarlama (+/- butonları)
   - Gerçek zamanlı toplam hesaplama
   - İlerleme çubukları (hedef karşılaştırması)

6. **Görsel Grafikler** 🆕
   - **Enerji Dağılımı Grafiği**: Besin kategorilerine göre enerji dağılımı (pasta grafiği)
   - **Makro Besin Grafiği**: Enerji, protein ve fenilalanin hedef karşılaştırması (çubuk grafik)
   - Canvas tabanlı, gerçek zamanlı güncellenen grafikler

7. **Öğün Planlaması**
   - 6 standart öğün (Sabah, Kuşluk, Öğle, İkindi, Akşam, Gece)
   - Öğün ekleme/silme/düzenleme
   - Öğünler arası yeni öğün ekleme
   - Besinleri öğünlere dağıtma
   - Öğün bazında toplam hesaplama
   - **Öğün Dağılım Grafiği** 🆕: Öğünlere göre enerji dağılımı

8. **PDF Rapor Oluşturma**
   - Tüm bilgileri içeren yazdırılabilir rapor
   - Kişisel bilgiler
   - Günlük ihtiyaçlar
   - **Besin değişim listesi** 🆕
   - **Öğün dağılım özeti** 🆕
   - Besin listesi
   - Detaylı öğün planı

## Dosya Yapısı

```
metabolizma/
├── index.html                 # Ana HTML dosyası
├── css/
│   ├── main.css              # Genel stiller
│   ├── user-input.css        # Kullanıcı girişi stilleri
│   ├── reference.css         # Referans tablosu stilleri
│   ├── calculations.css      # Hesaplama bölümü stilleri
│   ├── food-selection.css    # Besin seçimi stilleri
│   └── meal-planning.css     # Öğün planlama stilleri
├── js/
│   ├── data/
│   │   ├── reference-data.js # WHO/Neyzi referans verileri
│   │   └── food-data.js      # Besin veritabanı
│   ├── utils/
│   │   ├── age-calculator.js # Yaş hesaplama
│   │   ├── reference-lookup.js # Referans arama
│   │   └── validation.js     # Doğrulama fonksiyonları
│   ├── calculations/
│   │   ├── bmr.js           # BMR hesaplamaları
│   │   └── daily-needs.js   # Günlük ihtiyaç hesaplamaları
│   ├── ui/
│   │   ├── user-input.js    # Kullanıcı girişi UI
│   │   ├── reference-display.js # Referans gösterimi
│   │   ├── food-selection.js # Besin seçimi UI
│   │   └── meal-planning.js  # Öğün planlama UI
│   ├── export/
│   │   └── pdf-export.js    # PDF dışa aktarma
│   └── main.js              # Ana uygulama başlatıcı
├── tablolar/                 # Referans tabloları (Excel dosyaları)
└── README.md                # Bu dosya
```

## Kullanım

1. `index.html` dosyasını bir web tarayıcısında açın
2. Kişisel bilgileri doldurun
3. Persentil kaynağını seçin (Manuel/Neyzi/WHO)
4. "Hesapla" butonuna tıklayın
5. Besin seçimi yapın ve günlük alıma ekleyin
6. Besinleri öğünlere dağıtın
7. "PDF İndir" ile rapor oluşturun

## Teknolojiler

- **HTML5**: Yapı
- **CSS3**: Stil (Grid, Flexbox, Gradients)
- **Vanilla JavaScript (ES6+)**: Mantık
- Harici kütüphane yok - Tamamen native kod

## Özellikler

### Responsive Tasarım
- Mobil ve masaüstü uyumlu
- Esnek grid sistemi

### Kullanıcı Dostu Arayüz
- Modern gradient tasarım
- Sürükle-bırak desteği
- Gerçek zamanlı güncellemeler
- İlerleme göstergeleri

### Modüler Yapı
- Her özellik ayrı dosyada
- Kolay bakım ve geliştirme
- Temiz kod organizasyonu

## Gelecek Geliştirmeler

### Öncelikli
- [ ] WHO ve Neyzi persentil tablolarının tam entegrasyonu
- [ ] Boy-yaş uyumsuzluğu kontrolü
- [ ] Kilo aşımı uyarı sistemi
- [ ] Referans satırı vurgulama

### İsteğe Bağlı
- [ ] Veri kaydetme (LocalStorage)
- [ ] Geçmiş kayıtları görüntüleme
- [ ] Grafik ve çizelgeler
- [ ] Çoklu dil desteği
- [ ] Tema seçenekleri (Açık/Koyu mod)

## Notlar

- Referans verileri (WHO/Neyzi) Excel dosyalarından manuel olarak girilmelidir
- BMR formülleri klinik standartlara göre güncellenmelidir
- Fenilalanin hesaplaması doktor onayı gerektirir

## Lisans

Bu proje eğitim amaçlıdır.

## İletişim

Sorularınız için proje sahibi ile iletişime geçin.
