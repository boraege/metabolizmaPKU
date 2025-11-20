// Main Application Initialization v1.2
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Metabolizma Hesaplayıcı başlatılıyor...');
    
    // Initialize Firebase and check authentication
    initializeFirebase();
    authManager.init();
    
    // Wait for auth state to be determined
    await new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (!user) {
                // No user logged in, redirect to login
                window.location.href = 'login.html';
                return;
            }
            
            // User is logged in
            console.log('✅ Kullanıcı giriş yapmış:', user.email);
            
            // Set user in data manager
            userDataManager.setUser(user.uid);
            
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
    
    // Clear all data on page load (fresh start for each case)
    console.log('Yeni vaka başlatılıyor - veriler temizleniyor...');
    if (typeof clearCurrentCaseData === 'function') {
        clearCurrentCaseData();
    } else {
        // Fallback: clear manually
        localStorage.removeItem('metabolizma_current_patient');
        localStorage.removeItem('metabolizma_daily_intake');
        localStorage.removeItem('metabolizma_meal_slots');
    }
    // Clear percentile selection for fresh start
    localStorage.removeItem('selectedPercentile');
    
    // Load WHO percentile data first
    console.log('WHO persentil verileri yükleniyor...');
    await loadWHOPercentileData();
    
    // Initialize all modules
    initializeUserInput();
    initializeFoodSelection();
    initializePDFExport();
    initializeHistoryViewer();
    initializeTooltips();
    initializeSaveToPatient();
    
    // Set default source description
    updateSourceDescription('manual');
    
    // Initialize with empty data
    window.dailyIntakeList.length = 0;
    
    // Initialize default meal slots BEFORE initializing meal planning
    window.mealSlots.length = 0;
    window.mealSlots.push(
        { id: 1, name: 'Sabah', foods: [] },
        { id: 2, name: 'Kuşluk', foods: [] },
        { id: 3, name: 'Öğle', foods: [] },
        { id: 4, name: 'İkindi', foods: [] },
        { id: 5, name: 'Akşam', foods: [] },
        { id: 6, name: 'Gece', foods: [] }
    );
    
    // Now initialize meal planning (it will use the already populated window.mealSlots)
    initializeMealPlanning();
    
    // Display empty data
    if (typeof updateIntakeDisplay === 'function') updateIntakeDisplay();
    if (typeof displayAvailableFoods === 'function') displayAvailableFoods();
    
    // Enable auto-save
    enableAutoSave();
    
    // Create save to history button
    createSaveToHistoryButton();
    
    console.log('Uygulama hazır! Yeni vaka için temiz sayfa.');
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Hata:', e.error);
});
