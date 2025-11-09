// Daily Needs Calculation Handler
// Make currentNeeds globally accessible for PDF export
window.currentNeeds = window.currentNeeds || {
    bmr: 0,
    energyRef: 0,
    energyPractical: 0,
    protein: 0,
    phenylalanine: 0
};
let currentNeeds = window.currentNeeds;

function updateDailyNeeds() {
    if (!validatePersonalInfo()) {
        return;
    }
    
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const source = document.querySelector('.tab-button.active').dataset.source;
    
    const ageData = calculateAge(birthDate);
    
    // Find reference row from selected source
    const refLookup = findReferenceRow(source, gender, ageData);
    
    // Validate growth and check for warnings
    let effectiveAgeData = ageData;
    let effectiveRefRow = refLookup.row;
    let heightAgeRow = null;
    
    if (refLookup.found) {
        const validation = validateGrowth(height, weight, refLookup.row, source, gender);
        
        // Display warnings if any
        if (validation.warnings.length > 0) {
            displayWarnings(validation.warnings);
            
            // If height-age adjustment is needed, use height-age for calculations
            if (validation.heightAgeRow) {
                heightAgeRow = validation.heightAgeRow;
                
                // Use height-age for nutrition calculations
                const heightAgeInYears = validation.heightAgeRow.months / 12;
                effectiveAgeData = {
                    years: Math.floor(heightAgeInYears),
                    months: validation.heightAgeRow.months,
                    days: 0
                };
                
                // Also update the reference row to use height-age row
                effectiveRefRow = validation.heightAgeRow;
                
                console.log('Boy yaşı kullanılarak hesaplama yapılıyor:', effectiveAgeData);
                console.log('Boy yaşı referans satırı:', effectiveRefRow);
            }
        }
    }
    
    // Calculate current percentiles for user's weight and height
    let currentPercentiles = null;
    if (refLookup.found) {
        currentPercentiles = calculateCurrentPercentiles(weight, height, refLookup, source, gender, ageData, heightAgeRow);
    }
    
    // Display reference values from percentile table (with height-age if applicable)
    displayReferenceValues(refLookup, source, gender, ageData, heightAgeRow, weight, height, currentPercentiles);
    
    const ageCategory = getAgeCategory(effectiveAgeData.years || (effectiveAgeData.months / 12));
    
    // Calculate BMR
    currentNeeds.bmr = calculateBMR(weight, height, effectiveAgeData.years || (effectiveAgeData.months / 12), gender, source);
    
    // Calculate Energy Needs
    currentNeeds.energyRef = calculateEnergyNeeds(weight, ageCategory);
    currentNeeds.energyPractical = currentNeeds.energyRef;
    
    // Calculate Protein Needs
    currentNeeds.protein = calculateProteinNeeds(weight, ageCategory);
    
    // Calculate Phenylalanine
    currentNeeds.phenylalanine = calculatePhenylalanine(currentNeeds.protein);
    
    // Display results with tooltips
    const bmrElement = document.getElementById('bmrValue');
    bmrElement.textContent = currentNeeds.bmr;
    bmrElement.title = `BMR Hesaplama:\nSchofield formülü kullanılarak hesaplanmıştır.\nKilo: ${weight}kg, Boy: ${height}cm, Yaş: ${effectiveAgeData.years || (effectiveAgeData.months / 12).toFixed(1)} yıl`;
    
    const energyElement = document.getElementById('energyRefValue');
    energyElement.textContent = currentNeeds.energyRef;
    energyElement.title = `Enerji Hesaplama:\n${weight}kg × ${(currentNeeds.energyRef / weight).toFixed(0)} kcal/kg = ${currentNeeds.energyRef} kcal\nYaş kategorisi: ${ageCategory}`;
    
    const energyPracticalElement = document.getElementById('energyPracticalValue');
    energyPracticalElement.value = currentNeeds.energyPractical;
    
    const proteinElement = document.getElementById('proteinValue');
    proteinElement.textContent = currentNeeds.protein.toFixed(1);
    proteinElement.title = `Protein Hesaplama:\n${weight}kg × ${(currentNeeds.protein / weight).toFixed(2)} g/kg = ${currentNeeds.protein.toFixed(1)} g\nYaş kategorisi: ${ageCategory}`;
    
    const pheElement = document.getElementById('pheValue');
    pheElement.textContent = currentNeeds.phenylalanine;
    pheElement.title = `Fenilalanin Hesaplama:\n${currentNeeds.protein.toFixed(1)}g protein × 50 mg/g = ${currentNeeds.phenylalanine} mg\n(Protein başına 50mg FA)`;
    
    // Update nutrition reference table (show if using height-age)
    displayNutritionReference(ageCategory, heightAgeRow !== null);
    
    // Update progress chart
    updateProgressChart();
}

function displayWarnings(warnings) {
    // Create or update warnings container
    let warningsDiv = document.getElementById('growth-warnings');
    if (!warningsDiv) {
        warningsDiv = document.createElement('div');
        warningsDiv.id = 'growth-warnings';
        warningsDiv.style.cssText = 'margin: 15px 0; padding: 15px; border-radius: 8px; background: #fff3cd; border-left: 4px solid #ffc107;';
        
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.insertBefore(warningsDiv, resultsSection.firstChild);
        }
    }
    
    let html = '<h4 style="margin-top: 0; color: #856404;">⚠️ Uyarılar</h4>';
    warnings.forEach(warning => {
        const icon = warning.critical ? '🔴' : '⚠️';
        html += `<p style="margin: 8px 0; color: #856404;"><strong>${icon} ${warning.type}:</strong> ${warning.message}</p>`;
    });
    
    warningsDiv.innerHTML = html;
    warningsDiv.style.display = 'block';
}

function findReferenceRow(source, gender, ageData) {
    if (source === 'manual') {
        return { found: false, row: null, source: 'manual' };
    }
    
    // WHO veya Neyzi kaynağına göre veri seç
    const dataKey = gender === 'male' ? 
        (source === 'who' ? 'who_male' : 'neyzi_male') : 
        (source === 'who' ? 'who_female' : 'neyzi_female');
    
    const data = REFERENCE_DATA[dataKey];
    
    if (!data || !data.weight) {
        console.warn(`Referans verisi bulunamadı: ${dataKey}`);
        return { found: false, row: null, source };
    }
    
    // Find closest age match
    const ageInMonths = (ageData.years * 12) + ageData.months;
    const closestRow = data.weight.reduce((prev, curr) => {
        return Math.abs(curr.months - ageInMonths) < Math.abs(prev.months - ageInMonths) ? curr : prev;
    });
    
    console.log(`Referans satırı bulundu: ${closestRow.age} (${closestRow.months} ay)`);
    return { found: true, row: closestRow, source };
}

function calculateCurrentPercentiles(weight, height, refLookup, source, gender, ageData, heightAgeRow = null) {
    const dataKey = gender === 'male' ? 
        (source === 'who' ? 'who_male' : 'neyzi_male') : 
        (source === 'who' ? 'who_female' : 'neyzi_female');
    
    const weightData = REFERENCE_DATA[dataKey].weight;
    const heightData = REFERENCE_DATA[dataKey].height;
    
    const weightRow = refLookup.row;
    const heightRow = heightAgeRow ? 
        (heightData.find(h => h.months === heightAgeRow.months) || heightAgeRow) : 
        (heightData.find(h => h.months === refLookup.row.months) || refLookup.row);
    
    // Find which percentile the current weight falls into
    const weightPercentile = findPercentile(weight, weightRow);
    const heightPercentile = findPercentile(height, heightRow);
    
    return {
        weight: weightPercentile,
        height: heightPercentile,
        weightRow: weightRow,
        heightRow: heightRow
    };
}

function findPercentile(value, row) {
    const percentiles = [
        { name: 'P3', value: parseFloat(row.p3), percentile: 3 },
        { name: 'P10', value: parseFloat(row.p10), percentile: 10 },
        { name: 'P25', value: parseFloat(row.p25), percentile: 25 },
        { name: 'P50', value: parseFloat(row.p50), percentile: 50 },
        { name: 'P75', value: parseFloat(row.p75), percentile: 75 },
        { name: 'P90', value: parseFloat(row.p90), percentile: 90 },
        { name: 'P97', value: parseFloat(row.p97), percentile: 97 }
    ];
    
    // If below P3
    if (value < percentiles[0].value) {
        return { name: '<P3', percentile: 3, exact: false, below: true };
    }
    
    // If above P97
    if (value > percentiles[percentiles.length - 1].value) {
        return { name: '>P97', percentile: 97, exact: false, above: true };
    }
    
    // Find exact match or range
    for (let i = 0; i < percentiles.length; i++) {
        if (Math.abs(value - percentiles[i].value) < 0.1) {
            return { name: percentiles[i].name, percentile: percentiles[i].percentile, exact: true };
        }
        
        if (i < percentiles.length - 1 && value > percentiles[i].value && value < percentiles[i + 1].value) {
            // Interpolate
            const range = percentiles[i + 1].value - percentiles[i].value;
            const position = value - percentiles[i].value;
            const percentileRange = percentiles[i + 1].percentile - percentiles[i].percentile;
            const interpolated = percentiles[i].percentile + (position / range) * percentileRange;
            
            return { 
                name: `~P${Math.round(interpolated)}`, 
                percentile: Math.round(interpolated), 
                exact: false,
                between: `${percentiles[i].name}-${percentiles[i + 1].name}`
            };
        }
    }
    
    return { name: 'P50', percentile: 50, exact: false };
}

function displayReferenceValues(refLookup, source, gender, ageData, heightAgeRow = null, currentWeight = null, currentHeight = null, currentPercentiles = null) {
    const tableDiv = document.getElementById('referenceTable');
    const warningDiv = document.getElementById('referenceWarning');
    
    if (!refLookup.found || source === 'manual') {
        tableDiv.innerHTML = '<p style="color: #666; font-style: italic;">Manuel hesaplama seçildiğinde persentil tablosu gösterilmez.</p>';
        if (warningDiv) warningDiv.style.display = 'none';
        return;
    }
    
    const isUsingHeightAge = heightAgeRow !== null;
    
    // Kaynak ve cinsiyete göre doğru veri setini seç
    const dataKey = gender === 'male' ? 
        (source === 'who' ? 'who_male' : 'neyzi_male') : 
        (source === 'who' ? 'who_female' : 'neyzi_female');
    
    const weightData = REFERENCE_DATA[dataKey].weight;
    const heightData = REFERENCE_DATA[dataKey].height;
    
    // For weight: always use chronological age
    const weightRow = refLookup.row;
    
    // For height: use height-age if available, otherwise chronological age
    const heightRow = isUsingHeightAge ? 
        (heightData.find(h => h.months === heightAgeRow.months) || heightAgeRow) : 
        (heightData.find(h => h.months === refLookup.row.months) || refLookup.row);
    
    // Create table
    let html = '<div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">';
    html += `<strong>📊 Kaynak:</strong> ${source === 'who' ? 'WHO (Dünya Sağlık Örgütü)' : 'Neyzi (Türkiye Referansı)'} | `;
    html += `<strong>👤 Yaş:</strong> ${weightRow.age}`;
    if (isUsingHeightAge) {
        html += ` <span style="background: #fff3cd; padding: 2px 8px; border-radius: 4px; font-size: 12px;">📏 Boy Yaşı Kullanılıyor</span>`;
    }
    html += ` | <strong>⚥ Cinsiyet:</strong> ${gender === 'male' ? 'Erkek' : 'Kız'}`;
    html += '</div>';
    
    html += '<table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
    html += '<thead><tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">Metrik</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">P3</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">P10</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">P25</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd; background: rgba(76, 175, 80, 0.3);">P50 (Medyan)</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">P75</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">P90</th>';
    html += '<th style="padding: 12px; border: 1px solid #ddd;">P97</th>';
    html += '</tr></thead><tbody>';
    
    // Weight row - always use chronological age
    html += '<tr style="background: white;">';
    html += '<td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">⚖️ Ağırlık (kg)</td>';
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${weightRow.p3}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${weightRow.p10}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${weightRow.p25}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #e8f5e9; font-weight: bold;">${weightRow.p50}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${weightRow.p75}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${weightRow.p90}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${weightRow.p97}</td>`;
    html += '</tr>';
    
    // Height row - use height-age if available
    html += '<tr style="background: #fafafa;">';
    html += '<td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">📏 Boy (cm)';
    if (isUsingHeightAge) {
        html += ` <span style="font-size: 11px; color: #856404;">(${heightRow.age})</span>`;
    }
    html += '</td>';
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${heightRow.p3}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${heightRow.p10}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${heightRow.p25}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #e8f5e9; font-weight: bold;">${heightRow.p50}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${heightRow.p75}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${heightRow.p90}</td>`;
    html += `<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${heightRow.p97}</td>`;
    html += '</tr>';
    
    html += '</tbody></table>';
    
    html += '<div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 4px; font-size: 14px;">';
    html += '<strong>ℹ️ Bilgi:</strong> P50 (medyan) değeri, aynı yaş ve cinsiyetteki çocukların %50\'sinin bu değerde olduğunu gösterir. ';
    html += 'P3-P97 arası normal kabul edilir.';
    html += '</div>';
    
    // Display current percentiles and selection
    if (currentPercentiles && currentWeight && currentHeight) {
        html += '<div style="margin-top: 15px; padding: 15px; background: #fff9e6; border: 2px solid #ffc107; border-radius: 8px;">';
        html += '<h4 style="margin-top: 0; color: #856404;">📊 Mevcut Değerleriniz</h4>';
        
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">';
        
        // Weight info
        html += '<div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #2196F3;">';
        html += `<div style="font-weight: bold; margin-bottom: 5px;">⚖️ Ağırlık: ${currentWeight} kg</div>`;
        html += `<div style="font-size: 18px; color: #2196F3; font-weight: bold;">${currentPercentiles.weight.name}</div>`;
        if (currentPercentiles.weight.between) {
            html += `<div style="font-size: 12px; color: #666;">${currentPercentiles.weight.between} arasında</div>`;
        }
        html += '</div>';
        
        // Height info
        html += '<div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #66BB6A;">';
        html += `<div style="font-weight: bold; margin-bottom: 5px;">📏 Boy: ${currentHeight} cm</div>`;
        html += `<div style="font-size: 18px; color: #66BB6A; font-weight: bold;">${currentPercentiles.height.name}</div>`;
        if (currentPercentiles.height.between) {
            html += `<div style="font-size: 12px; color: #666;">${currentPercentiles.height.between} arasında</div>`;
        }
        html += '</div>';
        
        html += '</div>';
        
        // Percentile selection for calculations
        html += '<div style="padding: 15px; background: white; border-radius: 4px; margin-top: 10px;">';
        html += '<h5 style="margin-top: 0; color: #333;">🎯 Hesaplamalar İçin Persentil Seçimi</h5>';
        html += '<p style="margin: 10px 0; font-size: 14px; color: #666;">Beslenme hesaplamalarında hangi persentil değerini kullanmak istersiniz?</p>';
        
        html += '<div style="display: flex; gap: 10px; flex-wrap: wrap;">';
        const percentileOptions = [
            { value: 3, label: 'P3' },
            { value: 10, label: 'P10' },
            { value: 25, label: 'P25' },
            { value: 50, label: 'P50 (Önerilen)', recommended: true },
            { value: 75, label: 'P75' },
            { value: 90, label: 'P90' },
            { value: 97, label: 'P97' }
        ];
        
        percentileOptions.forEach(option => {
            const savedPercentile = localStorage.getItem('selectedPercentile');
            const checked = savedPercentile && parseInt(savedPercentile) === option.value ? 'checked' : '';
            
            html += `<label style="padding: 8px 15px; border: 2px solid ${option.recommended ? '#66BB6A' : '#ddd'}; border-radius: 20px; cursor: pointer; background: ${option.recommended ? '#e8f5e9' : 'white'}; transition: all 0.3s;">`;
            html += `<input type="radio" name="percentileSelection" value="${option.value}" ${checked} style="margin-right: 5px;">`;
            html += `<span style="font-weight: ${option.recommended ? 'bold' : 'normal'};">${option.label}</span>`;
            html += '</label>';
        });
        
        html += '</div>';
        
        html += '<div style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 4px; font-size: 13px; color: #666;">';
        html += '<strong>💡 İpucu:</strong> P50 (medyan) genellikle standart hesaplamalar için önerilir. ';
        html += 'Özel durumlar için farklı persentiller seçilebilir.';
        html += '</div>';
        
        html += '</div>';
        html += '</div>';
    }
    
    tableDiv.innerHTML = html;
    
    // Add event listeners for percentile selection
    if (currentPercentiles) {
        const radioButtons = document.querySelectorAll('input[name="percentileSelection"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                localStorage.setItem('selectedPercentile', this.value);
                // Recalculate with new percentile
                updateDailyNeedsWithPercentile(parseInt(this.value));
            });
        });
    }
    
    if (warningDiv) warningDiv.style.display = 'none';
}

function updateDailyNeedsWithPercentile(selectedPercentile) {
    console.log('🔄 Persentil değiştirildi:', selectedPercentile);
    
    // Get current values
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const source = document.querySelector('.tab-button.active').dataset.source;
    
    const ageData = calculateAge(birthDate);
    const refLookup = findReferenceRow(source, gender, ageData);
    
    if (!refLookup.found) {
        console.error('❌ Referans verisi bulunamadı');
        return;
    }
    
    // Get the selected percentile weight for calculations
    const dataKey = gender === 'male' ? 
        (source === 'who' ? 'who_male' : 'neyzi_male') : 
        (source === 'who' ? 'who_female' : 'neyzi_female');
    
    const weightRow = refLookup.row;
    
    // Map percentile to row property
    const percentileMap = {
        3: 'p3', 10: 'p10', 25: 'p25', 50: 'p50', 
        75: 'p75', 90: 'p90', 97: 'p97'
    };
    
    const percentileKey = percentileMap[selectedPercentile] || 'p50';
    const referenceWeight = parseFloat(weightRow[percentileKey]);
    
    // Use reference weight for calculations instead of actual weight
    const effectiveWeight = referenceWeight;
    
    console.log(`📊 Seçilen persentil: P${selectedPercentile}, Referans ağırlık: ${effectiveWeight} kg`);
    
    // Recalculate with reference weight
    const ageCategory = getAgeCategory(ageData.years || (ageData.months / 12));
    console.log(`👶 Yaş kategorisi: ${ageCategory}`);
    
    currentNeeds.bmr = calculateBMR(effectiveWeight, height, ageData.years || (ageData.months / 12), gender, source);
    console.log(`💪 BMR: ${currentNeeds.bmr}`);
    
    currentNeeds.energyRef = calculateEnergyNeeds(effectiveWeight, ageCategory);
    console.log(`⚡ Enerji: ${currentNeeds.energyRef}`);
    
    currentNeeds.energyPractical = currentNeeds.energyRef;
    
    currentNeeds.protein = calculateProteinNeeds(effectiveWeight, ageCategory);
    console.log(`🥩 Protein: ${currentNeeds.protein}`);
    
    currentNeeds.phenylalanine = calculatePhenylalanine(currentNeeds.protein);
    console.log(`🧬 Fenilalanin: ${currentNeeds.phenylalanine}`);
    
    // Update display
    document.getElementById('bmrValue').textContent = currentNeeds.bmr;
    document.getElementById('energyRefValue').textContent = currentNeeds.energyRef;
    document.getElementById('energyPracticalValue').value = currentNeeds.energyPractical;
    document.getElementById('proteinValue').textContent = currentNeeds.protein.toFixed(1);
    document.getElementById('pheValue').textContent = currentNeeds.phenylalanine;
    
    console.log('✅ Değerler güncellendi');
    
    // Show notification
    showPercentileNotification(selectedPercentile, effectiveWeight);
    
    // Update progress chart if function exists
    if (typeof updateProgressChart === 'function') {
        updateProgressChart();
    }
}

function displayNutritionReference(activeCategory, isUsingHeightAge = false) {
    const tableDiv = document.getElementById('nutritionRefTable');
    
    if (!REFERENCE_DATA || !REFERENCE_DATA.nutritionReference) {
        console.error('REFERENCE_DATA.nutritionReference tanımlı değil');
        tableDiv.innerHTML = '<p style="color: red;">Referans tablosu yüklenemedi</p>';
        return;
    }
    
    let html = '';
    
    // Add notice if using height-age
    if (isUsingHeightAge) {
        html += '<div style="margin-bottom: 10px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">';
        html += '<strong>📏 Not:</strong> Boy yaşı kullanılarak hesaplama yapılmıştır. Aşağıdaki değerler boy yaşına göre referans değerlerdir.';
        html += '</div>';
    }
    
    html += '<table><thead><tr>';
    html += '<th>Yaş</th><th>FA (mg/kg)</th><th>Protein (g/kg)</th><th>Enerji (kcal/kg)</th>';
    html += '</tr></thead><tbody>';
    
    REFERENCE_DATA.nutritionReference.forEach(ref => {
        const isActive = ref.age === activeCategory;
        html += `<tr class="${isActive ? 'active-row' : ''}">`;
        html += `<td>${ref.age}</td>`;
        html += `<td>${ref.fa}</td>`;
        html += `<td>${ref.protein}</td>`;
        html += `<td>${ref.energy}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

function showPercentileNotification(percentile, weight) {
    // Create notification element
    let notification = document.getElementById('percentile-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'percentile-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: #66BB6A;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = `
        <strong>✓ Persentil Güncellendi</strong><br>
        <span style="font-size: 14px;">P${percentile} kullanılarak hesaplandı (${weight} kg)</span>
    `;
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function getAgeCategory(ageInYears) {
    if (ageInYears < 0.25) return '0-3 ay';
    if (ageInYears < 0.5) return '3-6 ay';
    if (ageInYears < 1) return '6-12 ay';
    if (ageInYears < 4) return '1-3 yaş';
    if (ageInYears < 7) return '4-6 yaş';
    if (ageInYears < 10) return '7-9 yaş';
    return '10+ yaş';
}
