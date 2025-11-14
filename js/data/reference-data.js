// WHO Persentil Verileri - Dinamik Yükleme
let WHO_PERCENTILE_DATA = {
    boys: {
        height: null,
        weight: null
    },
    girls: {
        height: null,
        weight: null
    },
    loaded: false
};

// WHO verilerini yükle (Boy ve Ağırlık)
async function loadWHOPercentileData() {
    if (WHO_PERCENTILE_DATA.loaded) return WHO_PERCENTILE_DATA;
    
    try {
        const [boysHeightResponse, girlsHeightResponse, boysWeightResponse, girlsWeightResponse] = await Promise.all([
            fetch('boys_who_data.json'),
            fetch('girls_who_data.json'),
            fetch('boys_who_weight_data.json'),
            fetch('girls_who_weight_data.json')
        ]);
        
        WHO_PERCENTILE_DATA.boys.height = await boysHeightResponse.json();
        WHO_PERCENTILE_DATA.girls.height = await girlsHeightResponse.json();
        WHO_PERCENTILE_DATA.boys.weight = await boysWeightResponse.json();
        WHO_PERCENTILE_DATA.girls.weight = await girlsWeightResponse.json();
        WHO_PERCENTILE_DATA.loaded = true;
        
        console.log('✅ WHO persentil verileri yüklendi:', {
            boys_height: WHO_PERCENTILE_DATA.boys.height.length + ' kayıt',
            girls_height: WHO_PERCENTILE_DATA.girls.height.length + ' kayıt',
            boys_weight: WHO_PERCENTILE_DATA.boys.weight.length + ' kayıt',
            girls_weight: WHO_PERCENTILE_DATA.girls.weight.length + ' kayıt'
        });
        
        return WHO_PERCENTILE_DATA;
    } catch (error) {
        console.error('❌ WHO verileri yüklenemedi (CORS hatası):', error.message);
        console.warn('⚠️ Çözüm: Uygulamayı HTTP sunucusu ile çalıştırın');
        console.info('💡 Komut: python3 -m http.server 8000');
        console.info('💡 Sonra açın: http://localhost:8000/index.html');
        console.info('📖 Detaylar: START_SERVER.md dosyasına bakın');
        
        // WHO butonunu devre dışı bırak
        const whoButton = document.querySelector('.tab-button[data-source="who"]');
        if (whoButton) {
            whoButton.disabled = true;
            whoButton.style.opacity = '0.5';
            whoButton.style.cursor = 'not-allowed';
            whoButton.title = 'WHO verileri yüklenemedi. HTTP sunucusu gerekli.';
        }
        
        return null;
    }
}

// Yaşa göre WHO persentil değerini bul (0-1856 gün / 0-5 yaş)
function getWHOPercentile(gender, ageInDays, percentile) {
    if (!WHO_PERCENTILE_DATA.loaded) {
        console.warn('WHO verileri henüz yüklenmedi');
        return null;
    }
    
    const data = gender === 'male' ? WHO_PERCENTILE_DATA.boys : WHO_PERCENTILE_DATA.girls;
    if (!data) return null;
    
    // Yaşa en yakın veriyi bul
    const record = data.find(r => r.Day === ageInDays) || 
                   data.reduce((prev, curr) => 
                       Math.abs(curr.Day - ageInDays) < Math.abs(prev.Day - ageInDays) ? curr : prev
                   );
    
    // Persentil değerini döndür (P01, P1, P3, P5, P10, P15, P25, P50, P75, P85, P90, P95, P97, P99, P999)
    const percentileKey = `P${percentile}`;
    return record[percentileKey] || null;
}

// Yaşa göre Neyzi persentil değerini bul
function getNeyziPercentile(gender, ageInMonths, percentile, metric = 'weight') {
    const dataSource = gender === 'male' ? REFERENCE_DATA.neyzi_male : REFERENCE_DATA.neyzi_female;
    if (!dataSource || !dataSource[metric]) return null;
    
    const data = dataSource[metric];
    
    // Yaşa en yakın veriyi bul
    const record = data.find(r => r.months === ageInMonths) || 
                   data.reduce((prev, curr) => 
                       Math.abs(curr.months - ageInMonths) < Math.abs(prev.months - ageInMonths) ? curr : prev
                   );
    
    // Persentil değerini döndür (p3, p10, p25, p50, p75, p90, p97 veya p5, p15, p85, p95)
    const percentileKey = `p${percentile}`;
    return record[percentileKey] || null;
}

// Akıllı persentil hesaplama: 0-5 yaş WHO, 5+ yaş Neyzi
function getPercentileValue(gender, ageInDays, percentile, metric = 'height') {
    const ageInMonths = Math.floor(ageInDays / 30.44);
    const ageInYears = ageInDays / 365.25;
    
    // 0-5 yaş arası: WHO verilerini kullan (1856 güne kadar)
    if (ageInDays <= 1856) {
        // WHO verilerini yükle
        if (!WHO_PERCENTILE_DATA.loaded) {
            console.warn('WHO verileri yükleniyor...');
            loadWHOPercentileData().then(() => {
                console.log('WHO verileri yüklendi');
            });
            return null;
        }
        return getWHOPercentile(gender, ageInDays, percentile);
    }
    
    // 5 yaş üstü: Neyzi verilerini kullan
    return getNeyziPercentile(gender, ageInMonths, percentile, metric);
}

// Yaş bilgisini gün cinsinden hesapla
function calculateAgeInDays(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Yaş bilgisini ay cinsinden hesapla
function calculateAgeInMonths(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                   (today.getMonth() - birth.getMonth());
    return months;
}

// Neyzi Reference Data - Türkiye Referans Değerleri
// NOT: WHO verileri boys_who_data.json ve girls_who_data.json dosyalarından yüklenir
const REFERENCE_DATA = {
    // Neyzi Male (Erkek) Reference Data - Türkiye Neyzi Referans Değerleri
    neyzi_male: {
        weight: [
            { age: 'Doğum', months: 0, p3: 2.58, p10: 2.85, p25: 3.13, p50: 3.43, p75: 3.73, p90: 4.00, p97: 4.27 },
            { age: '3 ay', months: 3, p3: 4.75, p10: 5.26, p25: 5.79, p50: 6.38, p75: 6.99, p90: 7.54, p97: 8.10 },
            { age: '6 ay', months: 6, p3: 6.21, p10: 6.79, p25: 7.41, p50: 8.12, p75: 8.85, p90: 9.54, p97: 10.25 },
            { age: '9 ay', months: 9, p3: 7.27, p10: 7.87, p25: 8.51, p50: 9.26, p75: 10.06, p90: 10.81, p97: 11.58 },
            { age: '12 ay', months: 12, p3: 7.96, p10: 8.61, p25: 9.32, p50: 10.16, p75: 11.05, p90: 11.92, p97: 12.82 },
            { age: '15 ay', months: 15, p3: 8.61, p10: 9.28, p25: 10.01, p50: 10.89, p75: 11.83, p90: 12.75, p97: 13.72 },
            { age: '18 ay', months: 18, p3: 9.13, p10: 9.82, p25: 10.58, p50: 11.49, p75: 12.48, p90: 13.46, p97: 14.49 },
            { age: '2 yaş', months: 24, p3: 10.12, p10: 10.85, p25: 11.66, p50: 12.66, p75: 13.76, p90: 14.86, p97: 16.05 },
            { age: '2.5 yaş', months: 30, p3: 11.06, p10: 11.84, p25: 12.71, p50: 13.80, p75: 15.04, p90: 16.29, p97: 17.69 },
            { age: '3 yaş', months: 36, p3: 11.81, p10: 12.65, p25: 13.61, p50: 14.83, p75: 16.24, p90: 17.71, p97: 19.39 },
            { age: '3.5 yaş', months: 42, p3: 12.6, p10: 13.5, p25: 14.6, p50: 15.9, p75: 17.4, p90: 18.9, p97: 20.6 },
            { age: '4 yaş', months: 48, p3: 13.3, p10: 14.3, p25: 15.4, p50: 16.8, p75: 18.5, p90: 20.1, p97: 22.0 },
            { age: '4.5 yaş', months: 54, p3: 14.0, p10: 15.0, p25: 16.2, p50: 17.7, p75: 19.5, p90: 21.3, p97: 23.3 },
            { age: '5 yaş', months: 60, p3: 14.7, p10: 15.8, p25: 17.0, p50: 18.6, p75: 20.5, p90: 22.4, p97: 24.6 },
            { age: '5.5 yaş', months: 66, p3: 15.4, p10: 16.5, p25: 17.9, p50: 19.6, p75: 21.6, p90: 23.6, p97: 26.0 },
            { age: '6 yaş', months: 72, p3: 16.2, p10: 17.4, p25: 18.9, p50: 20.7, p75: 22.8, p90: 25.1, p97: 27.7 },
            { age: '7 yaş', months: 84, p3: 18.1, p10: 19.5, p25: 21.1, p50: 23.2, p75: 25.8, p90: 28.5, p97: 31.6 },
            { age: '8 yaş', months: 96, p3: 19.9, p10: 21.5, p25: 23.4, p50: 25.9, p75: 28.9, p90: 32.2, p97: 36.1 },
            { age: '9 yaş', months: 108, p3: 21.7, p10: 23.6, p25: 25.8, p50: 28.8, p75: 32.4, p90: 36.4, p97: 41.3 },
            { age: '10 yaş', months: 120, p3: 23.6, p10: 25.9, p25: 28.6, p50: 32.2, p75: 36.7, p90: 41.6, p97: 47.8 },
            { age: '11 yaş', months: 132, p3: 26.6, p10: 29.6, p25: 33.1, p50: 37.8, p75: 43.6, p90: 50.0, p97: 57.8 },
            { age: '12 yaş', months: 144, p3: 29.9, p10: 33.8, p25: 38.4, p50: 44.3, p75: 51.3, p90: 58.7, p97: 67.1 },
            { age: '13 yaş', months: 156, p3: 33.4, p10: 38.0, p25: 43.2, p50: 49.8, p75: 57.3, p90: 64.9, p97: 73.3 },
            { age: '14 yaş', months: 168, p3: 39.1, p10: 44.0, p25: 49.4, p50: 56.2, p75: 63.9, p90: 71.6, p97: 80.1 },
            { age: '15 yaş', months: 180, p3: 45.3, p10: 50.1, p25: 55.4, p50: 62.1, p75: 69.7, p90: 77.4, p97: 85.9 },
            { age: '16 yaş', months: 192, p3: 49.9, p10: 54.5, p25: 59.7, p50: 66.2, p75: 73.6, p90: 81.2, p97: 89.6 },
            { age: '17 yaş', months: 204, p3: 53.2, p10: 57.8, p25: 62.8, p50: 69.2, p75: 76.5, p90: 84.0, p97: 92.4 },
            { age: '18 yaş', months: 216, p3: 56.1, p10: 60.5, p25: 65.5, p50: 71.8, p75: 79.0, p90: 86.4, p97: 94.7 }
        ],
        height: [
            { age: 'Doğum', months: 0, p3: 45.9, p10: 47.2, p25: 48.5, p50: 50.0, p75: 51.5, p90: 52.9, p97: 54.2 },
            { age: '3 ay', months: 3, p3: 56.2, p10: 57.8, p25: 59.5, p50: 61.3, p75: 63.2, p90: 64.8, p97: 66.4 },
            { age: '6 ay', months: 6, p3: 62.8, p10: 64.5, p25: 66.2, p50: 68.0, p75: 69.9, p90: 71.6, p97: 73.2 },
            { age: '9 ay', months: 9, p3: 67.4, p10: 69.1, p25: 70.9, p50: 72.8, p75: 74.7, p90: 76.4, p97: 78.1 },
            { age: '12 ay', months: 12, p3: 70.8, p10: 72.7, p25: 74.7, p50: 76.9, p75: 79.1, p90: 81.1, p97: 83.0 },
            { age: '15 ay', months: 15, p3: 73.8, p10: 75.8, p25: 77.9, p50: 80.2, p75: 82.5, p90: 84.5, p97: 86.6 },
            { age: '18 ay', months: 18, p3: 76.4, p10: 78.5, p25: 80.7, p50: 83.1, p75: 85.5, p90: 87.7, p97: 89.8 },
            { age: '2 yaş', months: 24, p3: 81.0, p10: 83.3, p25: 85.6, p50: 88.2, p75: 90.8, p90: 93.2, p97: 95.5 },
            { age: '2.5 yaş', months: 30, p3: 85.3, p10: 87.6, p25: 90.0, p50: 92.6, p75: 95.3, p90: 97.6, p97: 100.0 },
            { age: '3 yaş', months: 36, p3: 89.3, p10: 91.7, p25: 94.1, p50: 96.8, p75: 99.4, p90: 101.8, p97: 104.2 },
            { age: '3.5 yaş', months: 42, p3: 92.8, p10: 95.2, p25: 97.7, p50: 100.5, p75: 103.2, p90: 105.7, p97: 108.2 },
            { age: '4 yaş', months: 48, p3: 96.0, p10: 98.6, p25: 101.1, p50: 104.0, p75: 106.9, p90: 109.5, p97: 112.0 },
            { age: '4.5 yaş', months: 54, p3: 99.0, p10: 101.7, p25: 104.3, p50: 107.3, p75: 110.3, p90: 113.0, p97: 115.6 },
            { age: '5 yaş', months: 60, p3: 101.8, p10: 104.5, p25: 107.3, p50: 110.4, p75: 113.5, p90: 116.2, p97: 119.0 },
            { age: '5.5 yaş', months: 66, p3: 104.5, p10: 107.3, p25: 110.1, p50: 113.3, p75: 116.4, p90: 119.3, p97: 122.1 },
            { age: '6 yaş', months: 72, p3: 107.1, p10: 110.0, p25: 112.9, p50: 116.1, p75: 119.3, p90: 122.2, p97: 125.1 },
            { age: '7 yaş', months: 84, p3: 112.1, p10: 115.1, p25: 118.2, p50: 121.5, p75: 124.9, p90: 128.0, p97: 131.0 },
            { age: '8 yaş', months: 96, p3: 116.9, p10: 120.0, p25: 123.3, p50: 126.9, p75: 130.5, p90: 133.7, p97: 136.9 },
            { age: '9 yaş', months: 108, p3: 121.6, p10: 124.9, p25: 128.3, p50: 132.1, p75: 135.9, p90: 139.3, p97: 142.7 },
            { age: '10 yaş', months: 120, p3: 126.4, p10: 130.0, p25: 133.6, p50: 137.6, p75: 141.6, p90: 145.2, p97: 148.7 },
            { age: '11 yaş', months: 132, p3: 131.7, p10: 135.5, p25: 139.4, p50: 143.8, p75: 148.1, p90: 152.0, p97: 155.9 },
            { age: '12 yaş', months: 144, p3: 137.0, p10: 141.3, p25: 145.7, p50: 150.6, p75: 155.4, p90: 159.8, p97: 164.1 },
            { age: '13 yaş', months: 156, p3: 142.8, p10: 147.6, p25: 152.4, p50: 157.7, p75: 163.1, p90: 167.9, p97: 172.6 },
            { age: '14 yaş', months: 168, p3: 150.3, p10: 155.0, p25: 159.7, p50: 164.9, p75: 170.1, p90: 174.8, p97: 179.5 },
            { age: '15 yaş', months: 180, p3: 156.9, p10: 161.2, p25: 165.5, p50: 170.3, p75: 175.1, p90: 179.4, p97: 183.7 },
            { age: '16 yaş', months: 192, p3: 160.9, p10: 164.9, p25: 168.9, p50: 173.4, p75: 177.9, p90: 181.9, p97: 185.9 },
            { age: '17 yaş', months: 204, p3: 163.0, p10: 166.8, p25: 170.7, p50: 175.0, p75: 179.3, p90: 183.2, p97: 187.1 },
            { age: '18 yaş', months: 216, p3: 164.5, p10: 168.2, p25: 172.0, p50: 176.2, p75: 180.4, p90: 184.2, p97: 187.9 }
        ],
        bmi: [
            { age: '5', months: 60, p5: 11.4, p15: 12.2, p25: 12.7, p50: 13.7, p75: 14.6, p85: 15.2, p95: 16.1 },
            { age: '6', months: 72, p5: 11.4, p15: 12.3, p25: 12.8, p50: 13.7, p75: 14.6, p85: 15.3, p95: 16.2 },
            { age: '7', months: 84, p5: 11.4, p15: 12.3, p25: 12.8, p50: 13.8, p75: 14.8, p85: 15.5, p95: 16.7 },
            { age: '8', months: 96, p5: 11.5, p15: 12.4, p25: 13.0, p50: 14.0, p75: 15.1, p85: 16.0, p95: 17.5 },
            { age: '9', months: 108, p5: 11.6, p15: 12.6, p25: 13.2, p50: 14.3, p75: 15.6, p85: 16.6, p95: 18.4 },
            { age: '10', months: 120, p5: 11.8, p15: 12.8, p25: 13.5, p50: 14.7, p75: 16.2, p85: 17.3, p95: 19.4 },
            { age: '11', months: 132, p5: 12.1, p15: 13.2, p25: 13.9, p50: 15.3, p75: 17.0, p85: 18.2, p95: 20.6 },
            { age: '12', months: 144, p5: 12.5, p15: 13.6, p25: 14.4, p50: 16.0, p75: 17.9, p85: 19.3, p95: 22.0 },
            { age: '13', months: 156, p5: 13.0, p15: 14.2, p25: 15.1, p50: 16.8, p75: 18.9, p85: 20.5, p95: 23.5 },
            { age: '14', months: 168, p5: 13.6, p15: 14.9, p25: 15.8, p50: 17.7, p75: 20.0, p85: 21.8, p95: 25.2 },
            { age: '15', months: 180, p5: 14.3, p15: 15.6, p25: 16.6, p50: 18.7, p75: 21.2, p85: 23.2, p95: 26.9 },
            { age: '16', months: 192, p5: 15.0, p15: 16.4, p25: 17.5, p50: 19.7, p75: 22.4, p85: 24.5, p95: 28.5 },
            { age: '17', months: 204, p5: 15.6, p15: 17.1, p25: 18.3, p50: 20.7, p75: 23.5, p85: 25.7, p95: 29.9 },
            { age: '18', months: 216, p5: 16.2, p15: 17.8, p25: 19.0, p50: 21.5, p75: 24.5, p85: 26.8, p95: 31.2 }
        ],
        headCircumference: [
            { age: 'Doğum', months: 0, p3: 32.3, p10: 33.2, p25: 34.0, p50: 34.9, p75: 35.9, p90: 36.7, p97: 37.5 },
            { age: '1 ay', months: 1, p3: 35.3, p10: 36.1, p25: 37.0, p50: 37.9, p75: 38.9, p90: 39.7, p97: 40.5 },
            { age: '2 ay', months: 2, p3: 37.1, p10: 37.9, p25: 38.8, p50: 39.7, p75: 40.6, p90: 41.5, p97: 42.3 },
            { age: '3 ay', months: 3, p3: 38.5, p10: 39.3, p25: 40.2, p50: 41.1, p75: 42.0, p90: 42.8, p97: 43.7 },
            { age: '6 ay', months: 6, p3: 41.3, p10: 42.2, p25: 43.1, p50: 44.0, p75: 45.0, p90: 45.9, p97: 46.7 },
            { age: '9 ay', months: 9, p3: 43.1, p10: 44.0, p25: 44.9, p50: 45.8, p75: 46.8, p90: 47.7, p97: 48.6 },
            { age: '12 ay', months: 12, p3: 44.3, p10: 45.2, p25: 46.1, p50: 47.1, p75: 48.0, p90: 48.9, p97: 49.8 },
            { age: '15 ay', months: 15, p3: 45.0, p10: 45.9, p25: 46.8, p50: 47.8, p75: 48.8, p90: 49.7, p97: 50.6 },
            { age: '18 ay', months: 18, p3: 45.6, p10: 46.5, p25: 47.4, p50: 48.4, p75: 49.4, p90: 50.3, p97: 51.2 },
            { age: '21 ay', months: 21, p3: 46.1, p10: 47.0, p25: 47.9, p50: 48.9, p75: 49.9, p90: 50.8, p97: 51.7 },
            { age: '24 ay', months: 24, p3: 46.4, p10: 47.3, p25: 48.3, p50: 49.3, p75: 50.3, p90: 51.2, p97: 52.1 },
            { age: '27 ay', months: 27, p3: 46.7, p10: 47.6, p25: 48.6, p50: 49.6, p75: 50.6, p90: 51.6, p97: 52.5 },
            { age: '30 ay', months: 30, p3: 46.9, p10: 47.8, p25: 48.8, p50: 49.8, p75: 50.8, p90: 51.8, p97: 52.7 },
            { age: '33 ay', months: 33, p3: 47.0, p10: 48.0, p25: 48.9, p50: 49.9, p75: 51.0, p90: 51.9, p97: 52.9 },
            { age: '36 ay', months: 36, p3: 47.1, p10: 48.0, p25: 49.0, p50: 50.0, p75: 51.1, p90: 52.0, p97: 52.9 }
        ]
    },

    // WHO Female (Kız) Reference Data
    neyzi_female: {
        weight: [
            { age: 'Doğum', months: 0, p3: 2.52, p10: 2.76, p25: 3.01, p50: 3.29, p75: 3.58, p90: 3.84, p97: 4.10 },
            { age: '3 ay', months: 3, p3: 4.48, p10: 4.90, p25: 5.33, p50: 5.82, p75: 6.32, p90: 6.78, p97: 7.24 },
            { age: '6 ay', months: 6, p3: 5.94, p10: 6.38, p25: 6.85, p50: 7.43, p75: 8.06, p90: 8.68, p97: 9.34 },
            { age: '9 ay', months: 9, p3: 6.85, p10: 7.34, p25: 7.89, p50: 8.55, p75: 9.29, p90: 10.02, p97: 10.82 },
            { age: '12 ay', months: 12, p3: 7.52, p10: 8.06, p25: 8.66, p50: 9.39, p75: 10.20, p90: 11.00, p97: 11.87 },
            { age: '15 ay', months: 15, p3: 8.09, p10: 8.67, p25: 9.31, p50: 10.10, p75: 10.96, p90: 11.81, p97: 12.73 },
            { age: '18 ay', months: 18, p3: 8.57, p10: 9.19, p25: 9.87, p50: 10.71, p75: 11.63, p90: 12.55, p97: 13.54 },
            { age: '2 yaş', months: 24, p3: 9.49, p10: 10.20, p25: 10.99, p50: 11.94, p75: 12.99, p90: 14.03, p97: 15.15 },
            { age: '2.5 yaş', months: 30, p3: 10.35, p10: 11.17, p25: 12.06, p50: 13.12, p75: 14.25, p90: 15.33, p97: 16.47 },
            { age: '3 yaş', months: 36, p3: 11.19, p10: 12.09, p25: 13.05, p50: 14.18, p75: 15.37, p90: 16.51, p97: 17.68 },
            { age: '3.5 yaş', months: 42, p3: 11.9, p10: 12.8, p25: 13.9, p50: 15.1, p75: 16.5, p90: 17.8, p97: 19.3 },
            { age: '4 yaş', months: 48, p3: 12.7, p10: 13.7, p25: 14.8, p50: 16.1, p75: 17.7, p90: 19.2, p97: 20.8 },
            { age: '4.5 yaş', months: 54, p3: 13.5, p10: 14.5, p25: 15.8, p50: 17.3, p75: 19.0, p90: 20.7, p97: 22.5 },
            { age: '5 yaş', months: 60, p3: 14.2, p10: 15.4, p25: 16.7, p50: 18.4, p75: 20.3, p90: 22.2, p97: 24.3 },
            { age: '5.5 yaş', months: 66, p3: 14.9, p10: 16.2, p25: 17.7, p50: 19.5, p75: 21.6, p90: 23.7, p97: 26.1 },
            { age: '6 yaş', months: 72, p3: 15.7, p10: 17.0, p25: 18.6, p50: 20.6, p75: 22.9, p90: 25.3, p97: 27.9 },
            { age: '7 yaş', months: 84, p3: 17.2, p10: 18.7, p25: 20.6, p50: 22.9, p75: 25.7, p90: 28.6, p97: 31.9 },
            { age: '8 yaş', months: 96, p3: 18.9, p10: 20.8, p25: 22.9, p50: 25.7, p75: 28.9, p90: 32.4, p97: 36.5 },
            { age: '9 yaş', months: 108, p3: 20.9, p10: 23.1, p25: 25.6, p50: 28.9, p75: 32.8, p90: 37.0, p97: 41.8 },
            { age: '10 yaş', months: 120, p3: 23.0, p10: 25.6, p25: 28.7, p50: 32.6, p75: 37.3, p90: 42.3, p97: 48.0 },
            { age: '11 yaş', months: 132, p3: 26.4, p10: 29.6, p25: 33.4, p50: 38.2, p75: 43.7, p90: 49.5, p97: 55.9 },
            { age: '12 yaş', months: 144, p3: 32.0, p10: 35.8, p25: 39.9, p50: 45.1, p75: 50.9, p90: 56.8, p97: 63.1 },
            { age: '13 yaş', months: 156, p3: 37.4, p10: 41.1, p25: 45.1, p50: 50.0, p75: 55.5, p90: 60.8, p97: 66.6 },
            { age: '14 yaş', months: 168, p3: 41.6, p10: 45.0, p25: 48.8, p50: 53.3, p75: 58.3, p90: 63.2, p97: 68.5 },
            { age: '15 yaş', months: 180, p3: 44.0, p10: 47.3, p25: 50.9, p50: 55.3, p75: 60.1, p90: 64.8, p97: 69.8 },
            { age: '16 yaş', months: 192, p3: 45.3, p10: 48.5, p25: 52.0, p50: 56.3, p75: 61.0, p90: 65.7, p97: 70.7 },
            { age: '17 yaş', months: 204, p3: 46.2, p10: 49.4, p25: 52.9, p50: 57.2, p75: 61.8, p90: 66.4, p97: 71.4 },
            { age: '18 yaş', months: 216, p3: 47.3, p10: 50.5, p25: 53.9, p50: 58.1, p75: 62.2, p90: 67.3, p97: 72.2 }
        ],
        height: [
            { age: 'Doğum', months: 0, p3: 45.3, p10: 46.6, p25: 47.9, p50: 49.4, p75: 50.8, p90: 52.1, p97: 53.4 },
            { age: '3 ay', months: 3, p3: 55.3, p10: 56.8, p25: 58.2, p50: 59.9, p75: 61.5, p90: 63.0, p97: 64.5 },
            { age: '6 ay', months: 6, p3: 61.6, p10: 63.1, p25: 64.7, p50: 66.4, p75: 68.2, p90: 69.7, p97: 71.3 },
            { age: '9 ay', months: 9, p3: 66.0, p10: 67.7, p25: 69.3, p50: 71.2, p75: 73.0, p90: 74.6, p97: 76.3 },
            { age: '12 ay', months: 12, p3: 69.7, p10: 71.4, p25: 73.2, p50: 75.1, p75: 77.1, p90: 78.8, p97: 80.5 },
            { age: '15 ay', months: 15, p3: 72.8, p10: 74.6, p25: 76.5, p50: 78.5, p75: 80.6, p90: 82.4, p97: 84.2 },
            { age: '18 ay', months: 18, p3: 75.5, p10: 77.4, p25: 79.3, p50: 81.5, p75: 83.7, p90: 85.6, p97: 87.6 },
            { age: '2 yaş', months: 24, p3: 80.1, p10: 82.3, p25: 84.4, p50: 86.8, p75: 89.2, p90: 91.4, p97: 93.5 },
            { age: '2.5 yaş', months: 30, p3: 84.0, p10: 86.3, p25: 88.6, p50: 91.2, p75: 93.8, p90: 96.1, p97: 98.4 },
            { age: '3 yaş', months: 36, p3: 87.8, p10: 90.2, p25: 92.7, p50: 95.4, p75: 98.1, p90: 100.6, p97: 103.0 },
            { age: '3.5 yaş', months: 42, p3: 91.1, p10: 93.6, p25: 96.2, p50: 99.0, p75: 101.9, p90: 104.5, p97: 107.0 },
            { age: '4 yaş', months: 48, p3: 94.3, p10: 96.9, p25: 99.6, p50: 102.5, p75: 105.5, p90: 108.1, p97: 110.7 },
            { age: '4.5 yaş', months: 54, p3: 97.4, p10: 100.1, p25: 102.8, p50: 105.9, p75: 108.9, p90: 111.6, p97: 114.3 },
            { age: '5 yaş', months: 60, p3: 100.4, p10: 103.2, p25: 105.9, p50: 109.1, p75: 112.2, p90: 114.9, p97: 117.7 },
            { age: '5.5 yaş', months: 66, p3: 103.6, p10: 106.3, p25: 109.0, p50: 112.1, p75: 115.3, p90: 118.3, p97: 121.2 },
            { age: '6 yaş', months: 72, p3: 106.2, p10: 109.0, p25: 111.9, p50: 115.1, p75: 118.4, p90: 121.3, p97: 124.1 },
            { age: '7 yaş', months: 84, p3: 111.6, p10: 114.6, p25: 117.7, p50: 121.1, p75: 124.4, p90: 127.5, p97: 130.5 },
            { age: '8 yaş', months: 96, p3: 116.7, p10: 119.9, p25: 123.1, p50: 126.7, p75: 130.3, p90: 133.5, p97: 136.7 },
            { age: '9 yaş', months: 108, p3: 121.3, p10: 124.7, p25: 128.2, p50: 132.2, p75: 136.0, p90: 139.5, p97: 142.9 },
            { age: '10 yaş', months: 120, p3: 125.8, p10: 129.6, p25: 133.5, p50: 137.9, p75: 142.2, p90: 146.1, p97: 150.0 },
            { age: '11 yaş', months: 132, p3: 132.5, p10: 136.6, p25: 140.8, p50: 145.4, p75: 150.1, p90: 154.2, p97: 158.3 },
            { age: '12 yaş', months: 144, p3: 141.1, p10: 144.9, p25: 148.8, p50: 153.1, p75: 157.4, p90: 161.2, p97: 165.1 },
            { age: '13 yaş', months: 156, p3: 146.6, p10: 150.2, p25: 153.8, p50: 157.8, p75: 161.8, p90: 165.5, p97: 169.0 },
            { age: '14 yaş', months: 168, p3: 149.3, p10: 152.8, p25: 156.4, p50: 160.4, p75: 164.3, p90: 167.9, p97: 171.4 },
            { age: '15 yaş', months: 180, p3: 150.7, p10: 154.2, p25: 157.8, p50: 161.7, p75: 165.7, p90: 169.3, p97: 172.8 },
            { age: '16 yaş', months: 192, p3: 151.3, p10: 154.8, p25: 158.4, p50: 162.4, p75: 166.3, p90: 169.9, p97: 173.4 },
            { age: '17 yaş', months: 204, p3: 151.7, p10: 155.2, p25: 158.8, p50: 162.7, p75: 166.7, p90: 170.3, p97: 173.8 },
            { age: '18 yaş', months: 216, p3: 152.0, p10: 155.6, p25: 159.1, p50: 163.1, p75: 167.1, p90: 170.7, p97: 174.2 }
        ],
        bmi: [
            { age: '5', months: 60, p5: 11.4, p15: 12.2, p25: 12.6, p50: 13.5, p75: 14.4, p85: 14.9, p95: 15.8 },
            { age: '6', months: 72, p5: 11.4, p15: 12.2, p25: 12.8, p50: 13.7, p75: 14.6, p85: 15.2, p95: 16.1 },
            { age: '7', months: 84, p5: 11.4, p15: 12.3, p25: 12.8, p50: 13.8, p75: 14.8, p85: 15.5, p95: 16.7 },
            { age: '8', months: 96, p5: 11.5, p15: 12.4, p25: 13.0, p50: 14.0, p75: 15.1, p85: 16.0, p95: 17.5 },
            { age: '9', months: 108, p5: 11.6, p15: 12.6, p25: 13.2, p50: 14.3, p75: 15.6, p85: 16.6, p95: 18.4 },
            { age: '10', months: 120, p5: 11.9, p15: 12.9, p25: 13.6, p50: 14.9, p75: 16.6, p85: 17.7, p95: 19.8 },
            { age: '11', months: 132, p5: 12.3, p15: 13.4, p25: 14.2, p50: 15.7, p75: 17.7, p85: 19.2, p95: 21.9 },
            { age: '12', months: 144, p5: 12.8, p15: 13.9, p25: 14.9, p50: 16.6, p75: 18.9, p85: 20.7, p95: 23.8 },
            { age: '13', months: 156, p5: 13.4, p15: 14.6, p25: 15.7, p50: 17.6, p75: 20.2, p85: 22.3, p95: 25.9 },
            { age: '14', months: 168, p5: 14.1, p15: 15.4, p25: 16.6, p50: 18.7, p75: 21.5, p85: 23.8, p95: 27.8 },
            { age: '15', months: 180, p5: 14.8, p15: 16.2, p25: 17.5, p50: 19.8, p75: 22.8, p85: 25.2, p95: 29.5 },
            { age: '16', months: 192, p5: 15.5, p15: 17.0, p25: 18.4, p50: 20.9, p75: 24.1, p85: 26.6, p95: 31.2 },
            { age: '17', months: 204, p5: 16.2, p15: 17.7, p25: 19.2, p50: 21.9, p75: 25.3, p85: 27.9, p95: 32.7 },
            { age: '18', months: 216, p5: 16.8, p15: 18.4, p25: 19.9, p50: 22.8, p75: 26.4, p85: 29.1, p95: 34.1 }
        ],
        headCircumference: [
            { age: 'Doğum', months: 0, p3: 31.9, p10: 32.7, p25: 33.6, p50: 34.5, p75: 35.5, p90: 36.3, p97: 37.1 },
            { age: '1 ay', months: 1, p3: 34.8, p10: 35.5, p25: 36.3, p50: 37.1, p75: 38.0, p90: 38.7, p97: 39.5 },
            { age: '2 ay', months: 2, p3: 36.5, p10: 37.2, p25: 38.0, p50: 38.8, p75: 39.6, p90: 40.3, p97: 41.0 },
            { age: '3 ay', months: 3, p3: 37.7, p10: 38.4, p25: 39.1, p50: 40.0, p75: 40.8, p90: 41.6, p97: 42.3 },
            { age: '6 ay', months: 6, p3: 40.4, p10: 41.2, p25: 42.0, p50: 42.9, p75: 43.8, p90: 44.6, p97: 45.3 },
            { age: '9 ay', months: 9, p3: 42.1, p10: 42.9, p25: 43.7, p50: 44.6, p75: 45.5, p90: 46.3, p97: 47.1 },
            { age: '12 ay', months: 12, p3: 43.4, p10: 44.1, p25: 44.9, p50: 45.8, p75: 46.7, p90: 47.5, p97: 48.3 },
            { age: '15 ay', months: 15, p3: 44.2, p10: 45.0, p25: 45.8, p50: 46.6, p75: 47.5, p90: 48.3, p97: 49.0 },
            { age: '18 ay', months: 18, p3: 44.8, p10: 45.5, p25: 46.3, p50: 47.2, p75: 48.1, p90: 48.9, p97: 49.7 },
            { age: '21 ay', months: 21, p3: 45.1, p10: 45.9, p25: 46.7, p50: 47.6, p75: 48.6, p90: 49.4, p97: 50.2 },
            { age: '24 ay', months: 24, p3: 45.4, p10: 46.2, p25: 47.1, p50: 48.0, p75: 49.0, p90: 49.8, p97: 50.7 },
            { age: '27 ay', months: 27, p3: 45.5, p10: 46.4, p25: 47.3, p50: 48.2, p75: 49.2, p90: 50.1, p97: 51.0 },
            { age: '30 ay', months: 30, p3: 45.6, p10: 46.5, p25: 47.4, p50: 48.4, p75: 49.4, p90: 50.3, p97: 51.2 },
            { age: '33 ay', months: 33, p3: 45.7, p10: 46.6, p25: 47.5, p50: 48.5, p75: 49.5, p90: 50.4, p97: 51.3 },
            { age: '36 ay', months: 36, p3: 45.8, p10: 46.7, p25: 47.6, p50: 48.7, p75: 49.7, p90: 50.6, p97: 51.5 }
        ]
    },

    // Neyzi Male (Erkek) Reference Data
    // Beslenme Referans Tablosu
    nutritionReference: [
        { age: '0-3 ay', fa: 70, protein: 2.5, energy: '110-120' },
        { age: '3-6 ay', fa: 60, protein: 2.0, energy: '110-120' },
        { age: '6-12 ay', fa: 50, protein: 1.8, energy: '100-110' },
        { age: '1-3 yaş', fa: 40, protein: 1.5, energy: '100-110' },
        { age: '4-6 yaş', fa: 35, protein: 1.2, energy: '90-100' },
        { age: '7-9 yaş', fa: 30, protein: 1.0, energy: '80-90' },
        { age: '10+ yaş', fa: 25, protein: 0.9, energy: '70-80' }
    ]
};

// Beslenme Referans Değerleri (Günlük İhtiyaçlar)
const NUTRITION_REFERENCE = {
    energy: {
        '0-6 ay': { male: 550, female: 500 },
        '7-12 ay': { male: 750, female: 700 },
        '1-3 yaş': { male: 1150, female: 1150 },
        '4-6 yaş': { male: 1600, female: 1450 },
        '7-10 yaş': { male: 1900, female: 1700 },
        '11-14 yaş': { male: 2400, female: 2100 },
        '15-18 yaş': { male: 2850, female: 2100 }
    },
    protein: {
        '0-6 ay': { male: 9.1, female: 9.1 },
        '7-12 ay': { male: 11, female: 11 },
        '1-3 yaş': { male: 13, female: 13 },
        '4-6 yaş': { male: 19, female: 19 },
        '7-10 yaş': { male: 28, female: 28 },
        '11-14 yaş': { male: 42, female: 41 },
        '15-18 yaş': { male: 56, female: 44 }
    }
};


// Persentil durumunu değerlendir
function evaluatePercentile(value, gender, ageInDays, metric = 'weight') {
    const p3 = getPercentileValue(gender, ageInDays, 3, metric);
    const p10 = getPercentileValue(gender, ageInDays, 10, metric);
    const p25 = getPercentileValue(gender, ageInDays, 25, metric);
    const p50 = getPercentileValue(gender, ageInDays, 50, metric);
    const p75 = getPercentileValue(gender, ageInDays, 75, metric);
    const p90 = getPercentileValue(gender, ageInDays, 90, metric);
    const p97 = getPercentileValue(gender, ageInDays, 97, metric);
    
    if (!p3 || !p97) return { status: 'unknown', message: 'Veri bulunamadı' };
    
    if (value < p3) {
        return { status: 'very-low', message: 'Çok düşük (P3 altı)', percentile: '<3', color: 'red' };
    } else if (value < p10) {
        return { status: 'low', message: 'Düşük (P3-P10)', percentile: '3-10', color: 'orange' };
    } else if (value < p25) {
        return { status: 'below-average', message: 'Ortalamanın altı (P10-P25)', percentile: '10-25', color: 'yellow' };
    } else if (value < p50) {
        return { status: 'normal', message: 'Normal (P25-P50)', percentile: '25-50', color: 'green' };
    } else if (value < p75) {
        return { status: 'normal', message: 'Normal (P50-P75)', percentile: '50-75', color: 'green' };
    } else if (value < p90) {
        return { status: 'above-average', message: 'Ortalamanın üstü (P75-P90)', percentile: '75-90', color: 'yellow' };
    } else if (value < p97) {
        return { status: 'high', message: 'Yüksek (P90-P97)', percentile: '90-97', color: 'orange' };
    } else {
        return { status: 'very-high', message: 'Çok yüksek (P97 üstü)', percentile: '>97', color: 'red' };
    }
}

// Veri kaynağı bilgisi
function getDataSource(ageInDays) {
    if (ageInDays <= 1856) {
        return {
            source: 'WHO',
            description: 'Dünya Sağlık Örgütü (0-5 yaş)',
            maxAge: '1856 gün (5 yıl 1 ay)',
            coverage: 'Günlük detaylı veri'
        };
    } else {
        return {
            source: 'Neyzi',
            description: 'Türkiye Neyzi Referans Değerleri (5-18 yaş)',
            maxAge: '18 yaş',
            coverage: 'Aylık/yıllık veri'
        };
    }
}
