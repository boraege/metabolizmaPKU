// Food Selection UI
// Make dailyIntakeList globally accessible for PDF export
window.dailyIntakeList = window.dailyIntakeList || [];
let dailyIntakeList = window.dailyIntakeList;
let currentCategory = 'bread';

function initializeFoodSelection() {
    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            displayFoodList(currentCategory);
        });
    });
    
    // Setup drop zone for daily intake
    setupIntakeDropZone();
    
    // Initial display
    displayFoodList('bread');
}

function setupIntakeDropZone() {
    const intakeList = document.getElementById('intakeList');
    
    intakeList.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        intakeList.classList.add('drop-target-active');
    });
    
    intakeList.addEventListener('dragleave', (e) => {
        // Only remove if leaving the intakeList itself, not child elements
        if (e.target === intakeList) {
            intakeList.classList.remove('drop-target-active');
        }
    });
    
    intakeList.addEventListener('drop', (e) => {
        e.preventDefault();
        intakeList.classList.remove('drop-target-active');
        
        try {
            const dataString = e.dataTransfer.getData('text/plain');
            console.log('Drop to intake:', dataString);
            
            if (!dataString) {
                console.error('No data in drop event');
                return;
            }
            
            const data = JSON.parse(dataString);
            console.log('Parsed intake drop data:', data);
            
            // Check if it's from food database
            if (data.category && data.index !== undefined) {
                const foodIndex = parseInt(data.index);
                const food = FOOD_DATABASE[data.category]?.[foodIndex];
                
                if (food) {
                    // Call addFoodToIntake which will prompt for amount
                    addFoodToIntake(data.category, foodIndex);
                } else {
                    console.error('Besin bulunamadı:', data.category, foodIndex);
                }
            }
            // Ignore if it's an intake-item being dragged (already in the list)
            else if (data.type === 'intake-item') {
                console.log('Intake item dragged to itself, ignoring');
            }
        } catch (error) {
            console.error('Drop to intake error:', error);
        }
    });
}

function displayFoodList(category) {
    const foodList = document.getElementById('foodList');
    const foods = FOOD_DATABASE[category] || [];
    
    foodList.innerHTML = '';
    
    foods.forEach((food, index) => {
        const foodBox = document.createElement('div');
        foodBox.className = 'food-box';
        foodBox.draggable = true;
        foodBox.dataset.category = category;
        foodBox.dataset.index = index;
        
        foodBox.innerHTML = `
            <h4>${food.name}</h4>
            <p>${food.amount}g - ${food.unit}</p>
            <p>PA: ${food.pa}mg | Prot: ${food.protein}g</p>
            <p>Enerji: ${food.energy} kcal</p>
        `;
        
        foodBox.addEventListener('dragstart', handleDragStart);
        foodBox.addEventListener('dragend', handleDragEnd);
        foodBox.addEventListener('click', () => addFoodToIntake(category, index));
        
        foodList.appendChild(foodBox);
    });
}

function handleDragStart(e) {
    const element = e.currentTarget;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify({
        category: element.dataset.category,
        index: parseInt(element.dataset.index)
    }));
    element.classList.add('dragging');
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
}

function addFoodToIntake(category, index) {
    const food = FOOD_DATABASE[category][index];
    const amount = prompt(`${food.name} için miktar girin (gram):`, food.amount);
    
    if (amount && parseFloat(amount) > 0) {
        const multiplier = parseFloat(amount) / food.amount;
        
        dailyIntakeList.push({
            id: Date.now(),
            name: food.name,
            category: category,
            amount: parseFloat(amount),
            unit: food.unit,
            pa: Math.round(food.pa * multiplier),
            protein: Math.round(food.protein * multiplier * 10) / 10,
            energy: Math.round(food.energy * multiplier)
        });
        
        updateIntakeDisplay();
        
        // Auto-save
        if (typeof saveDailyIntake === 'function') {
            saveDailyIntake();
        }
    }
}

function updateIntakeDisplay() {
    const intakeList = document.getElementById('intakeList');
    
    intakeList.innerHTML = '';
    
    if (dailyIntakeList.length > 0) {
        dailyIntakeList.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'intake-item';
            itemDiv.draggable = true;
            itemDiv.dataset.itemId = item.id;
            
            itemDiv.innerHTML = `
                <div class="intake-item-info">
                    <h5>${item.name}</h5>
                    <p>${item.amount}g | PA: ${item.pa}mg | Prot: ${item.protein}g | Enerji: ${item.energy} kcal</p>
                </div>
                <div class="intake-item-controls">
                    <button onclick="adjustAmount(${item.id}, -10)">-</button>
                    <input type="number" value="${item.amount}" onchange="updateAmount(${item.id}, this.value)">
                    <button onclick="adjustAmount(${item.id}, 10)">+</button>
                    <button class="remove-btn" onclick="removeFromIntake(${item.id})">×</button>
                </div>
            `;
            
            // Add drag functionality
            itemDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'intake-item',
                    itemId: item.id
                }));
                itemDiv.classList.add('dragging');
            });
            
            itemDiv.addEventListener('dragend', (e) => {
                itemDiv.classList.remove('dragging');
            });
            
            intakeList.appendChild(itemDiv);
        });
    }
    
    updateTotals();
    updateProgressChart();
    
    // Update available foods in meal planning
    if (typeof displayAvailableFoods === 'function') {
        displayAvailableFoods();
    }
}

function adjustAmount(id, delta) {
    const item = dailyIntakeList.find(i => i.id === id);
    if (item) {
        const food = FOOD_DATABASE[item.category].find(f => f.name === item.name);
        const newAmount = Math.max(0, item.amount + delta);
        const multiplier = newAmount / food.amount;
        
        item.amount = newAmount;
        item.pa = Math.round(food.pa * multiplier);
        item.protein = Math.round(food.protein * multiplier * 10) / 10;
        item.energy = Math.round(food.energy * multiplier);
        
        updateIntakeDisplay();
    }
}

function updateAmount(id, newAmount) {
    const item = dailyIntakeList.find(i => i.id === id);
    if (item) {
        const food = FOOD_DATABASE[item.category].find(f => f.name === item.name);
        const multiplier = parseFloat(newAmount) / food.amount;
        
        item.amount = parseFloat(newAmount);
        item.pa = Math.round(food.pa * multiplier);
        item.protein = Math.round(food.protein * multiplier * 10) / 10;
        item.energy = Math.round(food.energy * multiplier);
        
        updateIntakeDisplay();
        
        // Auto-save
        if (typeof saveDailyIntake === 'function') {
            saveDailyIntake();
        }
    }
}

function removeFromIntake(id) {
    dailyIntakeList = dailyIntakeList.filter(item => item.id !== id);
    updateIntakeDisplay();
    
    // Auto-save
    if (typeof saveDailyIntake === 'function') {
        saveDailyIntake();
    }
}

function updateTotals() {
    const totals = dailyIntakeList.reduce((acc, item) => {
        acc.energy += item.energy;
        acc.protein += item.protein;
        acc.pa += item.pa;
        return acc;
    }, { energy: 0, protein: 0, pa: 0 });
    
    document.getElementById('totalEnergy').textContent = totals.energy;
    document.getElementById('totalProtein').textContent = totals.protein.toFixed(1);
    document.getElementById('totalPhe').textContent = totals.pa;
}

function updateProgressChart() {
    const chartDiv = document.getElementById('progressChart');
    const totals = dailyIntakeList.reduce((acc, item) => {
        acc.energy += item.energy;
        acc.protein += item.protein;
        acc.pa += item.pa;
        return acc;
    }, { energy: 0, protein: 0, pa: 0 });
    
    const needs = currentNeeds;
    
    chartDiv.innerHTML = `
        <div class="progress-item">
            <label>Enerji: ${totals.energy} / ${needs.energyPractical} kcal</label>
            <div class="progress-bar-container">
                <div class="progress-bar ${totals.energy > needs.energyPractical ? 'over-limit' : ''}" 
                     style="width: ${Math.min(100, (totals.energy / needs.energyPractical) * 100)}%">
                    ${Math.round((totals.energy / needs.energyPractical) * 100)}%
                </div>
            </div>
        </div>
        <div class="progress-item">
            <label>Protein: ${totals.protein.toFixed(1)} / ${needs.protein.toFixed(1)} g</label>
            <div class="progress-bar-container">
                <div class="progress-bar ${totals.protein > needs.protein ? 'over-limit' : ''}" 
                     style="width: ${Math.min(100, (totals.protein / needs.protein) * 100)}%">
                    ${Math.round((totals.protein / needs.protein) * 100)}%
                </div>
            </div>
        </div>
        <div class="progress-item">
            <label>Fenilalanin: ${totals.pa} / ${needs.phenylalanine} mg</label>
            <div class="progress-bar-container">
                <div class="progress-bar ${totals.pa > needs.phenylalanine ? 'over-limit' : ''}" 
                     style="width: ${Math.min(100, (totals.pa / needs.phenylalanine) * 100)}%">
                    ${Math.round((totals.pa / needs.phenylalanine) * 100)}%
                </div>
            </div>
        </div>
    `;
}
