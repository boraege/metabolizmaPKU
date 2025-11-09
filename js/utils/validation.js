// Validation Utility Functions
function validatePersonalInfo() {
    const patientName = document.getElementById('patientName').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const gender = document.querySelector('input[name="gender"]:checked');
    
    const errors = [];
    
    if (!patientName) errors.push('Ad Soyad giriniz');
    if (!birthDate) errors.push('Doğum tarihi giriniz');
    if (!height || height <= 0) errors.push('Geçerli bir boy değeri giriniz');
    if (!weight || weight <= 0) errors.push('Geçerli bir kilo değeri giriniz');
    if (!gender) errors.push('Cinsiyet seçiniz');
    
    if (errors.length > 0) {
        alert('Lütfen aşağıdaki alanları doldurun:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

function showWarning(message, type = 'warning') {
    const warningBox = document.getElementById('referenceWarning');
    warningBox.innerHTML = `<strong>${type === 'error' ? 'Hata' : 'Uyarı'}:</strong> ${message}`;
    warningBox.style.display = 'block';
    
    if (type === 'error') {
        warningBox.style.borderColor = '#f44336';
        warningBox.style.background = '#ffebee';
    }
}

function hideWarning() {
    const warningBox = document.getElementById('referenceWarning');
    warningBox.style.display = 'none';
}

function validateGrowth(height, weight, referenceRow, source, gender) {
    const warnings = [];
    let heightAgeRow = null;
    
    if (!referenceRow) {
        return { warnings, heightAgeRow: null };
    }
    
    // Check weight percentile
    const weightP3 = referenceRow.p3;
    const weightP97 = referenceRow.p97;
    
    if (weight < weightP3) {
        warnings.push({
            type: 'Düşük Kilo',
            message: `Kilo P3'ün altında (${weightP3} kg). Malnütrisyon riski var.`,
            critical: true
        });
    } else if (weight > weightP97) {
        warnings.push({
            type: 'Yüksek Kilo',
            message: `Kilo P97'nin üstünde (${weightP97} kg). Obezite riski var.`,
            critical: true
        });
    }
    
    // Check height percentile
    const dataKey = gender === 'male' ? 
        (source === 'who' ? 'who_male' : 'neyzi_male') : 
        (source === 'who' ? 'who_female' : 'neyzi_female');
    const heightData = REFERENCE_DATA[dataKey].height;
    const heightRow = heightData.find(h => h.months === referenceRow.months);
    
    if (heightRow) {
        const heightP3 = heightRow.p3;
        const heightP97 = heightRow.p97;
        
        if (height < heightP3) {
            warnings.push({
                type: 'Düşük Boy',
                message: `Boy P3'ün altında (${heightP3} cm). Boy kısalığı var.`,
                critical: true
            });
            
            // Find the age where this height corresponds to P50
            heightAgeRow = findHeightAgeRow(height, source, gender);
            
            if (heightAgeRow) {
                warnings.push({
                    type: 'Boy Yaşı Uyarısı',
                    message: `Bu boy değeri (${height} cm), ${heightAgeRow.age} yaşının P50 değerine denk gelmektedir. Beslenme hesaplamaları boy yaşına göre yapılacaktır.`,
                    critical: false
                });
            }
        } else if (height > heightP97) {
            warnings.push({
                type: 'Yüksek Boy',
                message: `Boy P97'nin üstünde (${heightP97} cm).`,
                critical: false
            });
        }
    }
    
    return { warnings, heightAgeRow };
}

function findHeightAgeRow(targetHeight, source, gender) {
    // Find the age where the target height corresponds to P50
    const dataKey = gender === 'male' ? 
        (source === 'who' ? 'who_male' : 'neyzi_male') : 
        (source === 'who' ? 'who_female' : 'neyzi_female');
    
    const heightData = REFERENCE_DATA[dataKey].height;
    
    if (!heightData) {
        console.warn('Height data not found for', dataKey);
        return null;
    }
    
    // Find the row where P50 is closest to target height
    let closestRow = null;
    let minDiff = Infinity;
    
    heightData.forEach(row => {
        const diff = Math.abs(row.p50 - targetHeight);
        if (diff < minDiff) {
            minDiff = diff;
            closestRow = row;
        }
    });
    
    // Only return if difference is less than 3 cm (reasonable tolerance)
    if (closestRow && minDiff < 3) {
        console.log(`Boy yaşı bulundu: ${closestRow.age} (${closestRow.months} ay) - P50: ${closestRow.p50} cm`);
        return closestRow;
    }
    
    console.warn(`Boy yaşı bulunamadı. Hedef boy: ${targetHeight} cm, En yakın fark: ${minDiff} cm`);
    return null;
}
