// LocalStorage Management Utility

const STORAGE_KEYS = {
    CURRENT_PATIENT: 'metabolizma_current_patient',
    PATIENT_HISTORY: 'metabolizma_patient_history',
    DAILY_INTAKE: 'metabolizma_daily_intake',
    MEAL_SLOTS: 'metabolizma_meal_slots',
    SETTINGS: 'metabolizma_settings'
};

// Save current patient data
function saveCurrentPatient() {
    try {
        const patientData = {
            personalInfo: {
                name: document.getElementById('patientName')?.value || '',
                birthDate: document.getElementById('birthDate')?.value || '',
                weight: parseFloat(document.getElementById('weight')?.value) || 0,
                height: parseFloat(document.getElementById('height')?.value) || 0,
                gender: document.querySelector('input[name="gender"]:checked')?.value || 'male'
            },
            source: document.querySelector('.tab-button.active')?.dataset.source || 'manual',
            needs: currentNeeds,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, JSON.stringify(patientData));
        console.log('Hasta bilgileri kaydedildi');
        return true;
    } catch (error) {
        console.error('Hasta bilgileri kaydedilemedi:', error);
        return false;
    }
}

// Load current patient data
function loadCurrentPatient() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT);
        if (!data) return null;
        
        const patientData = JSON.parse(data);
        
        // Restore form values
        if (patientData.personalInfo) {
            const info = patientData.personalInfo;
            if (document.getElementById('patientName')) {
                document.getElementById('patientName').value = info.name || '';
            }
            if (document.getElementById('birthDate')) {
                document.getElementById('birthDate').value = info.birthDate || '';
            }
            if (document.getElementById('weight')) {
                document.getElementById('weight').value = info.weight || '';
            }
            if (document.getElementById('height')) {
                document.getElementById('height').value = info.height || '';
            }
            
            // Set gender
            const genderRadio = document.querySelector(`input[name="gender"][value="${info.gender}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }
        }
        
        // Restore source
        if (patientData.source) {
            const sourceButton = document.querySelector(`.tab-button[data-source="${patientData.source}"]`);
            if (sourceButton) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                sourceButton.classList.add('active');
                updateSourceDescription(patientData.source);
            }
        }
        
        // Restore needs
        if (patientData.needs) {
            Object.assign(currentNeeds, patientData.needs);
        }
        
        console.log('Hasta bilgileri yüklendi');
        return patientData;
    } catch (error) {
        console.error('Hasta bilgileri yüklenemedi:', error);
        return null;
    }
}

// Save daily intake list
function saveDailyIntake() {
    try {
        localStorage.setItem(STORAGE_KEYS.DAILY_INTAKE, JSON.stringify(dailyIntakeList));
        console.log('Günlük alım listesi kaydedildi');
        return true;
    } catch (error) {
        console.error('Günlük alım listesi kaydedilemedi:', error);
        return false;
    }
}

// Load daily intake list
function loadDailyIntake() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.DAILY_INTAKE);
        if (!data) return [];
        
        const intakeList = JSON.parse(data);
        
        // Restore to global variable
        dailyIntakeList.length = 0;
        dailyIntakeList.push(...intakeList);
        
        console.log('Günlük alım listesi yüklendi:', intakeList.length, 'öğe');
        return intakeList;
    } catch (error) {
        console.error('Günlük alım listesi yüklenemedi:', error);
        return [];
    }
}

// Save meal slots
function saveMealSlots() {
    try {
        localStorage.setItem(STORAGE_KEYS.MEAL_SLOTS, JSON.stringify(window.mealSlots));
        console.log('Öğün planı kaydedildi');
        return true;
    } catch (error) {
        console.error('Öğün planı kaydedilemedi:', error);
        return false;
    }
}

// Load meal slots
function loadMealSlots() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MEAL_SLOTS);
        if (!data) {
            // Varsayılan öğünleri kullan
            const defaultSlots = [
                { id: 1, name: 'Sabah', foods: [] },
                { id: 2, name: 'Kuşluk', foods: [] },
                { id: 3, name: 'Öğle', foods: [] },
                { id: 4, name: 'İkindi', foods: [] },
                { id: 5, name: 'Akşam', foods: [] },
                { id: 6, name: 'Gece', foods: [] }
            ];
            window.mealSlots.length = 0;
            window.mealSlots.push(...defaultSlots);
            return defaultSlots;
        }
        
        const slots = JSON.parse(data);
        
        // Restore to global variable
        window.mealSlots.length = 0;
        window.mealSlots.push(...slots);
        
        console.log('Öğün planı yüklendi:', slots.length, 'öğün');
        return slots;
    } catch (error) {
        console.error('Öğün planı yüklenemedi:', error);
        // Hata durumunda varsayılan öğünleri kullan
        const defaultSlots = [
            { id: 1, name: 'Sabah', foods: [] },
            { id: 2, name: 'Kuşluk', foods: [] },
            { id: 3, name: 'Öğle', foods: [] },
            { id: 4, name: 'İkindi', foods: [] },
            { id: 5, name: 'Akşam', foods: [] },
            { id: 6, name: 'Gece', foods: [] }
        ];
        window.mealSlots.length = 0;
        window.mealSlots.push(...defaultSlots);
        return defaultSlots;
    }
}

// Save to patient history
function saveToHistory() {
    try {
        const currentData = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT);
        if (!currentData) {
            console.warn('Kaydedilecek hasta verisi yok');
            return false;
        }
        
        const patientData = JSON.parse(currentData);
        
        // Add intake and meals
        patientData.dailyIntake = [...dailyIntakeList];
        patientData.mealSlots = [...mealSlots];
        
        // Get existing history
        let history = [];
        const historyData = localStorage.getItem(STORAGE_KEYS.PATIENT_HISTORY);
        if (historyData) {
            history = JSON.parse(historyData);
        }
        
        // Add to history with unique ID
        patientData.id = Date.now();
        history.unshift(patientData); // Add to beginning
        
        // Keep only last 50 records
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem(STORAGE_KEYS.PATIENT_HISTORY, JSON.stringify(history));
        console.log('Geçmişe kaydedildi. Toplam kayıt:', history.length);
        return true;
    } catch (error) {
        console.error('Geçmişe kaydedilemedi:', error);
        return false;
    }
}

// Get patient history
function getPatientHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PATIENT_HISTORY);
        if (!data) return [];
        
        return JSON.parse(data);
    } catch (error) {
        console.error('Geçmiş yüklenemedi:', error);
        return [];
    }
}

// Load specific record from history
function loadFromHistory(recordId) {
    try {
        const history = getPatientHistory();
        const record = history.find(r => r.id === recordId);
        
        if (!record) {
            console.warn('Kayıt bulunamadı:', recordId);
            return false;
        }
        
        // Save as current patient
        localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, JSON.stringify(record));
        
        // Restore daily intake
        if (record.dailyIntake) {
            dailyIntakeList.length = 0;
            dailyIntakeList.push(...record.dailyIntake);
            localStorage.setItem(STORAGE_KEYS.DAILY_INTAKE, JSON.stringify(record.dailyIntake));
        }
        
        // Restore meal slots
        if (record.mealSlots) {
            mealSlots.length = 0;
            mealSlots.push(...record.mealSlots);
            localStorage.setItem(STORAGE_KEYS.MEAL_SLOTS, JSON.stringify(record.mealSlots));
        }
        
        // Reload UI
        loadCurrentPatient();
        if (typeof displayDailyIntake === 'function') displayDailyIntake();
        if (typeof displayMealSlots === 'function') displayMealSlots();
        
        console.log('Kayıt yüklendi:', recordId);
        return true;
    } catch (error) {
        console.error('Kayıt yüklenemedi:', error);
        return false;
    }
}

// Delete record from history
function deleteFromHistory(recordId) {
    try {
        let history = getPatientHistory();
        history = history.filter(r => r.id !== recordId);
        
        localStorage.setItem(STORAGE_KEYS.PATIENT_HISTORY, JSON.stringify(history));
        console.log('Kayıt silindi:', recordId);
        return true;
    } catch (error) {
        console.error('Kayıt silinemedi:', error);
        return false;
    }
}

// Clear current case data (not history)
function clearCurrentCaseData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PATIENT);
        localStorage.removeItem(STORAGE_KEYS.DAILY_INTAKE);
        localStorage.removeItem(STORAGE_KEYS.MEAL_SLOTS);
        console.log('Mevcut vaka verileri temizlendi');
        return true;
    } catch (error) {
        console.error('Vaka verileri temizlenemedi:', error);
        return false;
    }
}

// Clear all data
function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('Tüm veriler temizlendi');
        return true;
    } catch (error) {
        console.error('Veriler temizlenemedi:', error);
        return false;
    }
}

// Auto-save functionality
let autoSaveTimeout = null;

function enableAutoSave() {
    // Save on form changes
    const formInputs = document.querySelectorAll('#patientName, #birthDate, #weight, #height, input[name="gender"]');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                saveCurrentPatient();
            }, 1000); // Save after 1 second of inactivity
        });
    });
    
    console.log('Otomatik kaydetme etkinleştirildi');
}

// Export storage stats
function getStorageStats() {
    try {
        const stats = {
            hasCurrentPatient: !!localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT),
            hasDailyIntake: !!localStorage.getItem(STORAGE_KEYS.DAILY_INTAKE),
            hasMealSlots: !!localStorage.getItem(STORAGE_KEYS.MEAL_SLOTS),
            historyCount: getPatientHistory().length,
            totalSize: 0
        };
        
        // Calculate total size
        Object.values(STORAGE_KEYS).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                stats.totalSize += data.length;
            }
        });
        
        stats.totalSizeKB = (stats.totalSize / 1024).toFixed(2);
        
        return stats;
    } catch (error) {
        console.error('İstatistikler alınamadı:', error);
        return null;
    }
}
