// History Viewer UI Module

function initializeHistoryViewer() {
    // Create history button in header
    createHistoryButton();
    
    // Create history modal
    createHistoryModal();
    
    console.log('Geçmiş görüntüleyici hazır');
}

function createHistoryButton() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    // Check if button already exists
    if (document.getElementById('historyButton')) return;
    
    const button = document.createElement('button');
    button.id = 'historyButton';
    button.className = 'history-button';
    button.innerHTML = '📋 Geçmiş Kayıtlar';
    button.onclick = showHistoryModal;
    
    // Add to header
    header.appendChild(button);
}

function createHistoryModal() {
    // Check if modal already exists
    if (document.getElementById('historyModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'historyModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📋 Geçmiş Kayıtlar</h2>
                <button class="close-button" onclick="closeHistoryModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="history-stats" id="historyStats"></div>
                <div class="history-list" id="historyList"></div>
            </div>
            <div class="modal-footer">
                <button onclick="clearAllDataConfirm()" class="danger-button">🗑️ Tümünü Temizle</button>
                <button onclick="closeHistoryModal()" class="secondary-button">Kapat</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHistoryModal();
        }
    });
}

function showHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (!modal) {
        createHistoryModal();
        return showHistoryModal();
    }
    
    // Update stats
    updateHistoryStats();
    
    // Load and display history
    displayHistoryList();
    
    modal.style.display = 'flex';
}

function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateHistoryStats() {
    const statsDiv = document.getElementById('historyStats');
    if (!statsDiv) return;
    
    const stats = getStorageStats();
    if (!stats) return;
    
    statsDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Toplam Kayıt:</span>
                <span class="stat-value">${stats.historyCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Kullanılan Alan:</span>
                <span class="stat-value">${stats.totalSizeKB} KB</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Aktif Hasta:</span>
                <span class="stat-value">${stats.hasCurrentPatient ? '✓' : '✗'}</span>
            </div>
        </div>
    `;
}

function displayHistoryList() {
    const listDiv = document.getElementById('historyList');
    if (!listDiv) return;
    
    const history = getPatientHistory();
    
    if (history.length === 0) {
        listDiv.innerHTML = `
            <div class="empty-state">
                <p>📭 Henüz kayıt yok</p>
                <p class="empty-hint">Hasta bilgilerini girdikten sonra "Geçmişe Kaydet" butonunu kullanın</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="history-items">';
    
    history.forEach(record => {
        const date = new Date(record.timestamp);
        const dateStr = date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const info = record.personalInfo || {};
        const ageData = info.birthDate ? calculateAge(info.birthDate) : null;
        
        html += `
            <div class="history-item">
                <div class="history-item-header">
                    <h3>${info.name || 'İsimsiz Hasta'}</h3>
                    <span class="history-date">${dateStr}</span>
                </div>
                <div class="history-item-body">
                    <div class="history-info">
                        <span>👤 ${info.gender === 'male' ? 'Erkek' : 'Kız'}</span>
                        ${ageData ? `<span>🎂 ${ageData.years} yaş ${ageData.months} ay</span>` : ''}
                        <span>⚖️ ${info.weight} kg</span>
                        <span>📏 ${info.height} cm</span>
                    </div>
                    <div class="history-needs">
                        ${record.needs ? `
                            <span>🔥 ${record.needs.energyPractical} kcal</span>
                            <span>🥩 ${record.needs.protein?.toFixed(1)} g protein</span>
                            <span>💊 ${record.needs.phenylalanine} mg FA</span>
                        ` : ''}
                    </div>
                    ${record.dailyIntake && record.dailyIntake.length > 0 ? `
                        <div class="history-foods">
                            <span>🍽️ ${record.dailyIntake.length} besin</span>
                        </div>
                    ` : ''}
                    ${record.mealSlots && record.mealSlots.length > 0 ? `
                        <div class="history-meals">
                            <span>📅 ${record.mealSlots.length} öğün</span>
                        </div>
                    ` : ''}
                </div>
                <div class="history-item-actions">
                    <button onclick="loadHistoryRecord(${record.id})" class="primary-button">
                        📂 Yükle
                    </button>
                    <button onclick="deleteHistoryRecord(${record.id})" class="danger-button">
                        🗑️ Sil
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    listDiv.innerHTML = html;
}

function loadHistoryRecord(recordId) {
    if (confirm('Mevcut veriler kaybolacak. Devam etmek istiyor musunuz?')) {
        if (loadFromHistory(recordId)) {
            closeHistoryModal();
            alert('✓ Kayıt başarıyla yüklendi');
            
            // Trigger recalculation
            if (typeof updateDailyNeeds === 'function') {
                updateDailyNeeds();
            }
        } else {
            alert('✗ Kayıt yüklenemedi');
        }
    }
}

function deleteHistoryRecord(recordId) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        if (deleteFromHistory(recordId)) {
            displayHistoryList();
            updateHistoryStats();
        } else {
            alert('✗ Kayıt silinemedi');
        }
    }
}

function clearAllDataConfirm() {
    if (confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
        if (confirm('Emin misiniz? Bu işlem geri alınamaz!')) {
            if (clearAllData()) {
                closeHistoryModal();
                alert('✓ Tüm veriler temizlendi');
                
                // Reload page
                location.reload();
            } else {
                alert('✗ Veriler temizlenemedi');
            }
        }
    }
}

// Add save to history button
function createSaveToHistoryButton() {
    const resultsSection = document.querySelector('.results-section');
    if (!resultsSection) return;
    
    // Check if button already exists
    if (document.getElementById('saveToHistoryButton')) return;
    
    const button = document.createElement('button');
    button.id = 'saveToHistoryButton';
    button.className = 'save-history-button';
    button.innerHTML = '💾 Geçmişe Kaydet';
    button.onclick = saveCurrentToHistory;
    
    // Add after results
    const resultsGrid = resultsSection.querySelector('.results-grid');
    if (resultsGrid) {
        resultsGrid.after(button);
    }
}

function saveCurrentToHistory() {
    // First save current state
    if (!saveCurrentPatient()) {
        alert('✗ Hasta bilgileri kaydedilemedi');
        return;
    }
    
    saveDailyIntake();
    saveMealSlots();
    
    // Then save to history
    if (saveToHistory()) {
        alert('✓ Geçmişe kaydedildi');
    } else {
        alert('✗ Geçmişe kaydedilemedi');
    }
}
