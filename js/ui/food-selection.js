// Food Selection UI
// Make dailyIntakeList globally accessible for PDF export
window.dailyIntakeList = window.dailyIntakeList || [];
let dailyIntakeList = window.dailyIntakeList;
let currentCategory = 'bread';
let searchQuery = '';

// Favorites and recent foods
let favoriteFoods = JSON.parse(localStorage.getItem('favoriteFoods') || '[]');
let recentFoods = JSON.parse(localStorage.getItem('recentFoods') || '[]');

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
    
    // Search functionality
    const searchInput = document.getElementById('foodSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    searchInput.addEventListener('input', function() {
        searchQuery = this.value.toLowerCase().trim();
        
        if (searchQuery) {
            clearSearchBtn.classList.remove('hidden');
            displaySearchResults(searchQuery);
        } else {
            clearSearchBtn.classList.add('hidden');
            displayFoodList(currentCategory);
        }
    });
    
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.add('hidden');
        displayFoodList(currentCategory);
        searchInput.focus();
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
        const foodBox = createFoodBox(food, category, index);
        foodList.appendChild(foodBox);
    });
}

function displaySearchResults(query) {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = '';
    
    let foundCount = 0;
    
    // Search in all categories
    Object.keys(FOOD_DATABASE).forEach(category => {
        FOOD_DATABASE[category].forEach((food, index) => {
            if (food.name.toLowerCase().includes(query)) {
                const foodBox = createFoodBox(food, category, index);
                foodList.appendChild(foodBox);
                foundCount++;
            }
        });
    });
    
    if (foundCount === 0) {
        foodList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Besin bulunamadı</div>';
    }
}

function createFoodBox(food, category, index) {
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
    
    return foodBox;
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

async function addFoodToIntake(category, index) {
    const food = FOOD_DATABASE[category][index];
    
    // Always show quick amount selector for mobile, regular modal for desktop
    const isMobile = window.innerWidth <= 768;
    
    let amount;
    if (isMobile) {
        amount = await showQuickAmountModal(food);
    } else {
        amount = await showModal({
            type: 'input',
            title: food.name,
            subtitle: `${food.amount}g - ${food.unit}`,
            label: 'Miktar (gram):',
            inputType: 'number',
            step: '1',
            min: '1',
            defaultValue: food.amount,
            placeholder: 'Gram cinsinden miktar girin',
            confirmText: 'Ekle',
            cancelText: 'İptal'
        });
    }
    
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
        
        // Add to recent foods
        addToRecent(category, index);
        
        updateIntakeDisplay();
        
        // Auto-save
        if (typeof saveDailyIntake === 'function') {
            saveDailyIntake();
        }
    }
}

async function showQuickAmountModal(food) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'quick-amount-modal';
        modal.innerHTML = `
            <div class="quick-amount-content">
                <h3>${food.name}</h3>
                <p class="food-info">${food.amount}g - ${food.unit}</p>
                <p class="food-nutrition">PA: ${food.pa}mg | Prot: ${food.protein}g | ${food.energy} kcal</p>
                
                <div class="quick-amounts">
                    <button class="quick-amount-btn" data-amount="50">50g</button>
                    <button class="quick-amount-btn" data-amount="100">100g</button>
                    <button class="quick-amount-btn" data-amount="${food.amount}">${food.amount}g<br><small>(Standart)</small></button>
                    <button class="quick-amount-btn" data-amount="150">150g</button>
                    <button class="quick-amount-btn" data-amount="200">200g</button>
                </div>
                
                <div class="custom-amount-section">
                    <label>Özel Miktar:</label>
                    <input type="number" class="custom-amount-input" placeholder="Gram" min="1" step="1">
                    <button class="custom-amount-btn">Ekle</button>
                </div>
                
                <button class="cancel-quick-btn">İptal</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Quick amount buttons
        modal.querySelectorAll('.quick-amount-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                document.body.removeChild(modal);
                resolve(amount);
            });
        });
        
        // Custom amount
        const customInput = modal.querySelector('.custom-amount-input');
        const customBtn = modal.querySelector('.custom-amount-btn');
        
        customBtn.addEventListener('click', () => {
            const amount = customInput.value;
            if (amount && parseFloat(amount) > 0) {
                document.body.removeChild(modal);
                resolve(amount);
            }
        });
        
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                customBtn.click();
            }
        });
        
        // Cancel
        modal.querySelector('.cancel-quick-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(null);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(null);
            }
        });
    });
}

function addToRecent(category, index) {
    const foodKey = `${category}-${index}`;
    
    // Remove if already exists
    recentFoods = recentFoods.filter(f => f.key !== foodKey);
    
    // Add to beginning
    recentFoods.unshift({
        key: foodKey,
        category: category,
        index: index,
        timestamp: Date.now()
    });
    
    // Keep only last 10
    recentFoods = recentFoods.slice(0, 10);
    
    localStorage.setItem('recentFoods', JSON.stringify(recentFoods));
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
                <div class="intake-item-wrapper">
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
                </div>
                <div class="swipe-delete-action">
                    <span>🗑️ Sil</span>
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
            
            // Add swipe functionality for mobile
            addSwipeToDelete(itemDiv, item.id);
            
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


// Swipe to delete functionality (mobile only)
function addSwipeToDelete(element, itemId) {
    // Only enable on mobile devices
    if (window.innerWidth > 768) return;
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const wrapper = element.querySelector('.intake-item-wrapper');
    
    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        element.style.transition = 'none';
    }, { passive: true });
    
    element.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Only allow left swipe
        if (diff < 0) {
            wrapper.style.transform = `translateX(${diff}px)`;
        }
    }, { passive: true });
    
    element.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        element.style.transition = 'transform 0.3s ease';
        
        // If swiped more than 100px, delete
        if (diff < -100) {
            wrapper.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                removeFromIntake(itemId);
            }, 300);
        } else {
            // Reset position
            wrapper.style.transform = 'translateX(0)';
        }
    });
}
