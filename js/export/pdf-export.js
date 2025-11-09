// PDF Export Module
console.log('PDF Export module loaded');

// Make sure this function is globally accessible
window.initializePDFExport = function() {
    console.log('Initializing PDF export...');
    var button = document.getElementById('exportPDF');
    if (button) {
        button.addEventListener('click', exportToPDF);
        console.log('PDF export button connected');
    } else {
        console.error('PDF export button not found');
    }
};

function exportToPDF() {
    console.log('Exporting to PDF...');
    console.log('window.dailyIntakeList:', window.dailyIntakeList);
    console.log('window.mealSlots:', window.mealSlots);
    console.log('window.currentNeeds:', window.currentNeeds);
    
    try {
        var intakeList = window.dailyIntakeList || [];
        var meals = window.mealSlots || [];
        var needs = window.currentNeeds || {
            bmr: 0,
            energyRef: 0,
            energyPractical: 0,
            protein: 0,
            phenylalanine: 0
        };
        
        console.log('intakeList length:', intakeList.length);
        console.log('meals length:', meals.length);
        
        var hasData = intakeList.length > 0 || meals.some(function(m) {
            return m.foods && m.foods.length > 0;
        });
        
        if (!hasData) {
            var proceed = confirm('Henüz besin veya öğün eklenmemiş. Yine de rapor oluşturmak istiyor musunuz?');
            if (!proceed) return;
        }
        
        var patientNameEl = document.getElementById('patientName');
        var birthDateEl = document.getElementById('birthDate');
        var ageDisplayEl = document.getElementById('ageDisplay');
        var heightEl = document.getElementById('height');
        var weightEl = document.getElementById('weight');
        var genderEl = document.querySelector('input[name="gender"]:checked');
        
        var fullName = patientNameEl ? patientNameEl.value : 'Hasta Adı Girilmemiş';
        var birthDate = birthDateEl ? birthDateEl.value : '-';
        var ageDisplay = ageDisplayEl ? ageDisplayEl.textContent : '-';
        var height = heightEl ? heightEl.value : '-';
        var weight = weightEl ? weightEl.value : '-';
        var genderText = genderEl ? (genderEl.value === 'male' ? 'Erkek' : 'Kız') : '-';
        
        var printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            alert('Pop-up engelleyici nedeniyle PDF açılamadı. Lütfen pop-up engelleyiciyi devre dışı bırakın.');
            return;
        }
        
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        html += '<title>Metabolizma Raporu - ' + fullName + '</title>';
        html += '<style>';
        html += 'body{font-family:Arial,sans-serif;padding:20px}';
        html += 'h1{color:#667eea;border-bottom:3px solid #667eea;padding-bottom:10px}';
        html += 'h2{color:#764ba2;margin-top:30px}';
        html += 'table{width:100%;border-collapse:collapse;margin:20px 0}';
        html += 'th,td{border:1px solid #ddd;padding:10px;text-align:left}';
        html += 'th{background:#667eea;color:white}';
        html += '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}';
        html += '.info-item{padding:10px;background:#f8f9fa;border-left:3px solid #667eea}';
        html += '.meal-section{margin:20px 0;padding:15px;background:#f8f9fa;border-radius:5px}';
        html += '@media print{button{display:none}}';
        html += '</style></head><body>';
        
        html += '<h1>Metabolizma ve Beslenme Raporu</h1>';
        html += '<p><strong>Tarih:</strong> ' + new Date().toLocaleDateString('tr-TR') + '</p>';
        
        html += '<h2>Kişisel Bilgiler</h2><div class="info-grid">';
        html += '<div class="info-item"><strong>Ad Soyad:</strong> ' + fullName + '</div>';
        html += '<div class="info-item"><strong>Doğum Tarihi:</strong> ' + birthDate + '</div>';
        html += '<div class="info-item"><strong>Yaş:</strong> ' + ageDisplay + '</div>';
        html += '<div class="info-item"><strong>Cinsiyet:</strong> ' + genderText + '</div>';
        html += '<div class="info-item"><strong>Boy:</strong> ' + height + ' cm</div>';
        html += '<div class="info-item"><strong>Kilo:</strong> ' + weight + ' kg</div>';
        html += '</div>';
        
        html += '<h2>Günlük İhtiyaçlar</h2><div class="info-grid">';
        html += '<div class="info-item"><strong>BMR:</strong> ' + needs.bmr + ' kcal/gün</div>';
        html += '<div class="info-item"><strong>Enerji (Ref):</strong> ' + needs.energyRef + ' kcal</div>';
        html += '<div class="info-item"><strong>Enerji (Pratik):</strong> ' + needs.energyPractical + ' kcal</div>';
        html += '<div class="info-item"><strong>Protein:</strong> ' + needs.protein.toFixed(1) + ' g/gün</div>';
        html += '<div class="info-item"><strong>Fenilalanin:</strong> ' + needs.phenylalanine + ' mg/gün</div>';
        html += '</div>';
        
        html += '<h2>Besin Değişim Listesi</h2>';
        html += '<div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0">';
        html += '<table style="margin:0"><thead><tr>';
        html += '<th>Besin Grubu</th><th>Önerilen Porsiyon</th><th>Örnek Porsiyonlar</th>';
        html += '</tr></thead><tbody>';
        
        const exchangeGroups = [
            {
                name: 'Ekmek ve Tahıl',
                portions: '6-11 porsiyon/gün',
                examples: '1 dilim ekmek (30g), 1/2 su bardağı pirinç (75g), 1 küçük patates (100g)'
            },
            {
                name: 'Sebze',
                portions: '3-5 porsiyon/gün',
                examples: '1 su bardağı çiğ sebze (100g), 1/2 su bardağı pişmiş sebze (75g)'
            },
            {
                name: 'Meyve',
                portions: '2-4 porsiyon/gün',
                examples: '1 orta elma (150g), 1/2 su bardağı meyve suyu (120ml), 1 orta muz (100g)'
            }
        ];
        
        exchangeGroups.forEach(group => {
            html += '<tr>';
            html += '<td><strong>' + group.name + '</strong></td>';
            html += '<td>' + group.portions + '</td>';
            html += '<td style="font-size:0.9em">' + group.examples + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        html += '<h2>Günlük Besin Alımı (Toplam)</h2>';
        
        // Collect all foods from both intake list and meal slots
        var allFoods = [];
        var totals = {energy: 0, protein: 0, pa: 0};
        
        // Add foods from intake list (not yet assigned to meals)
        for (var i = 0; i < intakeList.length; i++) {
            allFoods.push(intakeList[i]);
        }
        
        // Add foods from meal slots
        for (var j = 0; j < meals.length; j++) {
            if (meals[j].foods && meals[j].foods.length > 0) {
                for (var k = 0; k < meals[j].foods.length; k++) {
                    allFoods.push(meals[j].foods[k]);
                }
            }
        }
        
        if (allFoods.length > 0) {
            html += '<table><thead><tr>';
            html += '<th>Besin</th><th>Miktar</th><th>Enerji (kcal)</th><th>Protein (g)</th><th>Fenilalanin (mg)</th>';
            html += '</tr></thead><tbody>';
            
            for (var i = 0; i < allFoods.length; i++) {
                var item = allFoods[i];
                html += '<tr>';
                html += '<td>' + item.name + '</td>';
                html += '<td>' + item.amount + 'g</td>';
                html += '<td>' + item.energy + '</td>';
                html += '<td>' + item.protein.toFixed(1) + '</td>';
                html += '<td>' + item.pa + '</td>';
                html += '</tr>';
                totals.energy += item.energy;
                totals.protein += item.protein;
                totals.pa += item.pa;
            }
            
            html += '<tr style="font-weight:bold;background:#f0f0f0">';
            html += '<td>TOPLAM</td><td>-</td>';
            html += '<td>' + totals.energy + '</td>';
            html += '<td>' + totals.protein.toFixed(1) + '</td>';
            html += '<td>' + totals.pa + '</td>';
            html += '</tr></tbody></table>';
        } else {
            html += '<p style="color:#999;font-style:italic">Henüz besin eklenmemiş.</p>';
        }
        
        html += '<h2>Öğün Planı</h2>';
        
        var hasAnyMeals = false;
        for (var j = 0; j < meals.length; j++) {
            if (meals[j].foods && meals[j].foods.length > 0) {
                hasAnyMeals = true;
                break;
            }
        }
        
        if (!hasAnyMeals) {
            html += '<p style="color:#999;font-style:italic">Henüz öğün planı oluşturulmamış.</p>';
        } else {
            // Add meal distribution summary
            html += '<div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0">';
            html += '<h3 style="color:#667eea;margin-bottom:15px">Öğün Dağılımı Özeti</h3>';
            html += '<table style="margin:0"><thead><tr>';
            html += '<th>Öğün</th><th>Enerji (kcal)</th><th>Protein (g)</th><th>Fenilalanin (mg)</th><th>Yüzde</th>';
            html += '</tr></thead><tbody>';
            
            var grandTotal = 0;
            var mealSummaries = [];
            
            for (var j = 0; j < meals.length; j++) {
                var meal = meals[j];
                if (meal.foods && meal.foods.length > 0) {
                    var mealTotals = {energy: 0, protein: 0, pa: 0};
                    for (var l = 0; l < meal.foods.length; l++) {
                        var food = meal.foods[l];
                        mealTotals.energy += food.energy;
                        mealTotals.protein += food.protein;
                        mealTotals.pa += food.pa;
                    }
                    grandTotal += mealTotals.energy;
                    mealSummaries.push({name: meal.name, totals: mealTotals});
                }
            }
            
            for (var i = 0; i < mealSummaries.length; i++) {
                var summary = mealSummaries[i];
                var percentage = grandTotal > 0 ? Math.round((summary.totals.energy / grandTotal) * 100) : 0;
                html += '<tr>';
                html += '<td><strong>' + summary.name + '</strong></td>';
                html += '<td>' + summary.totals.energy + '</td>';
                html += '<td>' + summary.totals.protein.toFixed(1) + '</td>';
                html += '<td>' + summary.totals.pa + '</td>';
                html += '<td>' + percentage + '%</td>';
                html += '</tr>';
            }
            
            html += '</tbody></table></div>';
            
            html += '<h3 style="margin-top:30px">Detaylı Öğün Planı</h3>';
            for (var k = 0; k < meals.length; k++) {
                var meal = meals[k];
                if (meal.foods && meal.foods.length > 0) {
                    var mealTotals = {energy: 0, protein: 0, pa: 0};
                    
                    html += '<div class="meal-section"><h3>' + meal.name + '</h3>';
                    html += '<table><thead><tr>';
                    html += '<th>Besin</th><th>Miktar</th><th>Enerji</th><th>Protein</th><th>Fenilalanin</th>';
                    html += '</tr></thead><tbody>';
                    
                    for (var l = 0; l < meal.foods.length; l++) {
                        var food = meal.foods[l];
                        html += '<tr>';
                        html += '<td>' + food.name + '</td>';
                        html += '<td>' + food.amount + 'g</td>';
                        html += '<td>' + food.energy + ' kcal</td>';
                        html += '<td>' + food.protein.toFixed(1) + ' g</td>';
                        html += '<td>' + food.pa + ' mg</td>';
                        html += '</tr>';
                        mealTotals.energy += food.energy;
                        mealTotals.protein += food.protein;
                        mealTotals.pa += food.pa;
                    }
                    
                    html += '<tr style="font-weight:bold;background:#f0f0f0">';
                    html += '<td>Öğün Toplamı</td><td>-</td>';
                    html += '<td>' + mealTotals.energy + ' kcal</td>';
                    html += '<td>' + mealTotals.protein.toFixed(1) + ' g</td>';
                    html += '<td>' + mealTotals.pa + ' mg</td>';
                    html += '</tr></tbody></table></div>';
                }
            }
        }
        
        html += '<div style="margin-top:30px;padding:20px;background:#f8f9fa;border-radius:8px;text-align:center">';
        html += '<button onclick="window.print()" style="padding:15px 30px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px;margin-right:10px">';
        html += '🖨️ Yazdır / PDF Olarak Kaydet</button>';
        html += '<button onclick="window.close()" style="padding:15px 30px;background:#999;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px">';
        html += '❌ Kapat</button>';
        html += '<p style="margin-top:15px;color:#666;font-size:14px">💡 PDF olarak kaydetmek için yazdır penceresinde "PDF olarak kaydet" seçeneğini seçin.</p>';
        html += '</div>';
        
        html += '<div style="margin-top:20px;padding:15px;background:#e3f2fd;border-left:4px solid #2196F3;border-radius:4px">';
        html += '<strong>ℹ️ Not:</strong> Bu rapor ' + new Date().toLocaleString('tr-TR') + ' tarihinde oluşturulmuştur.';
        html += '</div></body></html>';
        
        printWindow.document.write(html);
        printWindow.document.close();
        
        console.log('PDF export completed');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
    }
}
