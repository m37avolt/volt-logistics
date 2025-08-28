// Global Currency Management Service
// This service handles currency exchange rates across the entire application

class CurrencyService {
    constructor() {
        this.storageKey = 'volt_exchange_rates';
        this.defaultRates = {
            cny: {
                rate: 12,
                name: 'CNY',
                fullName: 'Китайский юань',
                updated: new Date().toISOString()
            },
            jpy: {
                rate: 0.65,
                name: 'JPY', 
                fullName: 'Японская йена',
                updated: new Date().toISOString()
            }
        };
        
        this.listeners = [];
        this.init();
    }
    
    // Initialize the service
    init() {
        // Load rates from localStorage or use defaults
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.rates = JSON.parse(stored);
                // Ensure all required currencies exist
                if (!this.rates.cny) this.rates.cny = this.defaultRates.cny;
                if (!this.rates.jpy) this.rates.jpy = this.defaultRates.jpy;
            } catch (e) {
                console.error('Error parsing stored rates:', e);
                this.rates = { ...this.defaultRates };
            }
        } else {
            this.rates = { ...this.defaultRates };
        }
        
        // Save initial rates
        this.saveRates();
    }
    
    // Get all exchange rates
    getRates() {
        return { ...this.rates };
    }
    
    // Get specific currency rate
    getRate(currency) {
        return this.rates[currency]?.rate || 0;
    }
    
    // Get currency info
    getCurrencyInfo(currency) {
        return this.rates[currency] || null;
    }
    
    // Update currency rate
    updateRate(currency, newRate) {
        if (this.rates[currency] && newRate > 0) {
            this.rates[currency].rate = newRate;
            this.rates[currency].updated = new Date().toISOString();
            this.saveRates();
            this.notifyListeners(currency, newRate);
            return true;
        }
        return false;
    }
    
    // Save rates to localStorage
    saveRates() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.rates));
        } catch (e) {
            console.error('Error saving rates:', e);
        }
    }
    
    // Subscribe to rate changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    // Notify all listeners of rate changes
    notifyListeners(currency, newRate) {
        this.listeners.forEach(callback => {
            try {
                callback(currency, newRate, this.rates);
            } catch (e) {
                console.error('Error in currency listener:', e);
            }
        });
    }
    
    // Format rate for display
    formatRate(rate, decimals = 2) {
        return Number(rate).toFixed(decimals);
    }
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        
        if (date.toDateString() === today.toDateString()) {
            return 'сегодня';
        }
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'вчера';
        }
        
        return date.toLocaleDateString('ru-RU');
    }
    
    // Get exchange rate for calculator (legacy compatibility)
    getYuan() {
        return this.getRate('cny');
    }
    
    getYen() {
        return this.getRate('jpy');
    }
}

// Create global instance
window.CurrencyService = new CurrencyService();

// Legacy compatibility - expose rates as global variables
window.yuan = window.CurrencyService.getYuan();
window.yen = window.CurrencyService.getYen();

// Update legacy variables when rates change
window.CurrencyService.subscribe((currency, newRate) => {
    if (currency === 'cny') {
        window.yuan = newRate;
    } else if (currency === 'jpy') {
        window.yen = newRate;
    }
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyService;
}

console.log('Currency Service initialized with rates:', window.CurrencyService.getRates());