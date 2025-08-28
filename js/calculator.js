document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country-select');
    const marketplaceGroup = document.getElementById('marketplace-group');
    const priceInput = document.getElementById('price-input');
    const calculateButton = document.getElementById('calculate-button');
    const resultValue = document.getElementById('result-value');
    const resultSection = document.getElementById('result-section');
    
    // Wait for currency service to be available
    function waitForCurrencyService() {
        return new Promise((resolve) => {
            if (window.CurrencyService) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.CurrencyService) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
    }
    
    // Initialize calculator
    waitForCurrencyService().then(() => {
        console.log('Calculator initialized with currency service');
        
        // Subscribe to currency changes to update calculations in real-time
        window.CurrencyService.subscribe((currency, newRate) => {
            console.log(`Calculator: Currency ${currency} updated to ${newRate}`);
            // If there's a current calculation, recalculate with new rates
            if (resultSection.style.display !== 'none') {
                calculatePrice();
            }
        });
    });
    
    // Get current exchange rates
    function getCurrentRates() {
        if (window.CurrencyService) {
            return {
                yuan: window.CurrencyService.getRate('cny'),
                yen: window.CurrencyService.getRate('jpy')
            };
        } else {
            // Fallback to defaults if service not available
            return {
                yuan: 12.5,
                yen: 0.6
            };
        }
    }
    
    // Show/hide marketplace selection based on country
    countrySelect.addEventListener('change', function() {
        if (this.value === 'china') {
            marketplaceGroup.style.display = 'block';
            priceInput.placeholder = 'Введите цену в юанях';
        } else {
            marketplaceGroup.style.display = 'none';
            priceInput.placeholder = 'Введите цену в иенах';
        }
        
        // Hide result when country changes
        resultSection.style.display = 'none';
    });
    
    // Calculate price function
    function calculatePrice() {
        const country = countrySelect.value;
        const priceStr = priceInput.value.trim();
        
        if (!priceStr) {
            alert('Пожалуйста, введите цену');
            return;
        }
        
        // Parse prices (support comma-separated values)
        const prices = priceStr.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        
        if (prices.length === 0) {
            alert('Пожалуйста, введите корректную цену');
            return;
        }
        
        // Get current exchange rates
        const rates = getCurrentRates();
        const yuan = rates.yuan;
        const yen = rates.yen;
        
        let totalPrice = 0;
        const quantity = prices.length; // Number of items
        
        if (country === 'china') {
            const marketplace = document.getElementById('marketplace-select').value;
            const priceYuan = prices.reduce((sum, price) => sum + price, 0);
            
            if (marketplace === 'taobao') {
                // Formula for POIZON/TAOBAO/WEIDAN
                const totalChinaDeliveryCost = quantity * 15;
                totalPrice = (((priceYuan * yuan) * 1.08) + totalChinaDeliveryCost * yuan) + (quantity * 50);
            } else if (marketplace === 'weechat') {
                // Formula for WEECHAT/YUPOO/GOOFISH
                const purchaseService = priceYuan * 1.05;
                const totalChinaDeliveryCost = quantity * 15;
                totalPrice = (((priceYuan * yuan) * 1.13) + totalChinaDeliveryCost * yuan) + (quantity * 50);
            }
        } else {
            // Japan calculation
            totalPrice = 0;
            for (let i = 0; i < prices.length; i++) {
                const advancePayment = ((prices[i] * 1.05) + 300);
                totalPrice += advancePayment * yen;
            }
        }
        
        // Round to 2 decimal places
        totalPrice = totalPrice.toFixed(2);
        
        // Display result
        resultValue.textContent = `${totalPrice} ₽`;
        
        // Show result section
        resultSection.style.display = 'block';
        
        // Log calculation details
        console.log(`Calculation: ${country}, Prices: ${prices.join(', ')}, Total: ${totalPrice} ₽, Rates: CNY=${yuan}, JPY=${yen}`);
    }
    
    // Calculate button event handler
    calculateButton.addEventListener('click', calculatePrice);
    
    // Allow Enter key to trigger calculation
    priceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculatePrice();
        }
    });
    
    // Add visual feedback for rate changes
    function showRateUpdateNotification() {
        const notification = document.createElement('div');
        notification.textContent = 'Курсы валют обновлены';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00DBFF;
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.style.opacity = '1', 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    // Subscribe to rate changes for notifications
    waitForCurrencyService().then(() => {
        let isInitialLoad = true;
        window.CurrencyService.subscribe((currency, newRate) => {
            if (!isInitialLoad) {
                showRateUpdateNotification();
            }
            isInitialLoad = false;
        });
    });
});