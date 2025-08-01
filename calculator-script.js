document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country-select');
    const marketplaceGroup = document.getElementById('marketplace-group');
    const priceInput = document.getElementById('price-input');
    const calculateButton = document.getElementById('calculate-button');
    const resultValue = document.getElementById('result-value');
    const resultSection = document.getElementById('result-section');
    
    // Курсы валют (из кода бота)
    const yuan = 12.5; // Курс юаня
    const yen = 0.6;   // Курс иены
    
    // Показывать/скрывать выбор площадки в зависимости от страны
    countrySelect.addEventListener('change', function() {
        if (this.value === 'china') {
            marketplaceGroup.style.display = 'block';
            priceInput.placeholder = 'Введите цену в юанях';
        } else {
            marketplaceGroup.style.display = 'none';
            priceInput.placeholder = 'Введите цену в иенах';
        }
        
        // Скрываем результат при смене страны
        resultSection.style.display = 'none';
    });
    
    // Обработчик кнопки расчета
    calculateButton.addEventListener('click', function() {
        const country = countrySelect.value;
        const priceStr = priceInput.value.trim();
        
        if (!priceStr) {
            alert('Пожалуйста, введите цену');
            return;
        }
        
        // Разбиваем строку цен по запятым (как в боте)
        const prices = priceStr.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        
        if (prices.length === 0) {
            alert('Пожалуйста, введите корректную цену');
            return;
        }
        
        let totalPrice = 0;
        const quantity = prices.length; // Количество товаров
        
        if (country === 'china') {
            const marketplace = document.getElementById('marketplace-select').value;
            const priceYuan = prices.reduce((sum, price) => sum + price, 0);
            
            if (marketplace === 'taobao') {
                // Формула из process_price_yuan1
                const totalChinaDeliveryCost = quantity * 15;
                totalPrice = (((priceYuan * yuan) * 1.08) + totalChinaDeliveryCost * yuan) + (quantity * 50);
            } else if (marketplace === 'weechat') {
                // Формула из process_price_yuan2
                const purchaseService = priceYuan * 1.05;
                const totalChinaDeliveryCost = quantity * 15;
                totalPrice = (((priceYuan * yuan) * 1.13) + totalChinaDeliveryCost * yuan) + (quantity * 50);
            }
        } else {
            // Формула из process_price_yen
            totalPrice = 0;
            for (let i = 0; i < prices.length; i++) {
                const advancePayment = ((prices[i] * 1.05) + 300);
                totalPrice += advancePayment * yen;
            }
        }
        
        // Округляем до 2 знаков после запятой
        totalPrice = totalPrice.toFixed(2);
        
        // Выводим результат
        resultValue.textContent = `${totalPrice} ₽`;
        
        // Показываем секцию с результатом
        resultSection.style.display = 'block';
    });
});