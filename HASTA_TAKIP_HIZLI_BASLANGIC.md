# 🚀 Hasta Takip Sistemi - Hızlı Başlangıç

## 1️⃣ Firestore Kurallarını Deploy Edin

```bash
# Terminal'de çalıştırın:
./deploy-firestore-rules.sh

# veya manuel olarak:
firebase deploy --only firestore:rules
```

## 2️⃣ Uygulamayı Başlatın

```bash
# HTTP sunucusu ile çalıştırın (Python 3):
python3 -m http.server 8000

# veya Node.js ile:
npx http-server -p 8000

# Tarayıcıda açın:
# http://localhost:8000
```

## 3️⃣ İlk Hastanızı Ekleyin

### Yöntem 1: Hasta Listesinden
1. Giriş yapın
2. Sağ üstteki **"👥 Hastalarım"** butonuna tıklayın
3. **"+ Yeni Hasta Ekle"** butonuna tıklayın
4. Hasta bilgilerini girin:
   - Ad Soyad
   - Doğum Tarihi
   - Cinsiyet
5. **"Kaydet"** butonuna tıklayın

### Yöntem 2: Hesaplama Sayfasından
1. Ana hesaplama sayfasında hasta bilgilerini girin
2. Boy, kilo ve diğer bilgileri girin
3. Hesaplama yapın
4. **"💾 Hastaya Kaydet"** butonuna tıklayın
5. Onaylayın - yeni hasta otomatik oluşturulur

## 4️⃣ Yeni Ölçüm Ekleyin

### Mevcut Hasta İçin:
1. **"👥 Hastalarım"** sayfasına gidin
2. Hastanın kartındaki **"➕"** butonuna tıklayın
3. Hesaplama sayfası açılır, hasta bilgileri otomatik doldurulur
4. Sadece **boy** ve **kilo** bilgilerini güncelleyin
5. Hesaplama yapın
6. **"💾 Hastaya Kaydet"** butonuna tıklayın

## 5️⃣ Gelişimi Görüntüleyin

1. **"👥 Hastalarım"** sayfasına gidin
2. Hastanın kartındaki **"📊"** butonuna tıklayın
3. Hasta detay sayfasında göreceksiniz:
   - Hasta bilgileri özeti
   - Boy gelişim grafiği
   - Kilo gelişim grafiği
   - Tüm ölçüm geçmişi

## 📱 Kullanım İpuçları

### Hasta Arama
- Hasta listesinde üstteki arama kutusunu kullanın
- Ad veya soyad ile arama yapabilirsiniz

### Hızlı Erişim
- Ana sayfadan **"👥 Hastalarım"** ile hasta listesine
- Hasta listesinden **"← Hesaplama Sayfası"** ile geri dönün
- Hasta detayından **"← Hasta Listesi"** ile geri dönün

### Ölçüm Silme
- Hasta detay sayfasında her ölçümün yanındaki **🗑️** butonuna tıklayın
- Onaylayın

### Hasta Silme
- Hasta listesinde hastanın kartındaki **🗑️** butonuna tıklayın
- ⚠️ Dikkat: Tüm ölçümler de silinir!

## 🎯 Örnek Kullanım Senaryosu

### Senaryo: 3 Aylık Kontrol
1. **İlk Ziyaret (Ocak)**
   - Yeni hasta ekle: "Ahmet Yılmaz"
   - Boy: 120 cm, Kilo: 25 kg
   - Hesaplama yap ve kaydet

2. **İkinci Ziyaret (Nisan)**
   - Hasta listesinden "Ahmet Yılmaz"ı bul
   - ➕ butonuna tıkla
   - Yeni boy: 123 cm, Kilo: 26.5 kg
   - Hesaplama yap ve kaydet

3. **Gelişimi Görüntüle**
   - 📊 butonuna tıkla
   - Grafiklerde 3 aylık gelişimi gör
   - İki ölçümü karşılaştır

## ⚠️ Önemli Notlar

- **İnternet Bağlantısı**: Firebase için gerekli
- **Giriş Yapma**: Tüm işlemler için zorunlu
- **Veri Güvenliği**: Her kullanıcı sadece kendi hastalarını görür
- **Otomatik Kayıt**: Ölçümler otomatik olarak tarihlenir
- **Grafik Güncellemesi**: Yeni ölçüm eklendiğinde grafikler otomatik güncellenir

## 🐛 Sorun Giderme

### Hastalar Görünmüyor
- İnternet bağlantınızı kontrol edin
- Giriş yaptığınızdan emin olun
- Sayfayı yenileyin (F5)

### Grafik Görünmüyor
- En az 1 ölçüm olmalı
- Tarayıcı konsolunu kontrol edin (F12)
- Chart.js yüklendiğinden emin olun

### Kayıt Yapamıyorum
- Tüm alanları doldurduğunuzdan emin olun
- Hesaplama yaptığınızdan emin olun
- Firestore kurallarının deploy edildiğini kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Tarayıcı konsolunu açın (F12)
2. Hata mesajlarını kontrol edin
3. `HASTA_TAKIP_SISTEMI.md` dosyasını inceleyin
