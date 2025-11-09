// Main Application Initialization v1.1
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Metabolizma Hesaplayıcı başlatılıyor...');
    
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
    
    // Set default source description
    updateSourceDescription('manual');
    
    // Initialize with empty data
    window.dailyIntakeList.length = 0;
    
    // Initialize default meal slots BEFORE initializing meal planning
    window.mealSlots.length = 0;
    window.mealSlots.push(
        { id: Date.now() + 1, name: 'Sabah', foods: [] },
        { id: Date.now() + 2, name: 'Kuşluk', foods: [] },
        { id: Date.now() + 3, name: 'Öğle', foods: [] },
        { id: Date.now() + 4, name: 'İkindi', foods: [] },
        { id: Date.now() + 5, name: 'Akşam', foods: [] },
        { id: Date.now() + 6, name: 'Gece', foods: [] }
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
