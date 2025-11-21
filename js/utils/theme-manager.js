// Theme Manager
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.theme);
        
        // Setup theme switch listener
        this.setupThemeSwitch();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.theme = theme;
        
        // Update checkbox state
        const checkbox = document.getElementById('theme-switch-checkbox');
        if (checkbox) {
            checkbox.checked = theme === 'dark';
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeSwitch() {
        const checkbox = document.getElementById('theme-switch-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                this.toggleTheme();
            });
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
