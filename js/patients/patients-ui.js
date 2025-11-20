// Patients UI Management
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Hasta listesi sayfası başlatılıyor...');
    
    // Initialize Firebase and check authentication
    initializeFirebase();
    
    // Wait for auth state
    await new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (!user) {
                console.log('❌ Kullanıcı giriş yapmamış, login sayfasına yönlendiriliyor...');
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
                console.log('✅ Çıkış yap butonu event listener ekleniyor...');
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    console.log('🔄 Çıkış yapılıyor...');
                    try {
                        await firebase.auth().signOut();
                        console.log('✅ Çıkış başarılı, login sayfasına yönlendiriliyor...');
                        window.location.href = 'login.html';
                    } catch (error) {
                        console.error('❌ Çıkış hatası:', error);
                        alert('Çıkış yapılırken bir hata oluştu: ' + error.message);
                    }
                });
            } else {
                console.error('❌ Çıkış yap butonu bulunamadı!');
            }
            
            resolve();
        });
    });
    
    // Setup navigation
    document.getElementById('backToAppBtn').addEventListener('click', () => {
        window.location.href = 'app.html';
    });
    
    // Setup add patient button
    document.getElementById('addPatientBtn').addEventListener('click', () => {
        openAddPatientModal();
    });
    
    // Setup search
    document.getElementById('patientSearch').addEventListener('input', (e) => {
        filterPatients(e.target.value);
    });
    
    // Load patients
    await loadPatients();
});

// Load and display all patients
async function loadPatients() {
    const container = document.getElementById('patientsContainer');
    
    try {
        const patients = await patientManager.getAllPatients();
        
        if (patients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>Henüz hasta kaydı yok</h3>
                    <p>Yeni hasta eklemek için yukarıdaki butonu kullanın</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        patients.forEach(patient => {
            container.appendChild(createPatientCard(patient));
        });
        
    } catch (error) {
        console.error('Hastalar yüklenirken hata:', error);
        container.innerHTML = `
            <div class="error-state">
                <p>❌ Hastalar yüklenirken hata oluştu</p>
                <button onclick="loadPatients()" class="btn-secondary">Tekrar Dene</button>
            </div>
        `;
    }
}

// Create patient card element
function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.dataset.patientId = patient.id;
    card.dataset.patientName = patient.name.toLowerCase();
    
    const age = calculateAge(patient.birthDate);
    const genderIcon = patient.gender === 'male' ? '👦' : '👧';
    const lastUpdate = patient.updatedAt ? formatDate(patient.updatedAt.toDate()) : 'Yeni';
    
    let lastMeasurementInfo = '';
    if (patient.lastMeasurement) {
        lastMeasurementInfo = `
            <div class="patient-last-measurement">
                <span>Son Ölçüm: ${formatDate(new Date(patient.lastMeasurement.date))}</span>
                <span>Boy: ${patient.lastMeasurement.height} cm</span>
                <span>Kilo: ${patient.lastMeasurement.weight} kg</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="patient-card-header">
            <div class="patient-info">
                <h3>${genderIcon} ${patient.name}</h3>
                <p class="patient-age">${age}</p>
            </div>
            <div class="patient-actions">
                <button class="btn-icon" onclick="viewPatientDetails('${patient.id}')" title="Detayları Gör">
                    <span class="btn-icon-emoji">📊</span>
                    <span class="btn-icon-text">İncele</span>
                </button>
                <button class="btn-icon" onclick="addNewMeasurement('${patient.id}')" title="Yeni Ölçüm">
                    <span class="btn-icon-emoji">➕</span>
                    <span class="btn-icon-text">Ekle</span>
                </button>
                <button class="btn-icon btn-danger" onclick="deletePatientConfirm('${patient.id}', '${patient.name}')" title="Sil">
                    <span class="btn-icon-emoji">🗑️</span>
                    <span class="btn-icon-text">Sil</span>
                </button>
            </div>
        </div>
        ${lastMeasurementInfo}
        <div class="patient-card-footer">
            <span class="patient-date">Son Güncelleme: ${lastUpdate}</span>
        </div>
    `;
    
    return card;
}

// Open add patient modal
function openAddPatientModal() {
    const modal = document.getElementById('addPatientModal');
    const form = document.getElementById('addPatientForm');
    
    form.reset();
    modal.style.display = 'flex';
    
    // Setup form submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        await handleAddPatient();
    };
    
    // Setup close buttons
    modal.querySelector('.modal-close').onclick = () => {
        closeModal();
    };
    modal.querySelector('.modal-cancel').onclick = () => {
        closeModal();
    };
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}

// Close modal with animation
function closeModal() {
    const modal = document.getElementById('addPatientModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Add closing animation
    modalContent.style.animation = 'modalSlideOut 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    modal.style.animation = 'fadeOut 0.25s ease-out';
    
    setTimeout(() => {
        modal.style.display = 'none';
        // Reset animations
        modalContent.style.animation = '';
        modal.style.animation = '';
    }, 250);
}

// Handle add patient form submission
async function handleAddPatient() {
    const name = document.getElementById('newPatientName').value.trim();
    const birthDate = document.getElementById('newPatientBirthDate').value;
    const gender = document.querySelector('input[name="newPatientGender"]:checked').value;
    
    if (!name || !birthDate || !gender) {
        alert('Lütfen tüm alanları doldurun');
        return;
    }
    
    try {
        await patientManager.addPatient({ name, birthDate, gender });
        closeModal();
        await loadPatients();
        showNotification('✅ Hasta başarıyla eklendi');
    } catch (error) {
        console.error('Hasta eklenirken hata:', error);
        alert('Hasta eklenirken hata oluştu: ' + error.message);
    }
}

// View patient details
function viewPatientDetails(patientId) {
    // Hasta detay sayfasına yönlendir
    window.location.href = `patient-detail.html?id=${patientId}`;
}

// Add new measurement for patient
function addNewMeasurement(patientId) {
    // Hesaplama sayfasına hasta ID'si ile yönlendir
    window.location.href = `app.html?patientId=${patientId}`;
}

// Delete patient with confirmation
async function deletePatientConfirm(patientId, patientName) {
    if (!confirm(`"${patientName}" adlı hastayı ve tüm kayıtlarını silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    try {
        await patientManager.deletePatient(patientId);
        await loadPatients();
        showNotification('✅ Hasta silindi');
    } catch (error) {
        console.error('Hasta silinirken hata:', error);
        alert('Hasta silinirken hata oluştu: ' + error.message);
    }
}

// Filter patients by search term
function filterPatients(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const cards = document.querySelectorAll('.patient-card');
    
    cards.forEach(card => {
        const name = card.dataset.patientName;
        if (name.includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
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

// Show notification
function showNotification(message) {
    // Simple notification - can be enhanced
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
