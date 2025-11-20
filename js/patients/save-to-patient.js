// Save Calculation to Patient
let currentPatientId = null;

// Initialize save to patient functionality
function initializeSaveToPatient() {
    // Check if we're loading for a specific patient
    const urlParams = new URLSearchParams(window.location.search);
    currentPatientId = urlParams.get('patientId');
    
    if (currentPatientId) {
        loadPatientForMeasurement(currentPatientId);
    }
    
    // Setup save button
    const saveBtn = document.getElementById('saveToPatientBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveToPatient);
    }
    
    // Setup view patients button
    const viewPatientsBtn = document.getElementById('viewPatientsBtn');
    if (viewPatientsBtn) {
        viewPatientsBtn.addEventListener('click', () => {
            window.location.href = 'patients.html';
        });
    }
}

// Load patient data for new measurement
async function loadPatientForMeasurement(patientId) {
    try {
        const patient = await patientManager.getPatient(patientId);
        
        // Fill in patient data
        document.getElementById('patientName').value = patient.name;
        document.getElementById('birthDate').value = patient.birthDate;
        
        // Set gender
        const genderInput = document.querySelector(`input[name="gender"][value="${patient.gender}"]`);
        if (genderInput) {
            genderInput.checked = true;
        }
        
        // Trigger age calculation
        const birthDateInput = document.getElementById('birthDate');
        birthDateInput.dispatchEvent(new Event('change'));
        
        // Show notification
        showSaveNotification(`📋 ${patient.name} için yeni ölçüm ekleniyor`, 'info');
        
        // Scroll to height/weight inputs
        setTimeout(() => {
            document.getElementById('height').focus();
        }, 500);
        
    } catch (error) {
        console.error('Hasta yüklenirken hata:', error);
        showSaveNotification('❌ Hasta bilgileri yüklenemedi', 'error');
    }
}

// Handle save to patient
async function handleSaveToPatient() {
    // Validate that calculation is done
    if (!currentNeeds || !currentNeeds.bmr) {
        alert('Lütfen önce hesaplama yapın');
        return;
    }
    
    // Get patient data
    const patientName = document.getElementById('patientName').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (!patientName || !birthDate || !gender || !height || !weight) {
        alert('Lütfen tüm hasta bilgilerini doldurun');
        return;
    }
    
    try {
        let patientId = currentPatientId;
        
        // If no current patient, check if patient exists or create new
        if (!patientId) {
            const shouldCreate = confirm(
                `"${patientName}" adlı hasta için kayıt oluşturulsun mu?\n\n` +
                `Bu hasta daha önce kaydedilmemişse yeni kayıt oluşturulacak.`
            );
            
            if (!shouldCreate) return;
            
            // Create new patient
            const newPatient = await patientManager.addPatient({
                name: patientName,
                birthDate: birthDate,
                gender: gender
            });
            
            patientId = newPatient.id;
            currentPatientId = patientId;
            
            showSaveNotification('✅ Yeni hasta kaydı oluşturuldu', 'success');
        }
        
        // Get percentile source
        const percentileSource = document.querySelector('.tab-button.active')?.dataset.source || 'manual';
        
        // Prepare measurement data with safe defaults
        const measurementData = {
            date: new Date().toISOString(),
            height: height,
            weight: weight,
            percentileSource: percentileSource,
            percentileData: currentPercentileData || {},
            calculations: {
                bmr: currentNeeds.bmr || 0,
                energyRef: currentNeeds.energyRef || 0,
                energyPractical: currentNeeds.energyPractical || 0,
                protein: currentNeeds.protein || 0,
                phe: currentNeeds.phe || 0
            },
            dailyIntake: window.dailyIntakeList || [],
            mealPlan: window.mealSlots || []
        };
        
        // Save measurement
        await patientManager.addMeasurement(patientId, measurementData);
        
        showSaveNotification('✅ Ölçüm başarıyla kaydedildi', 'success');
        
        // Ask if user wants to view patient details
        setTimeout(() => {
            if (confirm('Ölçüm kaydedildi! Hasta detaylarını görüntülemek ister misiniz?')) {
                window.location.href = `patient-detail.html?id=${patientId}`;
            }
        }, 1000);
        
    } catch (error) {
        console.error('Kayıt sırasında hata:', error);
        showSaveNotification('❌ Kayıt sırasında hata oluştu: ' + error.message, 'error');
    }
}

// Show notification
function showSaveNotification(message, type = 'info') {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Store current percentile data for saving
let currentPercentileData = null;

// Hook into calculation to capture percentile data
const originalUpdateDailyNeeds = window.updateDailyNeeds;
if (originalUpdateDailyNeeds) {
    window.updateDailyNeeds = function() {
        const result = originalUpdateDailyNeeds.apply(this, arguments);
        
        // Capture percentile data if available
        if (window.currentReferenceData) {
            currentPercentileData = {
                source: document.querySelector('.tab-button.active')?.dataset.source,
                heightPercentile: window.currentReferenceData.heightPercentile,
                weightPercentile: window.currentReferenceData.weightPercentile
            };
        }
        
        return result;
    };
}
