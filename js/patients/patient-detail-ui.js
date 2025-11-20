// Patient Detail UI Management
let currentPatient = null;
let currentMeasurements = [];
let heightChart = null;
let weightChart = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Hasta detay sayfası başlatılıyor...');
    
    // Get patient ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    
    if (!patientId) {
        alert('Hasta ID bulunamadı');
        window.location.href = 'patients.html';
        return;
    }
    
    // Initialize Firebase and check authentication
    initializeFirebase();
    authManager.init();
    
    // Wait for auth state
    await new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            console.log('✅ Kullanıcı giriş yapmış:', user.email);
            
            // Initialize patient manager
            patientManager.init(user.uid);
            
            // Display user info
            const userInfo = document.getElementById('userInfo');
            const userDisplayName = document.getElementById('userDisplayName');
            if (userInfo && userDisplayName) {
                userDisplayName.textContent = user.displayName || user.email;
                userInfo.style.display = 'flex';
            }
            
            // Setup logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    await authManager.logout();
                });
            }
            
            resolve();
        });
    });
    
    // Setup navigation
    document.getElementById('backToPatientsBtn').addEventListener('click', () => {
        window.location.href = 'patients.html';
    });
    
    // Setup action buttons
    document.getElementById('addMeasurementBtn').addEventListener('click', () => {
        window.location.href = `app.html?patientId=${patientId}`;
    });
    
    document.getElementById('editPatientBtn').addEventListener('click', () => {
        // TODO: Implement edit patient modal
        alert('Hasta düzenleme özelliği yakında eklenecek');
    });
    
    // Load patient data
    await loadPatientData(patientId);
});

// Load patient and measurements
async function loadPatientData(patientId) {
    try {
        // Load patient info
        currentPatient = await patientManager.getPatient(patientId);
        displayPatientInfo(currentPatient);
        
        // Load measurements
        currentMeasurements = await patientManager.getPatientMeasurements(patientId);
        displayMeasurements(currentMeasurements);
        
        // Create charts
        createCharts(currentMeasurements);
        
    } catch (error) {
        console.error('Hasta verileri yüklenirken hata:', error);
        alert('Hasta verileri yüklenirken hata oluştu: ' + error.message);
        window.location.href = 'patients.html';
    }
}

// Display patient info card
function displayPatientInfo(patient) {
    const age = calculateAge(patient.birthDate);
    const genderIcon = patient.gender === 'male' ? '👦' : '👧';
    const genderText = patient.gender === 'male' ? 'Erkek' : 'Kadın';
    
    document.getElementById('patientNameHeader').textContent = `${genderIcon} ${patient.name}`;
    document.getElementById('patientInfoHeader').textContent = `${age} • ${genderText}`;
    
    const card = document.getElementById('patientInfoCard');
    card.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <label>Ad Soyad</label>
                <value>${genderIcon} ${patient.name}</value>
            </div>
            <div class="info-item">
                <label>Doğum Tarihi</label>
                <value>${formatDate(new Date(patient.birthDate))}</value>
            </div>
            <div class="info-item">
                <label>Yaş</label>
                <value>${age}</value>
            </div>
            <div class="info-item">
                <label>Cinsiyet</label>
                <value>${genderText}</value>
            </div>
            <div class="info-item">
                <label>Toplam Ölçüm</label>
                <value>${currentMeasurements.length}</value>
            </div>
            <div class="info-item">
                <label>Son Güncelleme</label>
                <value>${formatDate(patient.updatedAt?.toDate())}</value>
            </div>
        </div>
    `;
}

// Display measurements list
function displayMeasurements(measurements) {
    const container = document.getElementById('measurementsContainer');
    
    if (measurements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Henüz ölçüm kaydı yok</h3>
                <p>Yeni ölçüm eklemek için yukarıdaki butonu kullanın</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    measurements.forEach((measurement, index) => {
        container.appendChild(createMeasurementCard(measurement, index));
    });
}

// Create measurement card
function createMeasurementCard(measurement, index) {
    const card = document.createElement('div');
    card.className = 'measurement-card';
    
    const date = formatDate(new Date(measurement.date));
    const calculations = measurement.calculations || {};
    
    card.innerHTML = `
        <div class="measurement-header">
            <div>
                <h3>Ölçüm #${currentMeasurements.length - index}</h3>
                <p class="measurement-date">📅 ${date}</p>
            </div>
            <button class="btn-icon btn-danger" onclick="deleteMeasurementConfirm('${measurement.id}', '${date}')" title="Sil">
                🗑️
            </button>
        </div>
        <div class="measurement-body">
            <div class="measurement-grid">
                <div class="measurement-item">
                    <label>Boy</label>
                    <value>${measurement.height} cm</value>
                </div>
                <div class="measurement-item">
                    <label>Kilo</label>
                    <value>${measurement.weight} kg</value>
                </div>
                <div class="measurement-item">
                    <label>BMR</label>
                    <value>${calculations.bmr || '-'} kcal</value>
                </div>
                <div class="measurement-item">
                    <label>Enerji İhtiyacı</label>
                    <value>${calculations.energyRef || '-'} kcal</value>
                </div>
                <div class="measurement-item">
                    <label>Protein</label>
                    <value>${calculations.protein || '-'} g</value>
                </div>
                <div class="measurement-item">
                    <label>Fenilalanin</label>
                    <value>${calculations.phe || '-'} mg</value>
                </div>
            </div>
            ${measurement.percentileData ? createPercentileInfo(measurement.percentileData) : ''}
        </div>
        <div class="measurement-footer">
            <button class="btn-secondary btn-sm" onclick="viewMeasurementDetails('${measurement.id}')">
                Detayları Gör
            </button>
        </div>
    `;
    
    return card;
}

// Create percentile info section
function createPercentileInfo(percentileData) {
    return `
        <div class="percentile-info">
            <h4>Persentil Değerleri (${percentileData.source || 'Manuel'})</h4>
            <div class="percentile-grid">
                ${percentileData.heightPercentile ? `
                    <div class="percentile-item">
                        <label>Boy Persentil</label>
                        <value>${percentileData.heightPercentile}</value>
                    </div>
                ` : ''}
                ${percentileData.weightPercentile ? `
                    <div class="percentile-item">
                        <label>Kilo Persentil</label>
                        <value>${percentileData.weightPercentile}</value>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Create growth charts
function createCharts(measurements) {
    if (measurements.length === 0) return;
    
    // Sort by date
    const sorted = [...measurements].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    const dates = sorted.map(m => formatShortDate(new Date(m.date)));
    const heights = sorted.map(m => m.height);
    const weights = sorted.map(m => m.weight);
    
    // Height Chart
    const heightCtx = document.getElementById('heightChart').getContext('2d');
    if (heightChart) heightChart.destroy();
    heightChart = new Chart(heightCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Boy (cm)',
                data: heights,
                borderColor: '#81C784',
                backgroundColor: 'rgba(129, 199, 132, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Boy (cm)'
                    }
                }
            }
        }
    });
    
    // Weight Chart
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    if (weightChart) weightChart.destroy();
    weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Kilo (kg)',
                data: weights,
                borderColor: '#64B5F6',
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Kilo (kg)'
                    }
                }
            }
        }
    });
}

// Delete measurement with confirmation
async function deleteMeasurementConfirm(measurementId, date) {
    if (!confirm(`${date} tarihli ölçümü silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    try {
        await patientManager.deleteMeasurement(currentPatient.id, measurementId);
        await loadPatientData(currentPatient.id);
        showNotification('✅ Ölçüm silindi');
    } catch (error) {
        console.error('Ölçüm silinirken hata:', error);
        alert('Ölçüm silinirken hata oluştu: ' + error.message);
    }
}

// View measurement details
function viewMeasurementDetails(measurementId) {
    // TODO: Open modal with full measurement details
    alert('Ölçüm detayları özelliği yakında eklenecek');
}

// Format date helper
function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format short date for charts
function formatShortDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
