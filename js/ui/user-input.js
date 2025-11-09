// User Input UI Handlers
function initializeUserInput() {
    // Birth date change handler
    const birthDateInput = document.getElementById('birthDate');
    birthDateInput.addEventListener('change', function() {
        if (this.value) {
            const ageData = calculateAge(this.value);
            document.getElementById('ageDisplay').textContent = ageData.formatted;
        }
    });
    
    // Tab switching for percentile source
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateSourceDescription(this.dataset.source);
        });
    });
    
    // Calculate button
    document.getElementById('calculateNeeds').addEventListener('click', updateDailyNeeds);
    
    // Energy practical input change
    document.getElementById('energyPracticalValue').addEventListener('change', function() {
        currentNeeds.energyPractical = parseFloat(this.value) || 0;
        updateProgressChart();
    });
}

function updateSourceDescription(source) {
    const descDiv = document.getElementById('sourceDescription');
    
    const descriptions = {
        manual: 'Manuel hesaplama: Standart klinik formüller kullanılarak hesaplama yapılır.',
        neyzi: 'Neyzi Referansı: Türk çocukları için geliştirilmiş yerel büyüme referans değerleri.',
        who: 'WHO Referansı: Dünya Sağlık Örgütü tarafından belirlenen uluslararası büyüme standartları.'
    };
    
    descDiv.textContent = descriptions[source] || '';
}
