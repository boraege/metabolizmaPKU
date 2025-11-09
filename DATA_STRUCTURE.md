# Veri Yapısı Kılavuzu

Bu dosya, WHO ve Neyzi referans verilerinin nasıl ekleneceğini açıklar.

## Referans Veri Yapısı

### js/data/reference-data.js dosyasına eklenecek

```javascript
const REFERENCE_DATA = {
    // WHO Erkek Verileri
    who_male: {
        weight: [
            // Yaş, 3p, 10p, 25p, 50p, 75p, 90p, 97p
            { age: 'Doğum', p3: 2.58, p10: 2.85, p25: 3.13, p50: 3.43, p75: 3.73, p90: 4.00, p97: 4.27 },
            { age: '3 ay', p3: 4.75, p10: 5.26, p25: 5.79, p50: 6.38, p75: 6.99, p90: 7.54, p97: 8.10 },
            // ... daha fazla satır
        ],
        height: [
            { age: 'Doğum', p3: 45.9, p10: 47.2, p25: 48.5, p50: 50.0, p75: 51.5, p90: 52.9, p97: 54.2 },
            // ... daha fazla satır
        ],
        bmi: [
            { age: '5', p5: 11.4, p15: 12.2, p25: 12.7, p50: 13.7, p75: 14.6, p85: 15.2, p95: 16.1 },
            // ... daha fazla satır
        ],
        headCircumference: [
            { age: 'Doğum', p3: 32.3, p10: 33.2, p25: 34.0, p50: 34.9, p75: 35.9, p90: 36.7, p97: 37.5 },
            // ... daha fazla satır
        ]
    },
    
    // WHO Kız Verileri
    who_female: {
        weight: [
            { age: 'Doğum', p3: 2.52, p10: 2.76, p25: 3.01, p50: 3.29, p75: 3.58, p90: 3.84, p97: 4.10 },
            // ... daha fazla satır
        ],
        height: [
            { age: 'Doğum', p3: 45.3, p10: 46.6, p25: 47.9, p50: 49.4, p75: 50.8, p90: 52.1, p97: 53.4 },
            // ... daha fazla satır
        ],
        bmi: [
            { age: '5', p5: 11.4, p15: 12.2, p25: 12.6, p50: 13.5, p75: 14.4, p85: 14.9, p95: 15.8 },
            // ... daha fazla satır
        ],
        headCircumference: [
            { age: 'Doğum', p3: 31.9, p10: 32.7, p25: 33.6, p50: 34.5, p75: 35.5, p90: 36.3, p97: 37.1 },
            // ... daha fazla satır
        ]
    },
    
    // Neyzi Verileri (benzer yapı)
    neyzi_male: {
        // ... Neyzi erkek verileri
    },
    
    neyzi_female: {
        // ... Neyzi kız verileri
    },
    
    // Beslenme Referansları (zaten mevcut)
    nutritionReference: [
        { age: '0-3 ay', fa: 60, protein: 2.5, energy: '110-120' },
        { age: '3-6 ay', fa: 50, protein: 2.5, energy: '110-120' },
        { age: '6-12 ay', fa: 40, protein: 2.4, energy: '105-115' },
        { age: '1-3 yaş', fa: 30, protein: 2.0, energy: '90-105' },
        { age: '4-6 yaş', fa: 25, protein: 1.7, energy: '80-90' },
        { age: '7-9 yaş', fa: 15, protein: 1.6, energy: '70-90' },
        { age: '10+ yaş', fa: 10, protein: 1.5, energy: '70-80' }
    ]
};
```

## Excel'den Veri Aktarma

### Adım 1: Excel Dosyasını Açın
- `tablolar/erkek who persentil tablosu.xlsx` dosyasını açın

### Adım 2: Verileri Kopyalayın
- Her tablo için (Kilo, Boy, BMI, Baş Çevresi)
- Satır satır verileri kopyalayın

### Adım 3: JavaScript Formatına Dönüştürün

**Excel'den:**
```
Yaş    3      10     25     50     75     90     97
Doğum  2.58   2.85   3.13   3.43   3.73   4.00   4.27
```

**JavaScript'e:**
```javascript
{ age: 'Doğum', p3: 2.58, p10: 2.85, p25: 3.13, p50: 3.43, p75: 3.73, p90: 4.00, p97: 4.27 }
```

### Adım 4: Yaş Formatları

**Ay için:**
```javascript
{ age: '3 ay', ... }
{ age: '6 ay', ... }
{ age: '12 ay', ... }
```

**Yıl için:**
```javascript
{ age: '2 yaş', ... }
{ age: '3 yaş', ... }
{ age: '18 yaş', ... }
```

## Lookup Fonksiyonu Güncelleme

### js/utils/reference-lookup.js dosyasını güncelleyin:

```javascript
function findReferenceRow(source, gender, ageData) {
    // Kaynak ve cinsiyet kombinasyonunu belirle
    const dataKey = `${source}_${gender}`; // örn: "who_male"
    const referenceData = REFERENCE_DATA[dataKey];
    
    if (!referenceData) {
        return { found: false, row: null, warnings: [] };
    }
    
    // Yaşa göre uygun satırı bul
    const ageInMonths = ageData.years * 12 + ageData.months;
    
    // Kilo verisi
    const weightRow = findClosestAge(referenceData.weight, ageInMonths);
    
    // Boy verisi
    const heightRow = findClosestAge(referenceData.height, ageInMonths);
    
    // BMI verisi (5 yaş üstü için)
    const bmiRow = ageData.years >= 5 ? 
        findClosestAge(referenceData.bmi, ageInMonths) : null;
    
    return {
        found: true,
        weight: weightRow,
        height: heightRow,
        bmi: bmiRow,
        warnings: []
    };
}

function findClosestAge(dataArray, ageInMonths) {
    // En yakın yaş satırını bul
    let closest = dataArray[0];
    let minDiff = Math.abs(parseAgeToMonths(closest.age) - ageInMonths);
    
    for (let row of dataArray) {
        const rowAge = parseAgeToMonths(row.age);
        const diff = Math.abs(rowAge - ageInMonths);
        
        if (diff < minDiff) {
            minDiff = diff;
            closest = row;
        }
    }
    
    return closest;
}

function parseAgeToMonths(ageString) {
    // "3 ay" -> 3
    // "2 yaş" -> 24
    // "Doğum" -> 0
    
    if (ageString === 'Doğum') return 0;
    
    const match = ageString.match(/(\d+)\s*(ay|yaş)/);
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        return unit === 'yaş' ? value * 12 : value;
    }
    
    return 0;
}
```

## Validasyon Fonksiyonu Güncelleme

### js/utils/validation.js dosyasına ekleyin:

```javascript
function validateGrowth(height, weight, referenceData) {
    const warnings = [];
    let heightAgeRow = null;
    
    if (!referenceData) {
        return { warnings, heightAgeRow };
    }
    
    // Boy kontrolü - 3. persentil altında mı?
    if (height < referenceData.height.p3) {
        warnings.push({
            type: 'height',
            message: `Boy değeri 3. persentil altında (${referenceData.height.p3} cm). Yaş-boy uyumsuzluğu tespit edildi.`
        });
        
        // 50. persentilde bu boya karşılık gelen yaşı bul
        heightAgeRow = findAgeForHeight(height, referenceData);
    }
    
    // Kilo kontrolü - %30 aşım var mı?
    const maxWeight = referenceData.weight.p97 * 1.30;
    if (weight > maxWeight) {
        warnings.push({
            type: 'weight',
            message: `Kilo referans aralığını %30'dan fazla aşıyor (Max: ${maxWeight.toFixed(1)} kg). Lütfen Manuel hesaplama kullanın.`,
            critical: true
        });
    }
    
    return { warnings, heightAgeRow };
}

function findAgeForHeight(targetHeight, referenceData) {
    // 50. persentilde hedef boya en yakın yaşı bul
    // Bu fonksiyon tüm boy verilerinde arama yapar
    // ve targetHeight'a en yakın p50 değerini bulur
    
    // Implementasyon detayları...
}
```

## Test Etme

### Örnek Test Verisi:
```javascript
// Test için örnek
const testData = {
    fullName: "Test Çocuk",
    birthDate: "2020-01-01",
    height: 85,
    weight: 12,
    gender: "male",
    source: "who"
};

// Beklenen sonuç:
// - Yaş: 4 Yıl, X Ay, Y Gün
// - Referans satırı bulunmalı
// - BMR hesaplanmalı
// - Protein ve enerji ihtiyaçları hesaplanmalı
```

## Notlar

1. **Yaş Formatı**: Excel'deki yaş formatlarını JavaScript string'lerine dikkatli dönüştürün
2. **Ondalık Ayırıcı**: Türkçe Excel virgül (,) kullanır, JavaScript nokta (.) kullanır
3. **Eksik Veriler**: Bazı yaş gruplarında eksik veriler olabilir, null kontrolü yapın
4. **Performans**: Büyük veri setleri için binary search kullanmayı düşünün

## Yardım

Veri ekleme konusunda yardıma ihtiyacınız varsa:
1. Excel dosyasının ekran görüntüsünü alın
2. Hangi tabloda sorun olduğunu belirtin
3. Hata mesajını paylaşın
