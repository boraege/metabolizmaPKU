// Reference Display UI
function displayReferenceData(referenceResult) {
    const tableDiv = document.getElementById('referenceTable');
    
    if (!referenceResult.found) {
        tableDiv.innerHTML = '<p>Referans verisi bulunamadı. Lütfen bilgileri kontrol edin.</p>';
        return;
    }
    
    // Display warnings if any
    if (referenceResult.warnings.length > 0) {
        referenceResult.warnings.forEach(warning => {
            showWarning(warning.message, warning.critical ? 'error' : 'warning');
        });
    } else {
        hideWarning();
    }
    
    // Display reference table
    // This will be implemented with actual reference data structure
    tableDiv.innerHTML = '<p>Referans tablosu yükleniyor...</p>';
}
