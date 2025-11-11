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
        html += 'body{font-family:Arial,sans-serif;padding:15px;background:#fff;font-size:11px}';
        html += 'h1{color:#2E7D32;border-bottom:2px solid #66BB6A;padding-bottom:6px;font-size:18px;margin:10px 0;background:linear-gradient(135deg,#66BB6A 0%,#2E7D32 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}';
        html += 'h2{color:#2E7D32;margin-top:15px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #c8e6c9;font-size:14px}';
        html += 'h3{color:#2E7D32;margin-top:10px;margin-bottom:6px;font-size:12px}';
        html += 'table{width:100%;border-collapse:collapse;margin:8px 0;box-shadow:0 1px 4px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden;font-size:10px}';
        html += 'th,td{border:1px solid #c8e6c9;padding:6px 8px;text-align:left}';
        html += 'th{background:linear-gradient(135deg,#66BB6A 0%,#2E7D32 100%);color:white;font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:0.3px}';
        html += 'tr:nth-child(even){background:#f1f8e9}';
        html += 'tr:hover{background:#e8f5e9}';
        html += '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}';
        html += '.info-item{padding:8px;background:#f1f8e9;border-left:3px solid #66BB6A;border-radius:4px;box-shadow:0 1px 3px rgba(102,187,106,0.1)}';
        html += '.info-item strong{color:#2E7D32;display:block;margin-bottom:3px;font-size:9px}';
        html += '.info-item span{font-size:10px}';
        html += '.meal-section{margin:10px 0;padding:10px;background:#f1f8e9;border-radius:6px;border:1px solid #c8e6c9;box-shadow:0 1px 4px rgba(102,187,106,0.1)}';
        html += '.meal-section h3{color:#2E7D32;margin-top:0;padding-bottom:6px;border-bottom:1px solid #66BB6A}';
        html += '.page-break{page-break-before:always}';
        html += '@media print{button{display:none}body{background:#fff;padding:10px}.no-print{display:none}}';
        html += '</style></head><body>';
        
        html += '<h1>Metabolizma ve Beslenme Raporu</h1>';
        html += '<p style="margin:5px 0;font-size:10px"><strong>Tarih:</strong> ' + new Date().toLocaleDateString('tr-TR') + '</p>';
        
        html += '<h2>Kişisel Bilgiler</h2><div class="info-grid">';
        html += '<div class="info-item"><strong>Ad Soyad:</strong><span>' + fullName + '</span></div>';
        html += '<div class="info-item"><strong>Doğum Tarihi:</strong><span>' + birthDate + '</span></div>';
        html += '<div class="info-item"><strong>Yaş:</strong><span>' + ageDisplay + '</span></div>';
        html += '<div class="info-item"><strong>Cinsiyet:</strong><span>' + genderText + '</span></div>';
        html += '<div class="info-item"><strong>Boy:</strong><span>' + height + ' cm</span></div>';
        html += '<div class="info-item"><strong>Kilo:</strong><span>' + weight + ' kg</span></div>';
        html += '</div>';
        
        html += '<h2>Günlük İhtiyaçlar</h2><div class="info-grid">';
        html += '<div class="info-item"><strong>BMR:</strong><span>' + needs.bmr + ' kcal/gün</span></div>';
        html += '<div class="info-item"><strong>Enerji (Ref):</strong><span>' + needs.energyRef + ' kcal</span></div>';
        html += '<div class="info-item"><strong>Enerji (Pratik):</strong><span>' + needs.energyPractical + ' kcal</span></div>';
        html += '<div class="info-item"><strong>Protein:</strong><span>' + needs.protein.toFixed(1) + ' g/gün</span></div>';
        html += '<div class="info-item"><strong>Fenilalanin:</strong><span>' + needs.phenylalanine + ' mg/gün</span></div>';
        html += '</div>';
        
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
            // Group foods by name and sum their values
            var foodGroups = {};
            for (var i = 0; i < allFoods.length; i++) {
                var item = allFoods[i];
                if (!foodGroups[item.name]) {
                    foodGroups[item.name] = {
                        name: item.name,
                        amount: 0,
                        energy: 0,
                        protein: 0,
                        pa: 0
                    };
                }
                foodGroups[item.name].amount += item.amount;
                foodGroups[item.name].energy += item.energy;
                foodGroups[item.name].protein += item.protein;
                foodGroups[item.name].pa += item.pa;
            }
            
            html += '<table><thead><tr>';
            html += '<th>Besin</th><th>Miktar</th><th>Enerji (kcal)</th><th>Protein (g)</th><th>Fenilalanin (mg)</th>';
            html += '</tr></thead><tbody>';
            
            // Display grouped foods
            for (var foodName in foodGroups) {
                var item = foodGroups[foodName];
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
            
            html += '<tr style="font-weight:bold;background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);color:#2E7D32;border-top:3px solid #66BB6A">';
            html += '<td>TOPLAM</td><td>-</td>';
            html += '<td>' + totals.energy + '</td>';
            html += '<td>' + totals.protein.toFixed(1) + '</td>';
            html += '<td>' + totals.pa + '</td>';
            html += '</tr></tbody></table>';
        } else {
            html += '<p style="color:#999;font-style:italic;font-size:10px;margin:5px 0">Henüz besin eklenmemiş.</p>';
        }
        
        html += '<div class="page-break"></div>';
        html += '<h2>Öğün Planı</h2>';
        
        var hasAnyMeals = false;
        for (var j = 0; j < meals.length; j++) {
            if (meals[j].foods && meals[j].foods.length > 0) {
                hasAnyMeals = true;
                break;
            }
        }
        
        if (!hasAnyMeals) {
            html += '<p style="color:#999;font-style:italic;font-size:10px;margin:5px 0">Henüz öğün planı oluşturulmamış.</p>';
        } else {
            // Add meal distribution summary
            html += '<div style="background:linear-gradient(135deg,#f1f8e9 0%,#e8f5e9 100%);padding:10px;border-radius:6px;margin:10px 0;border:1px solid #c8e6c9;box-shadow:0 2px 6px rgba(102,187,106,0.15)">';
            html += '<h3 style="color:#2E7D32;margin-bottom:8px;margin-top:0;font-size:12px">Öğün Dağılımı Özeti</h3>';
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
            
            html += '<h3 style="margin-top:15px;font-size:12px">Detaylı Öğün Planı</h3>';
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
                    
                    html += '<tr style="font-weight:bold;background:linear-gradient(135deg,#fff3e0 0%,#ffe0b2 100%);color:#e65100;border-top:3px solid #ff9800">';
                    html += '<td>Öğün Toplamı</td><td>-</td>';
                    html += '<td>' + mealTotals.energy + ' kcal</td>';
                    html += '<td>' + mealTotals.protein.toFixed(1) + ' g</td>';
                    html += '<td>' + mealTotals.pa + ' mg</td>';
                    html += '</tr></tbody></table></div>';
                }
            }
        }
        
        html += '<div class="no-print" style="margin-top:20px;padding:15px;background:linear-gradient(135deg,#f1f8e9 0%,#e8f5e9 100%);border-radius:8px;text-align:center;border:1px solid #c8e6c9">';
        html += '<button onclick="window.print()" style="padding:10px 20px;background:linear-gradient(135deg,#66BB6A 0%,#2E7D32 100%);color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;margin-right:8px;font-weight:600;box-shadow:0 2px 6px rgba(102,187,106,0.3);transition:all 0.3s">';
        html += '🖨️ Yazdır / PDF Olarak Kaydet</button>';
        html += '<button onclick="window.close()" style="padding:10px 20px;background:#999;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,0.2)">';
        html += '❌ Kapat</button>';
        html += '<p style="margin-top:10px;color:#666;font-size:11px">💡 PDF olarak kaydetmek için yazdır penceresinde "PDF olarak kaydet" seçeneğini seçin.</p>';
        html += '</div>';
        
        html += '<div class="no-print" style="margin-top:15px;padding:10px;background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);border-left:3px solid #66BB6A;border-radius:4px;box-shadow:0 1px 4px rgba(102,187,106,0.2);font-size:10px">';
        html += '<strong style="color:#2E7D32">ℹ️ Not:</strong> <span style="color:#333">Bu rapor ' + new Date().toLocaleString('tr-TR') + ' tarihinde oluşturulmuştur.</span>';
        html += '</div></body></html>';
        
        printWindow.document.write(html);
        printWindow.document.close();
        
        console.log('PDF export completed');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
    }
}
