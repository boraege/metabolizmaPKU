# Persentil Aralığı Highlight Özelliği

## Genel Bakış
Persentil değerlendirme karşılaştırmasında çocuğun boy ve kilo değerlerinin denk geldiği persentil aralıkları artık otomatik olarak highlight edilmektedir.

## Özellikler

### 1. Otomatik Aralık Tespiti
- Çocuğun boy ve kilo değerleri girildiğinde, bu değerlerin hangi persentil aralığına denk geldiği otomatik olarak hesaplanır
- Hem Neyzi hem de WHO persentil tablolarında çalışır
- Aralıklar: <P3, P3-P10, P10-P25, P25-P50, P50-P75, P75-P90, P90-P97, >P97

### 2. Görsel Highlight
- Denk gelen persentil aralığı **sarı arka plan** ile vurgulanır
- **Turuncu kalın yazı** ile dikkat çekilir
- **Turuncu çerçeve** ile hücre belirginleştirilir
- Sağ üst köşede **turuncu nokta** işareti eklenir

### 3. Bilgilendirme Metni
- Her tablo üzerinde çocuğun değeri ve denk geldiği aralık gösterilir
- Örnek: "Çocuğun ağırlığı: 15 kg → P25-P50"
- Örnek: "Çocuğun boyu: 95 cm → P50-P75"

### 4. Dinamik Güncelleme
- Boy veya kilo değeri değiştirildiğinde tablolar anında güncellenir
- Doğum tarihi veya cinsiyet değiştiğinde yeniden hesaplanır
- Gerçek zamanlı geri bildirim sağlanır

## Teknik Detaylar

### Değişiklik Yapılan Dosyalar

#### 1. `js/ui/user-input.js`
- `findPercentileRange()`: Değerin hangi persentil aralığına denk geldiğini bulan yeni fonksiyon
- `updatePercentileTablesPreview()`: Boy ve kilo parametreleri eklendi
- `displayComparisonTable()`: Neyzi tabloları için highlight desteği
- `displayWHOComparisonTable()`: WHO tabloları için highlight desteği
- `loadAndDisplayWHOData()`: Boy ve kilo parametreleri eklendi
- `initializeUserInput()`: Boy ve kilo input'larına event listener eklendi

#### 2. `css/reference.css`
```css
.preview-table td.percentile-highlight {
    background: #fff9c4 !important;
    font-weight: 700;
    color: #f57c00;
    border: 2px solid #ff9800;
    position: relative;
}

.preview-table td.percentile-highlight::after {
    content: '●';
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 0.7em;
    color: #ff6f00;
}
```

#### 3. `css/mobile.css`
- Mobil cihazlarda da highlight'ın düzgün görünmesi için responsive stiller eklendi

## Kullanım

1. **Kişisel Bilgiler** bölümünde doğum tarihi, cinsiyet, boy ve kilo bilgilerini girin
2. **Persentil Değerleri Karşılaştırması** bölümünde tablolar otomatik olarak yüklenir
3. Çocuğun değerlerine denk gelen persentil aralıkları **sarı** ile vurgulanır
4. Her tablonun üstünde hangi aralığa denk geldiği yazılı olarak gösterilir

## Örnek Görünüm

```
⚖️ Ağırlık (kg) - WHO Günlük Persentil
Çocuğun ağırlığı: 15 kg → P25-P50

┌────┬────┬────┬────┬────┬────┬────┐
│ P3 │P10 │P25 │P50 │P75 │P90 │P97 │
├────┼────┼────┼────┼────┼────┼────┤
│10.8│11.6│[12.4]│[13.5]│14.6│15.7│16.9│
└────┴────┴────┴────┴────┴────┴────┘
        ↑ Highlight ↑
```

## Avantajlar

✅ Hızlı görsel değerlendirme  
✅ Çocuğun büyüme durumunu anında anlama  
✅ Hem Neyzi hem WHO için çalışır  
✅ Mobil uyumlu  
✅ Gerçek zamanlı güncelleme  
✅ Kullanıcı dostu arayüz  

## Notlar

- Highlight özelliği sadece boy ve kilo değerleri girildiğinde aktif olur
- Değerler girilmediğinde normal tablo görünümü korunur
- WHO verileri 0-5 yaş arası için mevcuttur
- Neyzi verileri tüm yaş grupları için kullanılabilir
