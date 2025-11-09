// Reference Lookup Utility
function findReferenceRow(source, gender, ageData) {
    // This function will look up the appropriate reference row
    // based on the selected source (WHO/Neyzi), gender, and age
    
    const warnings = [];
    let row = null;
    let heightAgeRow = null;
    
    if (!ageData || !ageData.months) {
        warnings.push({
            type: 'age',
            message: 'Yaş bilgisi eksik veya hatalı.'
        });
        return { found: false, row: null, heightAgeRow: null, warnings };
    }
    
    const ageInMonths = ageData.months;
    
    if (source === 'who') {
        // WHO verisi için gün bazlı hesaplama
        const ageInDays = Math.round(ageInMonths * 30.4375); // Ortalama ay uzunluğu
        
        // WHO veri dosyasından uygun satırı bul
        const dataSource = gender === 'male' ? 'boys_who_data.json' : 'girls_who_data.json';
        
        // WHO verisi için persentil değerlerini al
        const percentile = getWHOPercentile(gender, ageInDays, 50, 'weight');
        
        if (percentile) {
            row = {
                source: 'who',
                age: ageInDays + ' gün',
                months: ageInMonths,
                weight_p3: getWHOPercentile(gender, ageInDays, 3, 'weight'),
                weight_p50: percentile,
                weight_p97: getWHOPercentile(gender, ageInDays, 97, 'weight'),
                height_p3: getWHOPercentile(gender, ageInDays, 3, 'height'),
                height_p50: getWHOPercentile(gender, ageInDays, 50, 'height'),
                height_p97: getWHOPercentile(gender, ageInDays, 97, 'height')
            };
        }
    } else if (source === 'neyzi') {
        // Neyzi verisi için ay bazlı hesaplama
        const percentile = getNeyziPercentile(gender, ageInMonths, 50, 'weight');
        
        if (percentile) {
            row = {
                source: 'neyzi',
                age: ageInMonths + ' ay',
                months: ageInMonths,
                weight_p3: getNeyziPercentile(gender, ageInMonths, 3, 'weight'),
                weight_p50: percentile,
                weight_p97: getNeyziPercentile(gender, ageInMonths, 97, 'weight'),
                height_p3: getNeyziPercentile(gender, ageInMonths, 3, 'height'),
                height_p50: getNeyziPercentile(gender, ageInMonths, 50, 'height'),
                height_p97: getNeyziPercentile(gender, ageInMonths, 97, 'height')
            };
        }
    }
    
    if (!row) {
        warnings.push({
            type: 'data',
            message: 'Bu yaş için referans verisi bulunamadı.'
        });
    }
    
    return {
        found: row !== null,
        row: row,
        heightAgeRow: heightAgeRow,
        warnings: warnings
    };
}

function validateGrowth(height, weight, referenceRow, source, gender) {
    const warnings = [];
    let heightAgeRow = null;
    
    if (!referenceRow) {
        return { warnings, heightAgeRow };
    }
    
    // Check if height is below 3rd percentile
    if (referenceRow.height_p3 && height < referenceRow.height_p3) {
        warnings.push({
            type: 'height',
            message: 'Boy değeri 3. persentil altında. Yaş-boy uyumsuzluğu tespit edildi.'
        });
        
        // Find height-age row (where current height matches 50th percentile)
        heightAgeRow = findAgeForHeight(source, gender, height);
        
        if (heightAgeRow) {
            warnings.push({
                type: 'height-age',
                message: `Bu boy değeri ${heightAgeRow.age} yaşa karşılık gelmektedir. Boy yaşı kullanılarak hesaplama yapılacak.`
            });
        }
    }
    
    // Check if weight exceeds reference by >30%
    if (referenceRow.weight_p97) {
        const maxWeight = referenceRow.weight_p97 * 1.30;
        if (weight > maxWeight) {
            warnings.push({
                type: 'weight',
                message: 'Kilo referans aralığını %30\'dan fazla aşıyor. Lütfen Manuel hesaplama kullanın.',
                critical: true
            });
        }
    }
    
    return { warnings, heightAgeRow };
}

function findAgeForHeight(source, gender, targetHeight) {
    // Bu fonksiyon verilen boy değerine karşılık gelen yaşı bulur
    // (50. persentilde bu boya sahip olan yaş)
    
    if (source === 'who') {
        // WHO verisi için gün bazlı arama
        const dataSource = gender === 'male' ? 'boys_who_data.json' : 'girls_who_data.json';
        
        // 0-1856 gün arasında arama yap
        let closestAge = null;
        let minDiff = Infinity;
        
        for (let days = 0; days <= 1856; days += 7) { // Haftalık adımlarla ara
            const height = getWHOPercentile(gender, days, 50, 'height');
            if (height) {
                const diff = Math.abs(height - targetHeight);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestAge = days;
                }
            }
        }
        
        if (closestAge !== null && minDiff < 2) { // 2 cm tolerans
            const months = Math.round(closestAge / 30.4375);
            return {
                age: closestAge + ' gün',
                months: months,
                height_p50: getWHOPercentile(gender, closestAge, 50, 'height')
            };
        }
    } else if (source === 'neyzi') {
        // Neyzi verisi için ay bazlı arama
        let closestAge = null;
        let minDiff = Infinity;
        
        for (let months = 0; months <= 216; months++) { // 0-18 yaş
            const height = getNeyziPercentile(gender, months, 50, 'height');
            if (height) {
                const diff = Math.abs(height - targetHeight);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestAge = months;
                }
            }
        }
        
        if (closestAge !== null && minDiff < 2) { // 2 cm tolerans
            return {
                age: closestAge + ' ay',
                months: closestAge,
                height_p50: getNeyziPercentile(gender, closestAge, 50, 'height')
            };
        }
    }
    
    return null;
}
