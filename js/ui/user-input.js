// User Input UI Handlers
function initializeUserInput() {
    // Birth date change handler
    const birthDateInput = document.getElementById('birthDate');
    birthDateInput.addEventListener('change', function() {
        if (this.value) {
            const ageData = calculateAge(this.value);
            document.getElementById('ageDisplay').textContent = ageData.formatted;
            updatePercentileTablesPreview();
        }
    });
    
    // Gender change handler
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    genderInputs.forEach(input => {
        input.addEventListener('change', updatePercentileTablesPreview);
    });
    
    // Height and weight change handlers - update percentile tables
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    heightInput.addEventListener('input', function() {
        updatePercentileTablesPreview();
    });
    
    weightInput.addEventListener('input', function() {
        updatePercentileTablesPreview();
    });
    
    // Tab switching for percentile source
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateSourceDescription(this.dataset.source);
        });
    });
    
    // Calculate button
    document.getElementById('calculateNeeds').addEventListener('click', updateDailyNeeds);
    
    // Energy practical input change
    document.getElementById('energyPracticalValue').addEventListener('change', function() {
        currentNeeds.energyPractical = parseFloat(this.value) || 0;
        updateProgressChart();
    });
}

function updateSourceDescription(source) {
    const descDiv = document.getElementById('sourceDescription');
    
    const descriptions = {
        manual: 'Manuel hesaplama: Standart klinik formüller kullanılarak hesaplama yapılır.',
        neyzi: 'Neyzi Referansı: Türk çocukları için geliştirilmiş yerel büyüme referans değerleri.',
        who: 'WHO Referansı: Dünya Sağlık Örgütü tarafından belirlenen uluslararası büyüme standartları.'
    };
    
    descDiv.textContent = descriptions[source] || '';
}


async function updatePercentileTablesPreview() {
    const birthDate = document.getElementById('birthDate').value;
    const genderInput = document.querySelector('input[name="gender"]:checked');
    
    if (!birthDate || !genderInput) {
        // Bilgiler eksikse tabloları gizle
        document.getElementById('neyziTablesPreview').innerHTML = '<p style="color: #666; font-style: italic;">Lütfen doğum tarihi ve cinsiyet bilgilerini girin.</p>';
        document.getElementById('whoTablesPreview').innerHTML = '<p style="color: #666; font-style: italic;">Lütfen doğum tarihi ve cinsiyet bilgilerini girin.</p>';
        return;
    }
    
    const gender = genderInput.value;
    const ageData = calculateAge(birthDate);
    const ageInMonths = (ageData.years * 12) + ageData.months;
    const ageInDays = calculateAgeInDays(birthDate);
    
    // Çocuğun boy ve kilo değerlerini al
    const currentHeight = parseFloat(document.getElementById('height').value) || null;
    const currentWeight = parseFloat(document.getElementById('weight').value) || null;
    
    // Neyzi verilerini al (aylık bazda)
    const neyziData = gender === 'male' ? REFERENCE_DATA.neyzi_male : REFERENCE_DATA.neyzi_female;
    
    // En yakın yaş satırlarını bul - Neyzi için
    const neyziWeightRow = findClosestRow(neyziData.weight, ageInMonths);
    const neyziHeightRow = findClosestRow(neyziData.height, ageInMonths);
    
    // Neyzi tablosunu göster
    displayComparisonTable('neyziTablesPreview', 'Neyzi', neyziWeightRow, neyziHeightRow, gender, ageData, currentHeight, currentWeight);
    
    // WHO verilerini yükle ve göster (günlük bazda)
    await loadAndDisplayWHOData(gender, ageInDays, ageData, currentHeight, currentWeight);
}

function findClosestRow(data, ageInMonths) {
    if (!data || data.length === 0) return null;
    
    return data.reduce((prev, curr) => {
        return Math.abs(curr.months - ageInMonths) < Math.abs(prev.months - ageInMonths) ? curr : prev;
    });
}

// WHO verilerini yükle ve göster
async function loadAndDisplayWHOData(gender, ageInDays, ageData, currentHeight, currentWeight) {
    const container = document.getElementById('whoTablesPreview');
    if (!container) return;
    
    // WHO verileri 0-1856 gün (0-5 yaş) için geçerli
    if (ageInDays > 1856) {
        container.innerHTML = '<p style="color: #666; font-style: italic; padding: 20px; text-align: center;">WHO verileri 0-5 yaş arası için mevcuttur. Bu yaş için Neyzi referanslarını kullanın.</p>';
        return;
    }
    
    // Yükleniyor mesajı
    container.innerHTML = '<p style="color: #666; font-style: italic; padding: 20px; text-align: center;">WHO verileri yükleniyor...</p>';
    
    try {
        // WHO verilerini yükle
        await loadWHOPercentileData();
        
        if (!WHO_PERCENTILE_DATA.loaded) {
            container.innerHTML = '<p style="color: #e53935; font-style: italic; padding: 20px; text-align: center;">WHO verileri yüklenemedi. Lütfen uygulamayı HTTP sunucusu ile çalıştırın.</p>';
            return;
        }
        
        // Günlük bazda WHO verilerini al
        const whoData = gender === 'male' ? WHO_PERCENTILE_DATA.boys : WHO_PERCENTILE_DATA.girls;
        
        // Boy verisi için kayıt bul
        let heightRecord = whoData.height.find(r => r.Day === ageInDays);
        if (!heightRecord) {
            heightRecord = whoData.height.reduce((prev, curr) => 
                Math.abs(curr.Day - ageInDays) < Math.abs(prev.Day - ageInDays) ? curr : prev
            );
        }
        
        // Ağırlık verisi için kayıt bul
        let weightRecord = whoData.weight.find(r => r.Age === ageInDays);
        if (!weightRecord) {
            weightRecord = whoData.weight.reduce((prev, curr) => 
                Math.abs(curr.Age - ageInDays) < Math.abs(prev.Age - ageInDays) ? curr : prev
            );
        }
        
        if (!heightRecord || !weightRecord) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Bu yaş için WHO verisi bulunamadı.</p>';
            return;
        }
        
        // WHO verilerini göster (hem boy hem ağırlık)
        displayWHOComparisonTable(container, heightRecord, weightRecord, gender, ageData, ageInDays, currentHeight, currentWeight);
        
    } catch (error) {
        console.error('WHO verileri yüklenirken hata:', error);
        container.innerHTML = '<p style="color: #e53935; font-style: italic; padding: 20px; text-align: center;">WHO verileri yüklenirken hata oluştu.</p>';
    }
}

// Değerin hangi persentil aralığına denk geldiğini bul
function findPercentileRange(value, percentiles) {
    if (!value || !percentiles) return null;
    
    const ranges = [
        { min: -Infinity, max: percentiles.P3, label: '<P3' },
        { min: percentiles.P3, max: percentiles.P10, label: 'P3-P10' },
        { min: percentiles.P10, max: percentiles.P25, label: 'P10-P25' },
        { min: percentiles.P25, max: percentiles.P50, label: 'P25-P50' },
        { min: percentiles.P50, max: percentiles.P75, label: 'P50-P75' },
        { min: percentiles.P75, max: percentiles.P90, label: 'P75-P90' },
        { min: percentiles.P90, max: percentiles.P97, label: 'P90-P97' },
        { min: percentiles.P97, max: Infinity, label: '>P97' }
    ];
    
    for (let range of ranges) {
        if (value >= range.min && value < range.max) {
            return range.label;
        }
    }
    
    return null;
}

// WHO verilerini tablo olarak göster (Boy ve Ağırlık)
function displayWHOComparisonTable(container, heightRecord, weightRecord, gender, ageData, ageInDays, currentHeight, currentWeight) {
    const genderText = gender === 'male' ? 'Erkek' : 'Kadın';
    
    // Persentil aralıklarını bul
    const weightRange = currentWeight ? findPercentileRange(currentWeight, weightRecord) : null;
    const heightRange = currentHeight ? findPercentileRange(currentHeight, heightRecord) : null;
    
    let html = '<div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">';
    html += `<div style="padding: 12px 15px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-bottom: 2px solid #66BB6A;">`;
    html += `<strong style="color: #2E7D32;">👤 ${genderText}</strong> | `;
    html += `<strong style="color: #2E7D32;">📅 ${ageData.formatted}</strong> `;
    html += `<span style="color: #666;">(${ageInDays} gün - WHO Günlük Veri)</span>`;
    html += '</div>';
    
    // Ağırlık Tablosu
    html += '<h4 style="margin: 15px 15px 10px 15px; color: #2E7D32; font-size: 1em; font-weight: 600;">⚖️ Ağırlık (kg) - WHO Günlük Persentil</h4>';
    if (currentWeight && weightRange) {
        html += `<p style="margin: 5px 15px 10px 15px; color: #f57c00; font-weight: 600; font-size: 0.9em;">Çocuğun ağırlığı: ${currentWeight} kg → ${weightRange}</p>`;
    }
    html += '<table class="preview-table" style="margin: 0 15px 15px 15px; width: calc(100% - 30px);">';
    html += '<thead><tr>';
    html += '<th>P3</th><th>P10</th><th>P25</th><th>P50</th><th>P75</th><th>P90</th><th>P97</th>';
    html += '</tr></thead><tbody><tr>';
    
    // Ağırlık hücrelerini highlight ile göster
    const weightPercentiles = ['P3', 'P10', 'P25', 'P50', 'P75', 'P90', 'P97'];
    weightPercentiles.forEach(p => {
        const value = weightRecord[p]?.toFixed(2) || '-';
        const isHighlight = currentWeight && weightRange && weightRange.includes(p);
        html += `<td${isHighlight ? ' class="percentile-highlight"' : ''}>${value}</td>`;
    });
    
    html += '</tr></tbody></table>';
    
    // Boy Tablosu
    html += '<h4 style="margin: 15px 15px 10px 15px; color: #2E7D32; font-size: 1em; font-weight: 600;">📏 Boy (cm) - WHO Günlük Persentil</h4>';
    if (currentHeight && heightRange) {
        html += `<p style="margin: 5px 15px 10px 15px; color: #f57c00; font-weight: 600; font-size: 0.9em;">Çocuğun boyu: ${currentHeight} cm → ${heightRange}</p>`;
    }
    html += '<table class="preview-table" style="margin: 0 15px 15px 15px; width: calc(100% - 30px);">';
    html += '<thead><tr>';
    html += '<th>P3</th><th>P10</th><th>P25</th><th>P50</th><th>P75</th><th>P90</th><th>P97</th>';
    html += '</tr></thead><tbody><tr>';
    
    // Boy hücrelerini highlight ile göster
    const heightPercentiles = ['P3', 'P10', 'P25', 'P50', 'P75', 'P90', 'P97'];
    heightPercentiles.forEach(p => {
        const value = heightRecord[p]?.toFixed(1) || '-';
        const isHighlight = currentHeight && heightRange && heightRange.includes(p);
        html += `<td${isHighlight ? ' class="percentile-highlight"' : ''}>${value}</td>`;
    });
    
    html += '</tr></tbody></table>';
    
    html += '</div>';
    
    container.innerHTML = html;
}

function displayComparisonTable(containerId, sourceName, weightRow, heightRow, gender, ageData, currentHeight, currentWeight) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!weightRow || !heightRow) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">Bu yaş için veri bulunamadı.</p>';
        return;
    }
    
    const genderText = gender === 'male' ? 'Erkek' : 'Kadın';
    
    // Neyzi için persentil aralıklarını bul
    const weightPercentiles = {
        P3: parseFloat(weightRow.p3),
        P10: parseFloat(weightRow.p10),
        P25: parseFloat(weightRow.p25),
        P50: parseFloat(weightRow.p50),
        P75: parseFloat(weightRow.p75),
        P90: parseFloat(weightRow.p90),
        P97: parseFloat(weightRow.p97)
    };
    
    const heightPercentiles = {
        P3: parseFloat(heightRow.p3),
        P10: parseFloat(heightRow.p10),
        P25: parseFloat(heightRow.p25),
        P50: parseFloat(heightRow.p50),
        P75: parseFloat(heightRow.p75),
        P90: parseFloat(heightRow.p90),
        P97: parseFloat(heightRow.p97)
    };
    
    const weightRange = currentWeight ? findPercentileRange(currentWeight, weightPercentiles) : null;
    const heightRange = currentHeight ? findPercentileRange(currentHeight, heightPercentiles) : null;
    
    let html = '<div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">';
    html += `<div style="padding: 12px 15px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-bottom: 2px solid #66BB6A;">`;
    html += `<strong style="color: #2E7D32;">👤 ${genderText}</strong> | `;
    html += `<strong style="color: #2E7D32;">📅 ${ageData.formatted}</strong> <span style="color: #666;">(${weightRow.age})</span>`;
    html += '</div>';
    
    // Ağırlık Tablosu
    html += '<h4 style="margin: 15px 15px 10px 15px; color: #2E7D32; font-size: 1em; font-weight: 600;">⚖️ Ağırlık (kg)</h4>';
    if (currentWeight && weightRange) {
        html += `<p style="margin: 5px 15px 10px 15px; color: #f57c00; font-weight: 600; font-size: 0.9em;">Çocuğun ağırlığı: ${currentWeight} kg → ${weightRange}</p>`;
    }
    html += '<table class="preview-table" style="margin: 0 15px 15px 15px; width: calc(100% - 30px);">';
    html += '<thead><tr>';
    html += '<th>P3</th><th>P10</th><th>P25</th><th>P50</th><th>P75</th><th>P90</th><th>P97</th>';
    html += '</tr></thead><tbody><tr>';
    
    // Ağırlık hücrelerini highlight ile göster
    const weightCols = ['p3', 'p10', 'p25', 'p50', 'p75', 'p90', 'p97'];
    const weightLabels = ['P3', 'P10', 'P25', 'P50', 'P75', 'P90', 'P97'];
    weightCols.forEach((col, idx) => {
        const value = weightRow[col];
        const isHighlight = currentWeight && weightRange && weightRange.includes(weightLabels[idx]);
        html += `<td${isHighlight ? ' class="percentile-highlight"' : ''}>${value}</td>`;
    });
    
    html += '</tr></tbody></table>';
    
    // Boy Tablosu
    html += '<h4 style="margin: 15px 15px 10px 15px; color: #2E7D32; font-size: 1em; font-weight: 600;">📏 Boy (cm)</h4>';
    if (currentHeight && heightRange) {
        html += `<p style="margin: 5px 15px 10px 15px; color: #f57c00; font-weight: 600; font-size: 0.9em;">Çocuğun boyu: ${currentHeight} cm → ${heightRange}</p>`;
    }
    html += '<table class="preview-table" style="margin: 0 15px 15px 15px; width: calc(100% - 30px);">';
    html += '<thead><tr>';
    html += '<th>P3</th><th>P10</th><th>P25</th><th>P50</th><th>P75</th><th>P90</th><th>P97</th>';
    html += '</tr></thead><tbody><tr>';
    
    // Boy hücrelerini highlight ile göster
    const heightCols = ['p3', 'p10', 'p25', 'p50', 'p75', 'p90', 'p97'];
    const heightLabels = ['P3', 'P10', 'P25', 'P50', 'P75', 'P90', 'P97'];
    heightCols.forEach((col, idx) => {
        const value = heightRow[col];
        const isHighlight = currentHeight && heightRange && heightRange.includes(heightLabels[idx]);
        html += `<td${isHighlight ? ' class="percentile-highlight"' : ''}>${value}</td>`;
    });
    
    html += '</tr></tbody></table>';
    
    html += '</div>';
    
    container.innerHTML = html;
}
