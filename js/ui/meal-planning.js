// Meal Planning UI
// Make mealSlots globally accessible for PDF export
if (!window.mealSlots || !Array.isArray(window.mealSlots)) {
    window.mealSlots = [
        { id: 1, name: 'Sabah', foods: [] },
        { id: 2, name: 'Kuşluk', foods: [] },
        { id: 3, name: 'Öğle', foods: [] },
        { id: 4, name: 'İkindi', foods: [] },
        { id: 5, name: 'Akşam', foods: [] },
        { id: 6, name: 'Gece', foods: [] }
    ];
}
// Always use window.mealSlots directly
var mealSlots = window.mealSlots;

function initializeMealPlanning() {
    displayMealSlots();
    displayAvailableFoods();
    updateMealDistributionChart();
    
    document.getElementById('addMeal').addEventListener('click', () => {
        addCustomFood();
    });
}

function displayAvailableFoods() {
    const container = document.getElementById('availableFoodsList');
    
    if (!dailyIntakeList || dailyIntakeList.length === 0) {
        container.innerHTML = '<div class="empty-foods">Henüz besin eklenmedi. Besin seçimi bölümünden besin ekleyin.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    dailyIntakeList.forEach(item => {
        const foodDiv = document.createElement('div');
        foodDiv.className = 'available-food-item';
        foodDiv.draggable = true;
        foodDiv.dataset.itemId = item.id;
        
        foodDiv.innerHTML = `
            <div class="available-food-info">
                <h5>${item.name}</h5>
                <p class="food-amount-remaining">Kalan: <strong>${item.amount}g</strong></p>
                <p class="food-nutrition">PA: ${item.pa}mg | Prot: ${item.protein}g</p>
            </div>
            <div class="drag-indicator">⋮⋮</div>
        `;
        
        // Add drag functionality
        foodDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'intake-item',
                itemId: item.id
            }));
            foodDiv.classList.add('dragging');
        });
        
        foodDiv.addEventListener('dragend', (e) => {
            foodDiv.classList.remove('dragging');
        });
        
        container.appendChild(foodDiv);
    });
}



function displayMealSlots() {
    const container = document.getElementById('mealSlots');
    container.innerHTML = '';
    
    mealSlots.forEach((meal, index) => {
        const mealDiv = document.createElement('div');
        mealDiv.className = 'meal-slot';
        mealDiv.dataset.mealId = meal.id;
        
        mealDiv.innerHTML = `
            <div class="meal-header">
                <h4>${meal.name}</h4>
                <div class="meal-header-controls">
                    <button class="edit-meal-btn" onclick="editMealName(${meal.id})">Düzenle</button>
                    ${mealSlots.length > 1 ? `<button class="delete-meal-btn" onclick="deleteMeal(${meal.id})">Sil</button>` : ''}
                </div>
            </div>
            <div class="meal-content" id="meal-content-${meal.id}">
                ${meal.foods.length === 0 ? '<div class="empty-meal">Besin eklemek için günlük alım listesinden sürükleyin</div>' : ''}
            </div>
            <div class="meal-totals" id="meal-totals-${meal.id}"></div>
        `;
        
        // Add drop zone functionality
        const mealContent = mealDiv.querySelector('.meal-content');
        mealContent.addEventListener('dragover', handleDragOver);
        mealContent.addEventListener('drop', (e) => handleDrop(e, meal.id));
        mealContent.addEventListener('dragleave', handleDragLeave);
        
        container.appendChild(mealDiv);
        
        // Display foods in this meal
        displayMealFoods(meal);
        
        // Add insert button between meals
        if (index < mealSlots.length - 1) {
            const insertBtn = document.createElement('button');
            insertBtn.className = 'insert-meal-btn';
            insertBtn.textContent = '+ Araya Öğün Ekle';
            insertBtn.onclick = () => insertMeal(index);
            container.appendChild(insertBtn);
        }
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.closest('.meal-slot').classList.add('drop-target');
}

function handleDragLeave(e) {
    e.currentTarget.closest('.meal-slot').classList.remove('drop-target');
}

function handleDrop(e, mealId) {
    e.preventDefault();
    e.currentTarget.closest('.meal-slot').classList.remove('drop-target');
    
    try {
        // Get the dragged food data
        const dataString = e.dataTransfer.getData('text/plain');
        console.log('Drop data:', dataString);
        
        if (!dataString) {
            console.error('No data in drop event');
            return;
        }
        
        const data = JSON.parse(dataString);
        console.log('Parsed data:', data);
        
        if (data.type === 'intake-item' && data.itemId) {
            // Food dragged from daily intake list
            const intakeItem = dailyIntakeList.find(item => item.id === data.itemId);
            
            if (intakeItem) {
                // Ask for amount to add to meal
                const maxAmount = intakeItem.amount;
                const amountToAdd = prompt(
                    `${intakeItem.name} için ne kadar eklemek istersiniz?\n(Mevcut: ${maxAmount}g)`,
                    maxAmount
                );
                
                if (amountToAdd && parseFloat(amountToAdd) > 0) {
                    const amount = parseFloat(amountToAdd);
                    
                    if (amount > maxAmount) {
                        alert(`Maksimum ${maxAmount}g ekleyebilirsiniz.`);
                        return;
                    }
                    
                    // Add to meal
                    addFoodToMealFromPool(mealId, intakeItem, amount);
                    
                    // Deduct from pool
                    deductFromPool(intakeItem.id, amount);
                }
            }
        } else if (data.category && data.index !== undefined) {
            // Food dragged from food database
            const foodIndex = parseInt(data.index);
            const food = FOOD_DATABASE[data.category]?.[foodIndex];
            
            if (food) {
                const amount = prompt(`${food.name} için miktar girin (gram):`, food.amount);
                
                if (amount && parseFloat(amount) > 0) {
                    addFoodToMeal(mealId, food, parseFloat(amount));
                }
            } else {
                console.error('Besin bulunamadı:', data.category, foodIndex);
                alert('Besin bulunamadı. Lütfen tekrar deneyin.');
            }
        }
    } catch (error) {
        console.error('Drop error:', error);
        alert('Besin eklenirken bir hata oluştu');
    }
}

function addFoodToMealFromPool(mealId, intakeItem, amount) {
    const meal = mealSlots.find(m => m.id === mealId);
    if (!meal) return;
    
    // Calculate nutritional values based on amount
    const multiplier = amount / intakeItem.amount;
    
    meal.foods.push({
        id: Date.now(),
        sourceItemId: intakeItem.id, // Track source for potential return
        name: intakeItem.name,
        amount: amount,
        unit: intakeItem.unit,
        pa: Math.round(intakeItem.pa * multiplier),
        protein: Math.round(intakeItem.protein * multiplier * 10) / 10,
        energy: Math.round(intakeItem.energy * multiplier)
    });
    
    displayMealFoods(meal);
    
    // Auto-save
    if (typeof saveMealSlots === 'function') {
        saveMealSlots();
    }
}

function deductFromPool(itemId, amount) {
    const item = dailyIntakeList.find(i => i.id === itemId);
    if (!item) return;
    
    const originalAmount = item.amount;
    const newAmount = originalAmount - amount;
    
    if (newAmount <= 0) {
        // Remove item completely if nothing left
        const index = dailyIntakeList.findIndex(i => i.id === itemId);
        if (index > -1) {
            dailyIntakeList.splice(index, 1);
        }
    } else {
        // Update amount and recalculate nutritional values
        const food = FOOD_DATABASE[item.category]?.find(f => f.name === item.name);
        if (food) {
            const multiplier = newAmount / food.amount;
            item.amount = newAmount;
            item.pa = Math.round(food.pa * multiplier);
            item.protein = Math.round(food.protein * multiplier * 10) / 10;
            item.energy = Math.round(food.energy * multiplier);
        }
    }
    
    // Update displays
    if (typeof updateIntakeDisplay === 'function') {
        updateIntakeDisplay();
    }
    displayAvailableFoods();
    
    // Auto-save
    if (typeof saveDailyIntake === 'function') {
        saveDailyIntake();
    }
}

function addFoodToMeal(mealId, food, amount) {
    const meal = mealSlots.find(m => m.id === mealId);
    if (!meal) return;
    
    const multiplier = amount / food.amount;
    
    meal.foods.push({
        id: Date.now(),
        name: food.name,
        amount: amount,
        unit: food.unit,
        pa: Math.round(food.pa * multiplier),
        protein: Math.round(food.protein * multiplier * 10) / 10,
        energy: Math.round(food.energy * multiplier)
    });
    
    displayMealFoods(meal);
    
    // Auto-save
    if (typeof saveMealSlots === 'function') {
        saveMealSlots();
    }
}

function displayMealFoods(meal) {
    const contentDiv = document.getElementById(`meal-content-${meal.id}`);
    const totalsDiv = document.getElementById(`meal-totals-${meal.id}`);
    
    if (meal.foods.length === 0) {
        contentDiv.innerHTML = '<div class="empty-meal">Besin eklemek için günlük alım listesinden sürükleyin</div>';
        totalsDiv.innerHTML = '';
        updateMealDistributionChart();
        return;
    }
    
    contentDiv.innerHTML = '';
    meal.foods.forEach(food => {
        const foodDiv = document.createElement('div');
        foodDiv.className = 'meal-food-item';
        foodDiv.innerHTML = `
            <div class="meal-food-info">
                <h5>${food.name}</h5>
                <p>PA: ${food.pa}mg | Prot: ${food.protein}g | Enerji: ${food.energy} kcal</p>
            </div>
            <div class="meal-food-amount">${food.amount}g</div>
            <button class="remove-meal-food-btn" onclick="removeFoodFromMeal(${meal.id}, ${food.id})">×</button>
        `;
        contentDiv.appendChild(foodDiv);
    });
    
    // Calculate totals
    const totals = meal.foods.reduce((acc, food) => {
        acc.energy += food.energy;
        acc.protein += food.protein;
        acc.pa += food.pa;
        return acc;
    }, { energy: 0, protein: 0, pa: 0 });
    
    totalsDiv.innerHTML = `
        <div class="meal-total-item">
            <label>Enerji</label>
            <span>${totals.energy} kcal</span>
        </div>
        <div class="meal-total-item">
            <label>Protein</label>
            <span>${totals.protein.toFixed(1)} g</span>
        </div>
        <div class="meal-total-item">
            <label>Fenilalanin</label>
            <span>${totals.pa} mg</span>
        </div>
    `;
    
    // Update meal distribution chart
    updateMealDistributionChart();
}

function updateMealDistributionChart() {
    const canvas = document.getElementById('mealDistributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = 300 * 2;
    
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, width, height);
    
    // Calculate meal totals
    const mealData = mealSlots.map(meal => {
        const totals = meal.foods.reduce((acc, food) => {
            acc.energy += food.energy;
            acc.protein += food.protein;
            acc.pa += food.pa;
            return acc;
        }, { energy: 0, protein: 0, pa: 0 });
        
        return {
            name: meal.name,
            ...totals
        };
    }).filter(meal => meal.energy > 0);
    
    if (mealData.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Öğünlere besin eklendiğinde grafik görünecek', width/4, height/4);
        return;
    }
    
    // Draw bar chart
    const barWidth = (width / 2 - 40) / mealData.length;
    const maxEnergy = Math.max(...mealData.map(m => m.energy));
    const chartHeight = height / 2 - 80;
    
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    mealData.forEach((meal, index) => {
        const x = 20 + index * barWidth;
        const barHeight = (meal.energy / maxEnergy) * chartHeight;
        const y = chartHeight + 40 - barHeight;
        
        // Draw bar
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        // Draw value on top
        ctx.fillStyle = '#333';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(meal.energy + ' kcal', x + (barWidth - 10) / 2, y - 5);
        
        // Draw meal name
        ctx.save();
        ctx.translate(x + (barWidth - 10) / 2, chartHeight + 50);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(meal.name, 0, 0);
        ctx.restore();
    });
    
    // Draw legend
    let legendY = 20;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    mealData.forEach((meal, index) => {
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(width/2 + 10, legendY - 10, 15, 15);
        
        ctx.fillStyle = '#333';
        ctx.fillText(`${meal.name}: ${meal.energy} kcal`, width/2 + 30, legendY);
        ctx.fillText(`Prot: ${meal.protein.toFixed(1)}g, PA: ${meal.pa}mg`, width/2 + 30, legendY + 12);
        
        legendY += 35;
    });
}

function removeFoodFromMeal(mealId, foodId) {
    const meal = mealSlots.find(m => m.id === mealId);
    if (!meal) return;
    
    const food = meal.foods.find(f => f.id === foodId);
    if (!food) return;
    
    // Ask if user wants to return to pool
    const returnToPool = confirm(`${food.name} (${food.amount}g) öğünden çıkarılacak.\n\nBesin havuzuna geri eklensin mi?`);
    
    if (returnToPool && food.sourceItemId) {
        // Return to pool
        returnToPool_func(food);
    }
    
    // Remove from meal
    meal.foods = meal.foods.filter(f => f.id !== foodId);
    displayMealFoods(meal);
    
    // Auto-save
    if (typeof saveMealSlots === 'function') {
        saveMealSlots();
    }
}

function returnToPool_func(food) {
    // Check if item already exists in pool
    const existingItem = dailyIntakeList.find(item => item.id === food.sourceItemId);
    
    if (existingItem) {
        // Add back to existing item
        const originalFood = FOOD_DATABASE[existingItem.category]?.find(f => f.name === existingItem.name);
        if (originalFood) {
            const newAmount = existingItem.amount + food.amount;
            const multiplier = newAmount / originalFood.amount;
            
            existingItem.amount = newAmount;
            existingItem.pa = Math.round(originalFood.pa * multiplier);
            existingItem.protein = Math.round(originalFood.protein * multiplier * 10) / 10;
            existingItem.energy = Math.round(originalFood.energy * multiplier);
        }
    } else {
        // Create new item in pool (if original was completely used)
        // Try to find the food in database to get category
        let category = 'bread'; // default
        for (const cat in FOOD_DATABASE) {
            if (FOOD_DATABASE[cat].find(f => f.name === food.name)) {
                category = cat;
                break;
            }
        }
        
        dailyIntakeList.push({
            id: food.sourceItemId || Date.now(),
            name: food.name,
            category: category,
            amount: food.amount,
            unit: food.unit,
            pa: food.pa,
            protein: food.protein,
            energy: food.energy
        });
    }
    
    // Update displays
    if (typeof updateIntakeDisplay === 'function') {
        updateIntakeDisplay();
    }
    displayAvailableFoods();
    
    // Auto-save
    if (typeof saveDailyIntake === 'function') {
        saveDailyIntake();
    }
}

function editMealName(mealId) {
    const meal = mealSlots.find(m => m.id === mealId);
    if (meal) {
        const newName = prompt('Yeni öğün adı:', meal.name);
        if (newName) {
            meal.name = newName;
            displayMealSlots();
            
            // Auto-save
            if (typeof saveMealSlots === 'function') {
                saveMealSlots();
            }
        }
    }
}

function deleteMeal(mealId) {
    if (confirm('Bu öğünü silmek istediğinizden emin misiniz?')) {
        mealSlots = mealSlots.filter(m => m.id !== mealId);
        displayMealSlots();
        
        // Auto-save
        if (typeof saveMealSlots === 'function') {
            saveMealSlots();
        }
    }
}

function insertMeal(afterIndex) {
    const name = prompt('Yeni öğün adı:');
    if (name) {
        mealSlots.splice(afterIndex + 1, 0, {
            id: Date.now(),
            name: name,
            foods: []
        });
        displayMealSlots();
        
        // Auto-save
        if (typeof saveMealSlots === 'function') {
            saveMealSlots();
        }
    }
}

function addCustomFood() {
    // Step 1: Ask for food name
    const name = prompt('Besin adı:');
    if (!name || name.trim() === '') {
        return;
    }
    
    // Step 2: Ask for amount
    const amountStr = prompt('Miktar (gram):');
    if (!amountStr || parseFloat(amountStr) <= 0) {
        alert('Geçerli bir miktar girin.');
        return;
    }
    const amount = parseFloat(amountStr);
    
    // Step 3: Ask for energy
    const energyStr = prompt('Enerji (kcal):');
    if (!energyStr || parseFloat(energyStr) < 0) {
        alert('Geçerli bir enerji değeri girin.');
        return;
    }
    const energy = parseFloat(energyStr);
    
    // Step 4: Ask for protein
    const proteinStr = prompt('Protein (g):');
    if (!proteinStr || parseFloat(proteinStr) < 0) {
        alert('Geçerli bir protein değeri girin.');
        return;
    }
    const protein = parseFloat(proteinStr);
    
    // Step 5: Ask for phenylalanine
    const paStr = prompt('Fenilalanin (mg):');
    if (!paStr || parseFloat(paStr) < 0) {
        alert('Geçerli bir fenilalanin değeri girin.');
        return;
    }
    const pa = parseFloat(paStr);
    
    // Create new food item
    const newFood = {
        id: Date.now(),
        name: name.trim(),
        category: 'custom',
        amount: amount,
        unit: 'g',
        pa: pa,
        protein: protein,
        energy: energy
    };
    
    // Add to daily intake list
    dailyIntakeList.push(newFood);
    
    // Update displays
    if (typeof updateIntakeDisplay === 'function') {
        updateIntakeDisplay();
    }
    displayAvailableFoods();
    
    // Auto-save
    if (typeof saveDailyIntake === 'function') {
        saveDailyIntake();
    }
    
    alert(`${name} başarıyla eklendi!`);
}
