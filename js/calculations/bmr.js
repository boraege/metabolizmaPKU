// BMR and Metabolic Calculations
function calculateBMR(weight, height, age, gender, method = 'manual') {
    // Schofield equation for BMR calculation
    // Age is in years, weight in kg, height in cm
    
    let bmr = 0;
    
    if (gender === 'male') {
        if (age < 3) {
            bmr = (59.512 * weight) - 30.4;
        } else if (age < 10) {
            bmr = (22.706 * weight) + (504.3 * height / 100) + 41.2;
        } else if (age < 18) {
            bmr = (13.384 * weight) + (651.5 * height / 100) + 515.0;
        } else {
            bmr = (11.472 * weight) + (873.1 * height / 100) + 387.4;
        }
    } else { // female
        if (age < 3) {
            bmr = (58.317 * weight) - 31.1;
        } else if (age < 10) {
            bmr = (20.315 * weight) + (485.9 * height / 100) + 20.0;
        } else if (age < 18) {
            bmr = (17.686 * weight) + (658.2 * height / 100) + 944.0;
        } else {
            bmr = (8.126 * weight) + (845.6 * height / 100) + 111.9;
        }
    }
    
    return Math.round(bmr);
}

function calculateProteinNeeds(weight, ageCategory) {
    if (!REFERENCE_DATA || !REFERENCE_DATA.nutritionReference) {
        console.error('REFERENCE_DATA.nutritionReference tanımlı değil');
        return 0;
    }
    
    const nutritionRef = REFERENCE_DATA.nutritionReference.find(
        ref => ref.age === ageCategory
    );
    
    if (nutritionRef) {
        return Math.round(weight * nutritionRef.protein * 10) / 10;
    }
    
    return 0;
}

function calculatePhenylalanine(protein) {
    // Phenylalanine is typically calculated as a percentage of protein
    // Standard multiplier: 50 mg per gram of protein
    return Math.round(protein * 50);
}

function calculateEnergyNeeds(weight, ageCategory, method = 'reference') {
    if (!REFERENCE_DATA || !REFERENCE_DATA.nutritionReference) {
        console.error('REFERENCE_DATA.nutritionReference tanımlı değil');
        return 0;
    }
    
    const nutritionRef = REFERENCE_DATA.nutritionReference.find(
        ref => ref.age === ageCategory
    );
    
    if (nutritionRef) {
        // Parse energy range (e.g., "110-120")
        const energyRange = nutritionRef.energy.split('-');
        const avgEnergy = (parseInt(energyRange[0]) + parseInt(energyRange[1])) / 2;
        return Math.round(weight * avgEnergy);
    }
    
    return 0;
}
