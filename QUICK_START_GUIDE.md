# 🚀 Hızlı Başlangıç Kılavuzu

## ✅ Sunucu Başlatıldı!

HTTP sunucusu başarıyla başlatıldı ve çalışıyor.

---

## 🌐 Uygulamayı Açın

Tarayıcınızda şu adresi açın:

```
http://localhost:8000/index.html
```

**VEYA**

```
http://127.0.0.1:8000/index.html
```

---

## ✅ Doğrulama

### 1. Konsol Kontrolü
Tarayıcıda F12 tuşuna basın ve Console sekmesine gidin.

**Başarılı yükleme mesajı**:
```
✅ WHO persentil verileri yüklendi: 
   boys: 1856 kayıt
   girls: 1856 kayıt
```

### 2. WHO Butonu
- WHO butonu aktif olmalı (gri değil)
- Tıklanabilir olmalı

### 3. Test JSON
Tarayıcıda açın:
```
http://localhost:8000/boys_who_data.json
```
JSON verisi görünüyorsa ✅ başarılı!

---

## 📝 Kullanım Adımları

### 1. Kişisel Bilgileri Girin
- Ad Soyad
- Doğum Tarihi (yaş otomatik hesaplanır)
- Boy (cm)
- Kilo (kg)
- Cinsiyet

### 2. Persentil Kaynağı Seçin
- **Manuel**: Standart formüller
- **Neyzi**: Türk çocukları için (0-18 yaş)
- **WHO**: Uluslararası standart (0-5 yaş) ✅ Artık çalışıyor!

### 3. Hesapla
"Hesapla" butonuna tıklayın.

**Sonuçlar**:
- BMR (Bazal Metabolizma Hızı)
- Enerji İhtiyacı
- Protein İhtiyacı
- Fenilalanin İhtiyacı

### 4. Besin Ekleyin
- Kategori seçin (Ekmek, Sebze, Meyve, vb.)
- Besin seçin
- Miktar girin
- "Ekle" butonuna tıklayın

**VEYA**

- Besini sürükleyin
- Öğün alanına bırakın
- Miktar girin

### 5. Öğün Planlayın
- Öğün ekleyin/düzenleyin
- Besinleri öğünlere dağıtın
- Öğün toplamlarını görün

### 6. Kaydedin
- Otomatik kaydetme aktif
- "Geçmişe Kaydet" ile manuel kayıt
- "Geçmiş Kayıtlar" ile eski kayıtları görün

### 7. PDF Oluşturun
- "PDF Oluştur" butonuna tıklayın
- Yeni pencerede rapor açılır
- Yazdırın veya PDF olarak kaydedin

---

## 🎯 Test Senaryosu

### Örnek Hasta
```
Ad Soyad: Ahmet Yılmaz
Doğum Tarihi: 2019-01-15
Boy: 95 cm
Kilo: 18 kg
Cinsiyet: Erkek
Persentil: WHO
```

**Beklenen Sonuçlar**:
- Yaş: ~5 yıl
- BMR: ~1000-1200 kcal
- Enerji: ~1500-1800 kcal
- Protein: ~25-30 g
- Fenilalanin: ~400-500 mg

---

## ⏹️ Sunucuyu Durdurmak

Terminal'de:
```
Ctrl + C
```

---

## 🔄 Sunucuyu Yeniden Başlatmak

Terminal'de:
```bash
python3 -m http.server 8000
```

**VEYA**

```bash
./start.sh
```

---

## 🐛 Sorun Giderme

### Sorun: Sayfa açılmıyor
**Çözüm**: 
1. Sunucu çalışıyor mu kontrol edin
2. Terminal'de hata var mı bakın
3. Port 8000 kullanımda mı kontrol edin

### Sorun: WHO verileri yüklenmiyor
**Çözüm**:
1. `http://localhost:8000` ile açtığınızdan emin olun
2. `file://` ile AÇMAYIN
3. Konsol'da hata mesajlarını kontrol edin

### Sorun: Hesapla butonu çalışmıyor
**Çözüm**:
1. Tüm alanları doldurduğunuzdan emin olun
2. F12 → Console'da hata var mı bakın
3. Sayfayı yenileyin (F5)

### Sorun: Sürükle-bırak çalışmıyor
**Çözüm**:
1. Önce hesaplama yapın
2. Besin kategorisini seçin
3. Besini doğru alana sürükleyin

---

## 📚 Daha Fazla Bilgi

- **Detaylı Kullanım**: `QUICKSTART.md`
- **CORS Çözümü**: `CORS_SOLUTION.md`
- **Sunucu Başlatma**: `START_SERVER.md`
- **Hata Düzeltmeleri**: `BUGFIX_REPORT.md`
- **Proje Özeti**: `PROJECT_COMPLETE.md`

---

## 🎉 Başarılı Kurulum!

Sunucu çalışıyor ve uygulama kullanıma hazır!

**Şimdi yapın**:
1. Tarayıcıda `http://localhost:8000/index.html` açın
2. Kişisel bilgileri girin
3. WHO seçeneğini deneyin ✅
4. Hesapla butonuna tıklayın
5. Besin ekleyin
6. Keyifle kullanın! 🎊

---

**Sunucu Durumu**: ✅ Çalışıyor  
**Port**: 8000  
**URL**: http://localhost:8000/index.html  
**Tarih**: 2024-11-09
