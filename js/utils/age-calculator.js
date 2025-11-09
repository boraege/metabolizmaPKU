// Age Calculator Utility
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Calculate total days for WHO lookup (important for children under 5)
    const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    
    return {
        years,
        months,
        days,
        totalDays,
        formatted: `${years} Yıl, ${months} Ay, ${days} Gün`
    };
}

function getAgeCategory(years) {
    if (years < 0.25) return '0-3 ay';
    if (years < 0.5) return '3-6 ay';
    if (years < 1) return '6-12 ay';
    if (years < 4) return '1-3 yaş';
    if (years < 7) return '4-6 yaş';
    if (years < 10) return '7-9 yaş';
    return '10+ yaş';
}

function parseAgeToMonths(ageData) {
    // Yaş verisini aylara çevirir
    if (!ageData) return 0;
    
    if (typeof ageData === 'number') {
        return ageData; // Zaten ay cinsinden
    }
    
    if (typeof ageData === 'object') {
        const years = ageData.years || 0;
        const months = ageData.months || 0;
        return (years * 12) + months;
    }
    
    return 0;
}

function parseAgeToDays(ageData) {
    // Yaş verisini günlere çevirir (WHO için)
    if (!ageData) return 0;
    
    if (typeof ageData === 'number') {
        return Math.round(ageData * 30.4375); // Ay cinsinden gün cinsine
    }
    
    if (typeof ageData === 'object') {
        if (ageData.totalDays !== undefined) {
            return ageData.totalDays;
        }
        const years = ageData.years || 0;
        const months = ageData.months || 0;
        const days = ageData.days || 0;
        return Math.round((years * 365.25) + (months * 30.4375) + days);
    }
    
    return 0;
}
