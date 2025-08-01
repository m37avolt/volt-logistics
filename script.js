// Функции для работы с изображениями (определяем ПЕРВЫМИ для немедленной доступности)
function handleImageError(img, fallbackText) {
  img.style.display = "none"
  const fallback = img.nextElementSibling
  if (fallback && fallback.classList.contains("image-fallback")) {
    fallback.style.display = "flex"
    fallback.textContent = fallbackText
  }
}

function handleImageLoad(img) {
  console.log('handleImageLoad called for:', img);
  if (img && img.classList) {
    img.classList.remove("loading")
  }
}

// Немедленно делаем функции доступными глобально
window.handleImageLoad = handleImageLoad;
window.handleImageError = handleImageError;

// Функция для отправки тестовых данных
function sendTestData() {
  console.log('Sending test data...');

  const testData = {
    command: 'create_order',
    country: 'china',
    delivery_type: 'same',
    common_recipient: {
      name: 'Тест Пользователь',
      username: 'testuser',
      address: 'Тестовый адрес ПВЗ'
    },
    items: [{
      marketplace: 'category1',
      link_or_id: 'https://test.com/item',
      color: 'Синий',
      size: 'M',
      quantity: 1,
      comment: 'Тестовый заказ из WebApp',
      photos: ['[TEST_PHOTO]'],
      photo_count: 1,
      has_photos: true
    }],
    full_name: 'Тест Пользователь',
    telegram_username: 'testuser'
  };

  if (window.Telegram?.WebApp) {
    try {
      const dataString = JSON.stringify(testData);
      console.log('Test data size:', dataString.length, 'characters');
      console.log('Test data:', testData);

      window.Telegram.WebApp.sendData(dataString);
      console.log('Test data sent successfully!');

      // Показываем уведомление
      alert('✅ Тестовые данные отправлены в бот!');

    } catch (error) {
      console.error('Error sending test data:', error);
      alert('❌ Ошибка отправки тестовых данных: ' + error.message);
    }
  } else {
    console.log('Telegram WebApp not available');
    alert('⚠️ Telegram WebApp недоступен. Откройте приложение через Telegram бот.');
  }
}

// Функция для проверки подключения к Telegram WebApp
function checkTelegramConnection() {
  const info = {
    isAvailable: !!window.Telegram?.WebApp,
    version: window.Telegram?.WebApp?.version || 'N/A',
    platform: window.Telegram?.WebApp?.platform || 'N/A',
    colorScheme: window.Telegram?.WebApp?.colorScheme || 'N/A',
    user: window.Telegram?.WebApp?.initDataUnsafe?.user || null
  };

  console.log('Telegram WebApp Info:', info);

  let message = `🔍 Информация о подключении:\n\n`;
  message += `✅ WebApp доступен: ${info.isAvailable ? 'Да' : 'Нет'}\n`;
  message += `📱 Версия: ${info.version}\n`;
  message += `💻 Платформа: ${info.platform}\n`;
  message += `🎨 Цветовая схема: ${info.colorScheme}\n`;

  if (info.user) {
    message += `👤 Пользователь: ${info.user.first_name} (@${info.user.username || 'N/A'})\n`;
    message += `🆔 ID: ${info.user.id}\n`;
  } else {
    message += `👤 Пользователь: Не определен\n`;
  }

  alert(message);
  return info;
}

// Состояние приложения
let currentPage = "home"
let pageHistory = ["home"] // История страниц для кнопки назад

// Проверка загрузки скрипта
console.log('Script.js loaded successfully');
console.log('handleImageLoad function defined:', typeof handleImageLoad);

// Проверка инициализации
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, script initialized');
});

// Глобальное состояние навигации
let navState = {
  isBackButtonVisible: false,
  isFixedMenuVisible: true
};

// Навигация
function navigateTo(pageId) {
  // Переход на соответствующую HTML страницу
  const pageMap = {
    'home': 'index.html',
    'order': 'order.html',
    'profile': 'profile_menu.html',
    'main': 'main.html',
    'promotions': 'promotions.html',
    'currency': 'currency.html',
    'calculator': 'calculator.html',
    'reviews': 'reviews.html',

    'help': 'index.html',       // пока нет отдельной страницы
    'taobao': 'index.html',     // пока нет отдельной страницы
    'yellow': 'index.html',     // пока нет отдельной страницы
    'poizon': 'index.html',     // пока нет отдельной страницы
    'my-profile': 'profile.html',
    'my-orders': 'profile.html',
    'referral': 'profile.html',
    'manager-panel': 'profile.html'
  }

  const targetPage = pageMap[pageId] || 'index.html'
  window.location.href = targetPage
}

function goBack() {
  // Использовать встроенную функцию браузера для возврата назад
  window.history.back()
}

// Показать кнопку "Назад" и скрыть фиксированное меню
function showBackButton() {
  const fixedNav = document.querySelector('.fixed-nav');
  const backButton = document.querySelector('.stylish-back-button');

  if (!backButton || navState.isBackButtonVisible) return;

  // Скрываем фиксированное меню
  if (fixedNav && navState.isFixedMenuVisible) {
    // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
    fixedNav.classList.remove('show');
    fixedNav.classList.add('hide');
    navState.isFixedMenuVisible = false;

    // Ждем завершения анимации скрытия меню перед показом кнопки назад
    setTimeout(() => {
      fixedNav.style.display = 'none';
      fixedNav.classList.remove('hide'); // Удаляем класс hide после завершения анимации

      // Показываем кнопку назад
      backButton.style.display = 'block';
      // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
      backButton.classList.remove('hide');
      // Небольшая задержка перед добавлением класса show для сброса анимации
      setTimeout(() => {
        backButton.classList.add('show');
      }, 10);
      navState.isBackButtonVisible = true;
    }, 400); // Время должно совпадать с длительностью анимации в CSS
  } else {
    // Если меню уже скрыто, просто показываем кнопку назад
    backButton.style.display = 'block';
    // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
    backButton.classList.remove('hide');
    // Небольшая задержка перед добавлением класса show для сброса анимации
    setTimeout(() => {
      backButton.classList.add('show');
    }, 10);
    navState.isBackButtonVisible = true;
  }
}

// Показать фиксированное меню и скрыть кнопку "Назад"
function showFixedMenu() {
  const fixedNav = document.querySelector('.fixed-nav');
  const backButton = document.querySelector('.stylish-back-button');

  if (!fixedNav || navState.isFixedMenuVisible) return;

  // Скрываем кнопку назад
  if (backButton && navState.isBackButtonVisible) {
    // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
    backButton.classList.remove('show');
    backButton.classList.add('hide');
    navState.isBackButtonVisible = false;

    // Ждем завершения анимации скрытия кнопки назад перед показом меню
    setTimeout(() => {
      backButton.style.display = 'none';
      backButton.classList.remove('hide'); // Удаляем класс hide после завершения анимации

      // Показываем фиксированное меню
      fixedNav.style.display = 'flex';
      // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
      fixedNav.classList.remove('hide');
      // Небольшая задержка перед добавлением класса show для сброса анимации
      setTimeout(() => {
        fixedNav.classList.add('show');
      }, 10);
      navState.isFixedMenuVisible = true;
    }, 400); // Время должно совпадать с длительностью анимации в CSS
  } else {
    // Если кнопка назад уже скрыта, просто показываем меню
    fixedNav.style.display = 'flex';
    // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
    fixedNav.classList.remove('hide');
    // Небольшая задержка перед добавлением класса show для сброса анимации
    setTimeout(() => {
      fixedNav.classList.add('show');
    }, 10);
    navState.isFixedMenuVisible = true;
  }
}

// Переключение между кнопкой "Назад" и фиксированным меню
function toggleNavigation() {
  if (navState.isBackButtonVisible) {
    showFixedMenu();
  } else {
    showBackButton();
  }
}



// Функция для открытия Telegram канала
function openTelegramChannel(event) {
  // Добавить анимацию клика
  const buttonImg = event.target
  if (buttonImg.classList.contains("main-button-image")) {
    buttonImg.classList.add("clicked")
    setTimeout(() => {
      buttonImg.classList.remove("clicked")
    }, 600)
  }

  // Открыть Telegram канал
  window.open("https://t.me/VoltLogistics", "_blank")
}

// Функция для открытия чата с менеджером
function openTelegramManager() {
  // Открыть чат с менеджером
  window.open("https://t.me/VOLTZAKAZ", "_blank")
}

// Функция для открытия канала отзывов
function openReviewsChannel() {
  // Открыть канал отзывов
  window.open("https://t.me/feedbackvolt", "_blank")
}

// Инициализация при загрузке
window.addEventListener("load", () => {
  console.log("Volt Logistics Order System loaded");

  // Определить текущую страницу по URL
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop() || 'index.html';

  // Показать навигационное меню на главной странице
  if (fileName === 'index.html' || fileName === '') {
    const mainNav = document.getElementById("mainNav");
    if (mainNav) {
      // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
      mainNav.classList.remove('show');
      mainNav.classList.remove('hide');
      mainNav.style.display = 'flex';

      // Небольшая задержка перед добавлением класса show для сброса анимации
      setTimeout(() => {
        mainNav.classList.add('show');
      }, 10);

      navState.isFixedMenuVisible = true;

      // Скрываем кнопку назад
      const backButton = document.querySelector('.stylish-back-button');
      if (backButton) {
        backButton.style.display = 'none';
        backButton.classList.remove('show');
        backButton.classList.remove('hide');
        navState.isBackButtonVisible = false;
      }
    }
  } else {
    // На внутренних страницах показываем кнопку "Назад"
    const backButton = document.querySelector('.stylish-back-button');
    const fixedNav = document.querySelector('.fixed-nav');

    if (backButton) {
      // Сначала удаляем классы анимации, чтобы они могли проигрываться многократно
      backButton.classList.remove('show');
      backButton.classList.remove('hide');
      backButton.style.display = 'block';

      // Небольшая задержка перед добавлением класса show для сброса анимации
      setTimeout(() => {
        backButton.classList.add('show');
      }, 10);

      navState.isBackButtonVisible = true;
    }

    if (fixedNav) {
      fixedNav.style.display = 'none';
      fixedNav.classList.remove('show');
      fixedNav.classList.remove('hide');
      navState.isFixedMenuVisible = false;
    }
  }

  // Добавляем обработчик клика на кнопку "Назад"
  const backButton = document.querySelector('.stylish-back-button');
  if (backButton) {
    backButton.addEventListener('click', function (event) {
      // Предотвращаем стандартное действие кнопки назад
      event.preventDefault();

      // Показываем фиксированное меню
      showFixedMenu();

      // Выполняем действие "назад" после небольшой задержки
      setTimeout(() => {
        window.history.back();
      }, 100);
    });
  }

  // Добавляем обработчики для карточек и кнопок, которые должны показывать кнопку "Назад"
  const navigationElements = document.querySelectorAll('.card, .reviews-card, .small-app, .profile-card, .promotions-image-button');
  navigationElements.forEach(element => {
    element.addEventListener('click', function () {
      // При клике на навигационный элемент показываем кнопку "Назад"
      showBackButton();
    });
  });
});

// Код для страницы калькулятора
document.addEventListener('DOMContentLoaded', function () {
  // Проверяем, находимся ли мы на странице калькулятора
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop() || 'index.html';

  if (fileName !== 'calculator.html') return;

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
  countrySelect.addEventListener('change', function () {
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
  calculateButton.addEventListener('click', function () {
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

// === ФУНКЦИИ ДЛЯ СТРАНИЦЫ ЗАКАЗА ===

let currentProduct = 1;
let totalProducts = 1;
let selectedCountry = '';
const MAX_PRODUCTS = 40;

// Глобальная функция для получения стилей номера товара
function getProductNumberStyles(number) {
  const isDoubleDigit = number >= 10;
  const isSingleOne = number === 1;

  return {
    fontSize: isDoubleDigit ? 46 : 66,
    xPosition: isSingleOne ? 133 : 125, // 1 - центр, 2-40 - левее
    yPosition: 53 // Всегда одинаковая
  };
}

// Функция для обновления стилей всех существующих табов
function updateAllTabStyles() {
  const tabs = document.querySelectorAll('.product-tab');
  tabs.forEach(tab => {
    const productNumber = parseInt(tab.getAttribute('data-product'));
    if (productNumber) {
      const numberElement = tab.querySelector('.product-number');
      if (numberElement) {
        const styles = getProductNumberStyles(productNumber);
        numberElement.setAttribute('font-size', styles.fontSize);
        numberElement.setAttribute('x', styles.xPosition);
        numberElement.setAttribute('y', styles.yPosition);
      }
    }
  });
}

// Инициализация страницы заказа
function initOrderPage() {
  console.log('initOrderPage called');
  // Полный сброс состояния
  currentProduct = 1;
  totalProducts = 1;
  selectedCountry = '';

  // Сброс выбора страны
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.value = '';
    countrySelect.selectedIndex = 0; // Принудительно выбрать первую опцию (placeholder)
    countrySelect.classList.remove('error'); // Убираем класс ошибки при инициализации
    console.log('Country select reset');
  }

  // Скрыть все секции
  const productsSection = document.getElementById('productsSection');
  const recipientSection = document.getElementById('recipientSection');

  if (productsSection) {
    productsSection.style.display = 'none';
  }

  if (recipientSection) {
    recipientSection.style.display = 'none';
  }

  // Сбросить форму товаров к начальному состоянию
  resetProductsToInitialState();

  // Очистить ошибки валидации
  const errorContainer = document.getElementById('validationError');
  if (errorContainer) {
    errorContainer.classList.remove('show');
    errorContainer.innerHTML = '';
  }

  // Убрать классы ошибок со всех полей
  document.querySelectorAll('.error').forEach(element => {
    element.classList.remove('error');
  });

  // Инициализация секции получателя
  setTimeout(() => {
    updateRecipientSection();
    console.log('Recipient section initialized');
  }, 100);
}

// Сброс товаров к начальному состоянию
function resetProductsToInitialState() {
  const container = document.getElementById('productFormsContainer');
  const tabsContainer = document.querySelector('.product-tabs');

  if (!container || !tabsContainer) return;

  // Очистить все формы товаров
  container.innerHTML = '';

  // Очистить все табы
  tabsContainer.innerHTML = '';

  // Сбросить состояние
  currentProduct = 1;
  totalProducts = 1;

  // Создать первый таб и форму
  createProductTab(1);
  createProductForm(1);

  // Создать кнопку добавления товара
  createAddButton();

  // Активировать первый товар
  selectProduct(1);
}

// Обработка изменения страны
function handleCountryChange(country) {
  console.log('handleCountryChange called with:', country);
  selectedCountry = country;
  const productsSection = document.getElementById('productsSection');
  const marketplaceSections = document.querySelectorAll('.marketplace-section');
  const linkLabels = document.querySelectorAll('.link-label');
  const countrySelect = document.getElementById('country');

  console.log('productsSection found:', !!productsSection);
  console.log('marketplaceSections found:', marketplaceSections.length);

  // Убрать стиль ошибки если страна выбрана
  if (country && countrySelect) {
    countrySelect.classList.remove('error');
    console.log('Removed error class from country select');
  }

  if (country && country !== '') {
    console.log('Country selected, showing products section');
    if (productsSection) {
      productsSection.style.display = 'block';
      console.log('Products section display set to block');
    }

    // Сразу показываем секцию получателя при выборе страны
    updateRecipientSection();

    // ВАЖНО: Создаем формы товаров при выборе страны
    resetProductsToInitialState();
    console.log('Products reset to initial state after country selection');

    // Обновляем секцию получателя после создания товаров
    updateRecipientSection();

    // Показать/скрыть выбор площадки в зависимости от страны
    marketplaceSections.forEach(section => {
      if (country === 'china') {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
        // Очистить выбор площадки для Японии
        const select = section.querySelector('.marketplace-select');
        if (select) select.value = '';
      }
    });

    // Обновить текст лейбла ссылки
    const linkText = country === 'china' ? 'Вставьте ссылку' : 'Вставьте ссылку на товар';
    linkLabels.forEach(label => {
      label.textContent = linkText;
    });

    // Обновить секцию получателя после выбора страны
    setTimeout(() => {
      updateRecipientSection();
      console.log('Recipient section updated after country change');
    }, 100);
  } else {
    // Если страна не выбрана, скрыть все секции
    productsSection.style.display = 'none';
    const recipientSection = document.getElementById('recipientSection');
    if (recipientSection) {
      recipientSection.style.display = 'none';
    }

    if (countrySelect) {
      countrySelect.classList.add('error');
    }
  }
}

// Выбор товара
function selectProduct(productNumber) {
  console.log('selectProduct called for product:', productNumber);

  // Убрать активный класс со всех табов
  document.querySelectorAll('.product-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Скрыть все формы товаров
  document.querySelectorAll('.product-form').forEach(form => {
    form.classList.remove('active');
  });

  // Активировать выбранный таб и форму
  const selectedTab = document.querySelector(`.product-tab[data-product="${productNumber}"]`);
  const selectedForm = document.querySelector(`.product-form[data-product="${productNumber}"]`);

  console.log('Selected tab found:', !!selectedTab);
  console.log('Selected form found:', !!selectedForm);

  if (selectedTab && selectedForm) {
    selectedTab.classList.add('active');
    selectedForm.classList.add('active');
    currentProduct = productNumber;
    console.log('Product', productNumber, 'activated successfully');
  } else {
    console.error('Could not find tab or form for product:', productNumber);
    // Если не найден запрошенный товар, выберем первый доступный
    const firstForm = document.querySelector('.product-form');
    const firstTab = document.querySelector('.product-tab:not(.add-product-btn)');
    if (firstForm && firstTab) {
      firstTab.classList.add('active');
      firstForm.classList.add('active');
      currentProduct = 1;
      console.log('Fallback: activated first available product');
    }
  }
}

// Добавление нового товара (агрессивный метод)
function addProduct() {
  console.log('addProduct called, current totalProducts:', totalProducts);

  if (totalProducts >= MAX_PRODUCTS) {
    console.log('Maximum products reached');
    return; // Максимум 40 товаров
  }

  // Принудительно увеличиваем счетчик
  totalProducts++;
  console.log('totalProducts increased to:', totalProducts);

  // Агрессивное создание таба и формы
  try {
    createProductTab(totalProducts);
    console.log('Product tab created for product:', totalProducts);
  } catch (error) {
    console.error('Error creating product tab:', error);
  }

  try {
    createProductForm(totalProducts);
    console.log('Product form created for product:', totalProducts);
  } catch (error) {
    console.error('Error creating product form:', error);
  }

  // Принудительное обновление видимости кнопок
  setTimeout(() => {
    // Скрыть кнопку добавления если достигли максимума
    if (totalProducts >= MAX_PRODUCTS) {
      const addBtn = document.querySelector('.add-product-btn');
      if (addBtn) {
        addBtn.style.display = 'none !important';
        addBtn.style.visibility = 'hidden';
      }
    }

    // Показать кнопки удаления если товаров больше 1
    if (totalProducts > 1) {
      document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.style.display = 'block !important';
        btn.style.visibility = 'visible';
      });
    }

    // Переключиться на новый товар
    selectProduct(totalProducts);

    // Обновить секцию получателя после добавления товара
    setTimeout(() => {
      updateRecipientSection();
      console.log('Recipient section updated after product addition');
    }, 100);
  }, 50);
}

// Создание формы товара
function createProductForm(productNumber) {
  const container = document.getElementById('productFormsContainer');
  const isChina = selectedCountry === 'china';

  const formHTML = `
        <div class="product-form" data-product="${productNumber}">
            <!-- Выбор площадки (только для Китая) -->
            <div class="marketplace-section form-group" style="display: ${isChina ? 'block' : 'none'};">
                <label class="form-label">Выберите площадку</label>
                <select class="marketplace-select order-select" onchange="handleMarketplaceChange(this, ${productNumber})">
                    <option value="">Выберите площадку</option>
                    <option value="category1">Категория 1 (POIZON, TaoBao, Weidan)</option>
                    <option value="category2">Категория 2 (WeChat, Yupoo, GooFish)</option>
                </select>
            </div>

            <!-- Остальные поля формы (скрыты до выбора маркетплейса для Китая) -->
            <div class="product-fields-container" style="display: ${isChina ? 'none' : 'block'};">
                <!-- Загрузка фото -->
                <div class="form-group">
                    <label class="form-label">Загрузите фото товара</label>
                    <button type="button" class="photo-upload-btn" onclick="uploadPhoto(${productNumber})">
                        <img src="img/order_add_photo.svg" alt="Добавить фото">
                    </button>
                    <input type="file" class="photo-input" accept="image/*" multiple style="display: none;" onchange="handlePhotoUpload(this, ${productNumber})">
                    
                    <!-- Контейнер для предпросмотра фото -->
                    <div class="photo-preview-container"></div>
                </div>

                <!-- Поля товара -->
                <div class="form-group">
                    <label class="form-label link-label">${isChina ? 'Вставьте ссылку' : 'Вставьте ссылку на товар'}</label>
                    <input type="url" class="product-link order-input" placeholder="">
                </div>

                <div class="form-group">
                    <label class="form-label">Введите цвет</label>
                    <input type="text" class="product-color order-input" placeholder="Например: красный, синий, черный">
                </div>

                <div class="form-group">
                    <label class="form-label">Введите размер</label>
                    <input type="text" class="product-size order-input" placeholder="Например: M, L, XL, 42, 43">
                </div>

                <div class="form-group">
                    <label class="form-label">Введите количество</label>
                    <input type="number" class="product-quantity order-input" placeholder="1" min="1" max="99" value="1">
                </div>

                <div class="form-group">
                    <label class="form-label">Введите комментарий</label>
                    <textarea class="product-comment order-textarea" placeholder="Например: батч, договориться с поставщиком, попросить торг"></textarea>
                </div>
            </div>

            <!-- Кнопка удаления товара -->
            <button type="button" class="delete-product-btn" onclick="deleteProduct(${productNumber})" style="display: ${totalProducts > 1 ? 'block' : 'none'};">
                <img src="img/order_delete_item.svg" alt="Удалить товар">
            </button>
        </div>
    `;

  container.insertAdjacentHTML('beforeend', formHTML);
}

// Обработка изменения маркетплейса
function handleMarketplaceChange(selectElement, productNumber) {
  console.log('Marketplace changed for product', productNumber, 'to:', selectElement.value);

  const form = document.querySelector(`.product-form[data-product="${productNumber}"]`);
  const fieldsContainer = form.querySelector('.product-fields-container');

  if (selectElement.value) {
    // Если маркетплейс выбран, показываем остальные поля
    fieldsContainer.style.display = 'block';
    console.log('Product fields shown for product', productNumber);
  } else {
    // Если маркетплейс не выбран, скрываем остальные поля
    fieldsContainer.style.display = 'none';
    console.log('Product fields hidden for product', productNumber);
  }

  // Обновляем секцию получателя после изменения маркетплейса
  setTimeout(() => {
    updateRecipientSection();
    console.log('Recipient section updated after marketplace change');
  }, 100);
}

// Удаление товара
function deleteProduct(productNumber) {
  console.log('deleteProduct called for product:', productNumber);

  if (totalProducts <= 1) {
    console.log('Cannot delete last product');
    return; // Нельзя удалить последний товар
  }

  // Удалить форму товара
  const form = document.querySelector(`.product-form[data-product="${productNumber}"]`);
  if (form) {
    form.remove();
    console.log('Product form removed for product:', productNumber);
  }

  // ПОЛНОСТЬЮ УДАЛИТЬ таб товара (не скрывать!)
  const tab = document.querySelector(`.product-tab[data-product="${productNumber}"]`);
  if (tab) {
    tab.remove();
    console.log('Product tab removed for product:', productNumber);
  }

  // Уменьшить общее количество товаров
  totalProducts--;
  console.log('Total products after deletion:', totalProducts);

  // Перенумеровать оставшиеся товары
  renumberProducts();

  // Показать кнопку добавления если была скрыта
  const addBtn = document.querySelector('.add-product-btn');
  if (addBtn) {
    addBtn.style.display = 'block';
    addBtn.style.visibility = 'visible';
  }

  // Скрыть кнопки удаления если остался только один товар
  if (totalProducts <= 1) {
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.style.display = 'none';
    });
  }

  // Умное переключение на товар после удаления
  let targetProduct = 1;

  // Если удаляем текущий активный товар
  if (productNumber === currentProduct) {
    // Если удаляем последний товар, переключаемся на предыдущий
    if (productNumber === totalProducts + 1) { // +1 потому что totalProducts уже уменьшен
      targetProduct = totalProducts;
    } else {
      // Иначе остаемся на том же номере (который теперь указывает на следующий товар)
      targetProduct = Math.min(productNumber, totalProducts);
    }
  } else {
    // Если удаляем не текущий товар, остаемся на текущем
    targetProduct = currentProduct <= totalProducts ? currentProduct : totalProducts;
  }

  console.log('Switching to product:', targetProduct);
  selectProduct(targetProduct);

  // Обновить секцию получателя
  updateRecipientSection();
}

// Перенумерация товаров после удаления
function renumberProducts() {
  console.log('renumberProducts called');

  const forms = document.querySelectorAll('.product-form');
  const tabs = document.querySelectorAll('.product-tab:not(.add-product-btn)'); // Исключаем кнопку добавления

  console.log('Found forms:', forms.length, 'Found tabs:', tabs.length);

  let newNumber = 1;
  forms.forEach((form, index) => {
    console.log('Renumbering form', index, 'to product number', newNumber);

    form.setAttribute('data-product', newNumber);

    if (tabs[index]) {
      tabs[index].setAttribute('data-product', newNumber);
      // Используем замыкание с немедленным вызовом функции для сохранения правильного номера
      tabs[index].onclick = ((productNum) => {
        return () => selectProduct(productNum);
      })(newNumber);

      // Обновить номер в тексте SVG с правильными стилями
      const numberElement = tabs[index].querySelector('.product-number');
      if (numberElement) {
        numberElement.textContent = newNumber;

        // Получаем стили для номера товара (используем глобальную функцию)
        const styles = getProductNumberStyles(newNumber);
        const fontSize = styles.fontSize;
        const xPosition = styles.xPosition;

        numberElement.setAttribute('font-size', fontSize);
        numberElement.setAttribute('x', xPosition);
      }
    }

    // Обновить onclick для кнопки удаления с правильным замыканием
    const deleteBtn = form.querySelector('.delete-product-btn');
    if (deleteBtn) {
      deleteBtn.onclick = ((productNum) => {
        return () => deleteProduct(productNum);
      })(newNumber);
    }

    // Обновить onclick для кнопки загрузки фото с правильным замыканием
    const photoBtn = form.querySelector('.photo-upload-btn');
    if (photoBtn) {
      photoBtn.onclick = ((productNum) => {
        return () => uploadPhoto(productNum);
      })(newNumber);
    }

    // Обновить onchange для input файла с правильным замыканием
    const photoInput = form.querySelector('.photo-input');
    if (photoInput) {
      photoInput.onchange = ((productNum) => {
        return (e) => handlePhotoUpload(e.target, productNum);
      })(newNumber);
    }

    // Обновить onchange для маркетплейса с правильным замыканием
    const marketplaceSelect = form.querySelector('.marketplace-select');
    if (marketplaceSelect) {
      marketplaceSelect.onchange = ((productNum) => {
        return (e) => handleMarketplaceChange(e.target, productNum);
      })(newNumber);
    }

    newNumber++;
  });

  // Обновляем totalProducts на основе реального количества форм
  totalProducts = forms.length;
  const oldCurrentProduct = currentProduct;
  currentProduct = Math.min(currentProduct, totalProducts);

  console.log('Renumbering complete. Total products:', totalProducts);
  console.log('Current product changed from', oldCurrentProduct, 'to', currentProduct);

  // Принудительно обновляем стили всех табов для единообразия
  updateAllTabStyles();

  // Убеждаемся что правильный товар активен после перенумерации
  if (currentProduct > 0 && currentProduct <= totalProducts) {
    console.log('Ensuring product', currentProduct, 'is active after renumbering');
    // Не вызываем selectProduct здесь, так как это будет сделано в deleteProduct
  }
}

// Загрузка фото
function uploadPhoto(productNumber) {
  const form = document.querySelector(`.product-form[data-product="${productNumber}"]`);
  const input = form.querySelector('.photo-input');
  input.click();
}

// Обработка загрузки фото
// Функция сжатия изображения
function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
      // Вычисляем новые размеры с сохранением пропорций
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Рисуем сжатое изображение
      ctx.drawImage(img, 0, 0, width, height);

      // Конвертируем в base64 с заданным качеством
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.src = URL.createObjectURL(file);
  });
}

function handlePhotoUpload(input, productNumber) {
  const form = document.querySelector(`.product-form[data-product="${productNumber}"]`);
  const container = form.querySelector('.photo-preview-container');

  Array.from(input.files).forEach(async (file) => {
    if (file.type.startsWith('image/')) {
      try {
        // Сжимаем изображение перед добавлением
        const compressedImage = await compressImage(file);

        console.log(`Original size: ${file.size} bytes, Compressed size: ~${Math.round(compressedImage.length * 0.75)} bytes`);

        const photoItem = document.createElement('div');
        photoItem.className = 'photo-preview-item';
        photoItem.innerHTML = `
                    <img src="${compressedImage}" alt="Фото товара" onclick="openPhotoModal('${compressedImage}')">
                    <button type="button" class="photo-preview-remove" onclick="removePhoto(this)">×</button>
                `;
        container.appendChild(photoItem);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback к оригинальному методу
        const reader = new FileReader();
        reader.onload = function (e) {
          const photoItem = document.createElement('div');
          photoItem.className = 'photo-preview-item';
          photoItem.innerHTML = `
                    <img src="${e.target.result}" alt="Фото товара" onclick="openPhotoModal('${e.target.result}')">
                    <button type="button" class="photo-preview-remove" onclick="removePhoto(this)">×</button>
                `;
          container.appendChild(photoItem);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Очистить input для возможности повторной загрузки
  input.value = '';
}

// Удаление фото
function removePhoto(button) {
  button.parentElement.remove();
}

// Открытие модального окна с фото
function openPhotoModal(imageSrc) {
  // Создаем модальное окно если его нет
  let modal = document.getElementById('photoModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'photoModal';
    modal.className = 'photo-modal';
    modal.innerHTML = `
      <div class="photo-modal-content">
        <img id="modalImage" class="photo-modal-image" src="" alt="Предпросмотр фото">
        <button class="photo-modal-close" onclick="closePhotoModal()">Закрыть</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Закрытие по клику на фон
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closePhotoModal();
      }
    });
  }

  // Устанавливаем изображение и показываем модальное окно
  document.getElementById('modalImage').src = imageSrc;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
}

// Закрытие модального окна
function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Восстанавливаем скролл страницы
  }
}

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closePhotoModal();
  }
});

// Проверка готовности товаров
function areProductsReady() {
  if (selectedCountry === 'china') {
    // Для Китая проверяем, что у всех товаров выбран маркетплейс
    const forms = document.querySelectorAll('.product-form');
    return Array.from(forms).every(form => {
      const marketplaceSelect = form.querySelector('.marketplace-select');
      return marketplaceSelect && marketplaceSelect.value !== '';
    });
  } else {
    // Для других стран (Япония) товары готовы сразу
    return true;
  }
}

// Обновление секции получателя
function updateRecipientSection() {
  console.log('updateRecipientSection called, selectedCountry:', selectedCountry, 'totalProducts:', totalProducts);

  const recipientSection = document.getElementById('recipientSection');

  // Показываем секцию если выбрана страна (независимо от товаров)
  if (selectedCountry) {
    console.log('Showing recipient section');

    if (recipientSection) {
      recipientSection.style.display = 'block';
      recipientSection.style.visibility = 'visible';
      recipientSection.classList.remove('hidden');
      recipientSection.removeAttribute('hidden');

      console.log('Recipient section shown');
    } else {
      console.error('recipientSection element not found!');
    }
  } else {
    console.log('Hiding recipient section - no country or no products');
    if (recipientSection) {
      recipientSection.style.display = 'none';
    }
    return;
  }

  // Настройка подсекций в зависимости от количества товаров
  const deliveryTypeSection = document.getElementById('deliveryTypeSection');
  const commonData = document.getElementById('commonRecipientData');
  const individualData = document.getElementById('individualRecipientData');
  const deliveryTypeSelect = document.getElementById('deliveryType');

  if (totalProducts <= 1) {
    // Если товаров нет или товар один - скрываем выбор типа доставки
    console.log('Single or no products - hiding delivery type selection');

    if (deliveryTypeSection) {
      deliveryTypeSection.style.display = 'none';
    }

    // Показываем форму для одного получателя
    if (commonData) {
      commonData.style.display = 'block';
      commonData.style.visibility = 'visible';
    }

    if (individualData) {
      individualData.style.display = 'none';
    }

    // Автоматически устанавливаем тип доставки "same"
    if (deliveryTypeSelect) {
      deliveryTypeSelect.value = 'same';
    }
  } else {
    // Если товаров несколько - показываем выбор типа доставки
    console.log('Multiple products - showing delivery type selection');

    if (deliveryTypeSection) {
      deliveryTypeSection.style.display = 'block';
      deliveryTypeSection.style.visibility = 'visible';
    }

    // Устанавливаем тип доставки по умолчанию если не выбрано
    if (deliveryTypeSelect && !deliveryTypeSelect.value) {
      deliveryTypeSelect.value = 'same';
      handleDeliveryTypeChange('same');
    }
  }
}


// Обработка изменения типа доставки
function handleDeliveryTypeChange(deliveryType) {
  const commonData = document.getElementById('commonRecipientData');
  const individualData = document.getElementById('individualRecipientData');

  if (deliveryType === 'same') {
    commonData.style.display = 'block';
    individualData.style.display = 'none';
  } else if (deliveryType === 'different') {
    commonData.style.display = 'none';
    individualData.style.display = 'block';
    generateIndividualRecipientForms();
  }
}

// Генерация индивидуальных форм получателя
function generateIndividualRecipientForms() {
  const container = document.getElementById('recipientDataContainer');
  container.innerHTML = '';

  for (let i = 1; i <= totalProducts; i++) {
    const formHTML = `
            <div class="recipient-form" data-product="${i}">
                <h3 class="form-label">Данные получателя для товара ${i}</h3>
                
                <div class="form-group">
                    <label class="form-label">Введите ФИО получателя</label>
                    <input type="text" class="recipient-name order-input" placeholder="">
                </div>

                <div class="form-group">
                    <label class="form-label">Введите юзернейм получателя</label>
                    <input type="text" class="recipient-username order-input" placeholder="">
                </div>

                <div class="form-group">
                    <label class="form-label">Введите ПВЗ СДЭК получателя</label>
                    <textarea class="recipient-address order-textarea" placeholder=""></textarea>
                </div>
            </div>
        `;
    container.insertAdjacentHTML('beforeend', formHTML);
  }
}

// Отправка заказа
function submitOrder() {
  console.log('submitOrder called');

  // Валидация формы
  const validationErrors = validateOrderForm();
  console.log('Validation errors:', validationErrors);

  if (validationErrors.length > 0) {
    console.log('Validation failed, showing errors');
    showValidationErrors(validationErrors);
    return;
  }

  console.log('Validation passed, collecting order data...');

  // Собрать данные всех товаров
  const deliveryType = totalProducts === 1 ? 'same' : (document.getElementById('deliveryType').value || 'same');
  const orderData = {
    country: selectedCountry,
    products: [],
    delivery: {
      type: deliveryType,
      recipients: []
    }
  };

  // Собрать данные товаров
  document.querySelectorAll('.product-form').forEach((form, index) => {
    const photoElements = form.querySelectorAll('.photo-preview-item img');
    console.log('Found', photoElements.length, 'photos for product', index + 1);

    const productData = {
      marketplace: form.querySelector('.marketplace-select')?.value || '',
      link: form.querySelector('.product-link').value,
      color: form.querySelector('.product-color').value,
      size: form.querySelector('.product-size').value,
      quantity: form.querySelector('.product-quantity').value,
      comment: form.querySelector('.product-comment').value,
      photos: Array.from(photoElements).map(img => img.src)
    };

    console.log('Product data with photos:', productData);
    orderData.products.push(productData);
  });

  // Собрать данные получателей
  if (orderData.delivery.type === 'same' || totalProducts === 1) {
    // Для одного товара или доставки на один адрес
    orderData.delivery.recipients.push({
      name: document.getElementById('recipientName').value,
      username: document.getElementById('recipientUsername').value,
      address: document.getElementById('recipientAddress').value
    });
  } else {
    document.querySelectorAll('.recipient-form').forEach(form => {
      orderData.delivery.recipients.push({
        name: form.querySelector('.recipient-name').value,
        username: form.querySelector('.recipient-username').value,
        address: form.querySelector('.recipient-address').value
      });
    });
  }

  console.log('Данные заказа:', orderData);

  // Показать модальное окно с подтверждением
  showOrderModal(orderData);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded fired');

  // Настраиваем обработчики для изображений навигации
  const navImages = document.querySelectorAll('.nav-button');
  navImages.forEach(img => {
    // Обработчик успешной загрузки
    img.addEventListener('load', function () {
      console.log('Image loaded:', this.src);
      handleImageLoad(this);
    });

    // Обработчик ошибки загрузки
    img.addEventListener('error', function () {
      console.log('Image error:', this.src);
      handleImageError(this, this.alt);
    });

    // Если изображение уже загружено
    if (img.complete) {
      console.log('Image already loaded:', img.src);
      handleImageLoad(img);
    }
  });

  // Инициализация навигации для всех страниц
  const mainNav = document.getElementById('mainNav');
  if (mainNav) {
    console.log('Main navigation found, showing it');
    mainNav.style.display = 'flex';
    mainNav.classList.add('show');

    // Добавляем обработчики кликов для всех кнопок навигации
    const navButtons = mainNav.querySelectorAll('.nav-button, img[onclick]');
    navButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        console.log('Navigation button clicked:', this);
        // Дополнительная обработка если нужна
      });
    });
  } else {
    console.log('Main navigation not found');
  }

  // Проверить, находимся ли мы на странице заказа
  if (document.getElementById('orderForm')) {
    console.log('Initializing order page on DOMContentLoaded');
    initOrderPage();
  }
});

// Функция для вызова из навигации (если используется SPA)
function resetOrderPage() {
  if (document.getElementById('orderForm')) {
    console.log('Resetting order page');
    initOrderPage();
  }
}

// Создание кнопки добавления товара (агрессивный метод)
function createAddButton() {
  const tabsContainer = document.querySelector('.product-tabs');
  if (!tabsContainer) {
    console.error('Product tabs container not found');
    return;
  }

  // Удаляем существующую кнопку если есть
  const existingBtn = tabsContainer.querySelector('.add-product-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-product-btn';
  addBtn.style.display = 'block';
  addBtn.style.visibility = 'visible';

  // Агрессивное назначение обработчика
  addBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add product button clicked');
    addProduct();
  };

  addBtn.innerHTML = '<img src="img/order_add_item.svg" alt="Добавить товар">';

  tabsContainer.appendChild(addBtn);
  console.log('Add product button created and appended');
}

// Создание нового таба товара
function createProductTab(productNumber) {
  const tabsContainer = document.querySelector('.product-tabs');

  const newTab = document.createElement('button');
  newTab.type = 'button';
  newTab.className = 'product-tab';
  newTab.setAttribute('data-product', productNumber);
  newTab.onclick = ((productNum) => {
    return () => selectProduct(productNum);
  })(productNumber);
  newTab.style.display = 'block';

  // Создаем уникальные ID для clipPath
  const clipId = `clip0_75_81_${productNumber}`;
  const blurClipId = `bgblur_1_75_81_clip_path_${productNumber}`;

  // Получаем стили для номера товара
  const styles = getProductNumberStyles(productNumber);
  const fontSize = styles.fontSize;
  const xPosition = styles.xPosition;

  newTab.innerHTML = `
        <svg class="product-tab-svg" width="140" height="47" viewBox="0 0 140 47" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#${clipId})">
                <foreignObject x="-31.1" y="-31.1" width="367.2" height="120.2">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(15.55px);clip-path:url(#${blurClipId});height:100%;width:100%"></div>
                </foreignObject>
                <rect data-figma-bg-blur-radius="31.1" width="305" height="58" rx="12" fill="#626262" fill-opacity="0.34"/>
                <path d="M18.58 30H17.18V20.28H12.1V19H23.66V20.28H18.58V30ZM31.0672 30.2C29.7205 30.2 28.5472 29.9533 27.5472 29.46C26.5605 28.9667 25.8005 28.2867 25.2672 27.42C24.7339 26.5533 24.4672 25.58 24.4672 24.5C24.4672 23.42 24.7339 22.4467 25.2672 21.58C25.8005 20.7133 26.5605 20.0333 27.5472 19.54C28.5472 19.0467 29.7205 18.8 31.0672 18.8C32.4139 18.8 33.5805 19.0467 34.5672 19.54C35.5672 20.0333 36.3339 20.7133 36.8672 21.58C37.4005 22.4467 37.6672 23.42 37.6672 24.5C37.6672 25.58 37.4005 26.5533 36.8672 27.42C36.3339 28.2867 35.5672 28.9667 34.5672 29.46C33.5805 29.9533 32.4139 30.2 31.0672 30.2ZM31.0672 28.96C32.1605 28.96 33.0939 28.7733 33.8672 28.4C34.6539 28.0267 35.2472 27.5067 35.6472 26.84C36.0605 26.16 36.2672 25.38 36.2672 24.5C36.2672 23.62 36.0605 22.8467 35.6472 22.18C35.2472 21.5 34.6539 20.9733 33.8672 20.6C33.0939 20.2267 32.1605 20.04 31.0672 20.04C29.9739 20.04 29.0339 20.2267 28.2472 20.6C27.4739 20.9733 26.8805 21.5 26.4672 22.18C26.0672 22.8467 25.8672 23.62 25.8672 24.5C25.8672 25.38 26.0672 26.16 26.4672 26.84C26.8805 27.5067 27.4739 28.0267 28.2472 28.4C29.0339 28.7733 29.9739 28.96 31.0672 28.96ZM48.0978 24.78C49.0311 24.8467 49.7311 25.1067 50.1978 25.56C50.6778 26 50.9178 26.5533 50.9178 27.22C50.9178 28.0333 50.5778 28.7 49.8978 29.22C49.2178 29.74 48.2178 30 46.8978 30H40.3578V19H46.5178C47.9578 19 49.0511 19.28 49.7978 19.84C50.5445 20.4 50.9178 21.1133 50.9178 21.98C50.9178 22.6867 50.6578 23.3 50.1378 23.82C49.6311 24.34 48.9511 24.6267 48.0978 24.68V24.78ZM41.7578 20.28V24.1H46.4578C47.5111 24.1 48.2845 23.9267 48.7778 23.58C49.2711 23.2333 49.5178 22.7667 49.5178 22.18C49.5178 21.6067 49.2711 21.1467 48.7778 20.8C48.2845 20.4533 47.5111 20.28 46.4578 20.28H41.7578ZM46.8178 28.72C47.7378 28.72 48.4178 28.5667 48.8578 28.26C49.2978 27.9533 49.5178 27.5533 49.5178 27.06C49.5178 26.5533 49.2978 26.1467 48.8578 25.84C48.4311 25.5333 47.7511 25.38 46.8178 25.38H41.7578V28.72H46.8178ZM57.4948 30.2C56.0948 30.2 55.0282 29.9133 54.2948 29.34C53.5748 28.7533 53.2148 27.9667 53.2148 26.98C53.2148 25.94 53.6415 25.1133 54.4948 24.5C55.3615 23.8733 56.7148 23.56 58.5548 23.56C59.7815 23.56 60.7148 23.5 61.3548 23.38C61.9948 23.26 62.4215 23.0933 62.6348 22.88C62.8482 22.6533 62.9548 22.3533 62.9548 21.98C62.9548 21.42 62.6415 20.96 62.0148 20.6C61.3882 20.2267 60.3815 20.04 58.9948 20.04C57.9948 20.04 57.0215 20.18 56.0748 20.46C55.1415 20.7267 54.4015 21.0333 53.8548 21.38V20C54.3082 19.6933 55.0082 19.42 55.9548 19.18C56.9015 18.9267 57.9348 18.8 59.0548 18.8C60.9082 18.8 62.2548 19.1 63.0948 19.7C63.9348 20.2867 64.3548 21.0867 64.3548 22.1V30H62.9548V28.14C62.4748 28.66 61.7415 29.1333 60.7548 29.56C59.7815 29.9867 58.6948 30.2 57.4948 30.2ZM57.8148 28.96C59.0015 28.96 60.0548 28.74 60.9748 28.3C61.8948 27.86 62.5548 27.3667 62.9548 26.82V23.82C62.8348 24.0467 62.3948 24.2533 61.6348 24.44C60.8748 24.6133 59.8282 24.7 58.4948 24.7C57.1482 24.7 56.1615 24.9067 55.5348 25.32C54.9215 25.7333 54.6148 26.2667 54.6148 26.92C54.6148 27.5467 54.8748 28.0467 55.3948 28.42C55.9282 28.78 56.7348 28.96 57.8148 28.96ZM67.4477 33.8V19H68.8477V20.7H68.9477C69.361 20.22 69.981 19.7867 70.8077 19.4C71.6343 19 72.5477 18.8 73.5477 18.8C74.7477 18.8 75.8077 19.0467 76.7277 19.54C77.661 20.0333 78.381 20.7133 78.8877 21.58C79.3943 22.4333 79.6477 23.4067 79.6477 24.5C79.6477 25.5933 79.3943 26.5733 78.8877 27.44C78.381 28.2933 77.661 28.9667 76.7277 29.46C75.8077 29.9533 74.7477 30.2 73.5477 30.2C72.5477 30.2 71.6343 30.0067 70.8077 29.62C69.981 29.22 69.361 28.78 68.9477 28.3H68.8477V33.8H67.4477ZM73.2877 28.96C74.301 28.96 75.181 28.7733 75.9277 28.4C76.6743 28.0133 77.2477 27.4867 77.6477 26.82C78.0477 26.14 78.2477 25.3667 78.2477 24.5C78.2477 23.6333 78.0477 22.8667 77.6477 22.2C77.2477 21.52 76.6743 20.9933 75.9277 20.62C75.181 20.2333 74.301 20.04 73.2877 20.04C72.301 20.04 71.4077 20.2733 70.6077 20.74C69.8077 21.1933 69.221 21.7067 68.8477 22.28V26.72C69.221 27.2933 69.8077 27.8133 70.6077 28.28C71.4077 28.7333 72.301 28.96 73.2877 28.96Z" fill="white"/>
                <text class="product-number" x="${xPosition}" y="53" fill="#00DBFF" font-family="TT Runs Trial Bold, TT Runs, Arial, sans-serif" font-size="${fontSize}" font-weight="900" text-anchor="middle" dominant-baseline="baseline">${productNumber}</text>
            </g>
            <defs>
                <clipPath id="${blurClipId}" transform="translate(31.1 31.1)">
                    <rect width="305" height="58" rx="12"/>
                </clipPath>
                <clipPath id="${clipId}">
                    <rect width="140" height="47" rx="15" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    `;

  // Вставить перед кнопкой добавления
  const addBtn = tabsContainer.querySelector('.add-product-btn');
  if (addBtn) {
    tabsContainer.insertBefore(newTab, addBtn);
  } else {
    tabsContainer.appendChild(newTab);
  }

  return newTab;
}

// Обработчики событий для обновления секции получателя
document.addEventListener('change', function (event) {
  // Обновляем секцию получателя только при изменении важных полей
  if (event.target.id === 'country' || event.target.classList.contains('product-link')) {
    console.log('Important field changed - updating recipient section');
    setTimeout(() => updateRecipientSection(), 100);
  }
});

// Функции для работы с модальным окном заказа
function showOrderModal(orderData) {
  console.log('showOrderModal called with data:', orderData);

  const modal = document.getElementById('orderModal');
  console.log('Modal element found:', !!modal);

  if (!modal) {
    console.error('Order modal not found - element with id "orderModal" does not exist');
    return;
  }

  // Сохраняем данные заказа для подтверждения
  window.currentOrderData = orderData;

  // Заполняем информацию о стране и доставке
  const countryElement = document.getElementById('orderCountry');
  const deliveryTypeElement = document.getElementById('orderDeliveryType');

  if (countryElement) {
    countryElement.textContent = orderData.country === 'china' ? 'Китай' : 'Япония';
  }

  if (deliveryTypeElement) {
    deliveryTypeElement.textContent = orderData.delivery.type === 'same' ? 'На один адрес' : 'На разные адреса';
  }

  // Создаем табы товаров
  createProductTabs(orderData.products);

  // Заполняем информацию о получателях
  fillRecipientsInfo(orderData.delivery.recipients);

  // Показываем модальное окно
  modal.style.display = 'flex';
  modal.classList.add('show');

  console.log('Order modal shown successfully');

  // Генерируем содержимое сводки заказа в стиле существующих модальных окон
  let summaryHTML = '';

  // Информация о стране
  summaryHTML += `<div class="preview-item">
    <h4>Страна выкупа</h4>
    <div class="preview-field">
      <span class="preview-field-label">Страна:</span>
      <span class="preview-field-value">${orderData.country === 'china' ? 'Китай' : 'Япония'}</span>
    </div>
  </div>`;

  // Информация о типе доставки
  summaryHTML += `<div class="preview-item">
    <h4>Тип доставки</h4>
    <div class="preview-field">
      <span class="preview-field-label">Доставка:</span>
      <span class="preview-field-value">${orderData.delivery.type === 'same' ? 'На один адрес' : 'На разные адреса'}</span>
    </div>
  </div>`;

  // Информация о товарах
  orderData.products.forEach((product, index) => {
    summaryHTML += `<div class="preview-item">
      <h4>Товар ${index + 1}</h4>
      ${product.marketplace ? `<div class="preview-field">
        <span class="preview-field-label">Площадка:</span>
        <span class="preview-field-value">${product.marketplace === 'category1' ? 'Категория 1 (POIZON, TaoBao, Weidan)' : 'Категория 2 (WeChat, Yupoo, GooFish)'}</span>
      </div>` : ''}
      ${product.link ? `<div class="preview-field">
        <span class="preview-field-label">Ссылка:</span>
        <span class="preview-field-value">${product.link}</span>
      </div>` : ''}
      ${product.color ? `<div class="preview-field">
        <span class="preview-field-label">Цвет:</span>
        <span class="preview-field-value">${product.color}</span>
      </div>` : ''}
      ${product.size ? `<div class="preview-field">
        <span class="preview-field-label">Размер:</span>
        <span class="preview-field-value">${product.size}</span>
      </div>` : ''}
      ${product.quantity ? `<div class="preview-field">
        <span class="preview-field-label">Количество:</span>
        <span class="preview-field-value">${product.quantity}</span>
      </div>` : ''}
      ${product.comment ? `<div class="preview-field">
        <span class="preview-field-label">Комментарий:</span>
        <span class="preview-field-value">${product.comment}</span>
      </div>` : ''}
      ${product.photos.length > 0 ? `<div class="preview-field">
        <span class="preview-field-label">Фото (${product.photos.length}):</span>
        <div class="modal-photos">
          ${product.photos.map(photo => `<img src="${photo}" alt="Фото товара" class="modal-photo">`).join('')}
        </div>
      </div>` : ''}
    </div>`;
  });

  // Информация о получателях
  if (orderData.delivery.recipients.length > 0) {
    if (orderData.delivery.type === 'same') {
      const recipient = orderData.delivery.recipients[0];
      summaryHTML += `<div class="preview-item">
        <h4>Получатель (общий)</h4>
        ${recipient.name ? `<div class="preview-field">
          <span class="preview-field-label">ФИО:</span>
          <span class="preview-field-value">${recipient.name}</span>
        </div>` : ''}
        ${recipient.username ? `<div class="preview-field">
          <span class="preview-field-label">Юзернейм:</span>
          <span class="preview-field-value">@${recipient.username}</span>
        </div>` : ''}
        ${recipient.address ? `<div class="preview-field">
          <span class="preview-field-label">ПВЗ СДЭК:</span>
          <span class="preview-field-value">${recipient.address}</span>
        </div>` : ''}
      </div>`;
    } else {
      orderData.delivery.recipients.forEach((recipient, index) => {
        summaryHTML += `<div class="preview-item">
          <h4>Получатель ${index + 1}</h4>
          ${recipient.name ? `<div class="preview-field">
            <span class="preview-field-label">ФИО:</span>
            <span class="preview-field-value">${recipient.name}</span>
          </div>` : ''}
          ${recipient.username ? `<div class="preview-field">
            <span class="preview-field-label">Юзернейм:</span>
            <span class="preview-field-value">@${recipient.username}</span>
          </div>` : ''}
          ${recipient.address ? `<div class="preview-field">
            <span class="preview-field-label">ПВЗ СДЭК:</span>
            <span class="preview-field-value">${recipient.address}</span>
          </div>` : ''}
        </div>`;
      });
    }
  }

  // Находим контейнер для содержимого заказа
  const summaryContent = document.getElementById('orderProductContent');
  if (summaryContent) {
    summaryContent.innerHTML = summaryHTML;
  }

  console.log('Order modal shown');
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Order modal closed');
  }
}

function confirmOrder() {
  const orderData = window.currentOrderData;

  if (!orderData) {
    console.error('No order data found');
    return;
  }

  console.log('Order confirmed:', orderData);

  // Показать индикатор загрузки
  const confirmBtn = document.querySelector('.order-confirm-btn');
  const originalText = confirmBtn.textContent;
  confirmBtn.textContent = 'Отправка...';
  confirmBtn.disabled = true;

  // Оптимизируем данные для отправки (убираем большие фотографии)
  const optimizedOrderData = {
    command: 'create_order',
    country: orderData.country,
    delivery_type: orderData.delivery.type,
    common_recipient: orderData.delivery.recipients[0] || {},
    items: orderData.products.map((product, index) => ({
      marketplace: product.marketplace,
      link_or_id: product.link,
      color: product.color,
      size: product.size,
      quantity: parseInt(product.quantity),
      comment: product.comment,
      photos: product.photos.map(photo => {
        // Сжимаем base64 фотографии или заменяем на краткое описание
        if (photo.startsWith('data:image/')) {
          // Берем только первые 100 символов base64 + информацию о размере
          const base64Data = photo.split(',')[1];
          const sizeInfo = Math.round(base64Data.length * 0.75); // Примерный размер в байтах
          return `[PHOTO_${index + 1}_${sizeInfo}B]`;
        }
        return photo;
      }),
      // Добавляем информацию о количестве фотографий
      photo_count: product.photos.length
    })),
    full_name: orderData.delivery.recipients[0]?.name || '',
    telegram_username: orderData.delivery.recipients[0]?.username || ''
  };

  console.log('Optimized order data:', optimizedOrderData);
  console.log('Data size:', JSON.stringify(optimizedOrderData).length, 'characters');

  // Имитация задержки отправки
  setTimeout(() => {
    // Отправка данных через Telegram WebApp API
    if (window.Telegram?.WebApp) {
      try {
        const dataString = JSON.stringify(optimizedOrderData);

        // Проверяем размер данных (Telegram WebApp имеет лимит ~4096 символов)
        if (dataString.length > 4000) {
          console.warn('Data too large, further optimization needed');
          // Дополнительная оптимизация - убираем все фотографии
          const minimalData = {
            ...optimizedOrderData,
            items: optimizedOrderData.items.map(item => ({
              ...item,
              photos: [], // Убираем фотографии полностью
              has_photos: item.photo_count > 0 // Только флаг наличия фотографий
            }))
          };

          window.Telegram.WebApp.sendData(JSON.stringify(minimalData));
          console.log('Minimal order data sent via Telegram WebApp');
        } else {
          window.Telegram.WebApp.sendData(dataString);
          console.log('Optimized order data sent via Telegram WebApp');
        }
      } catch (error) {
        console.error('Error sending order data:', error);
        alert('Ошибка отправки заказа. Попробуйте еще раз.');
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
        return;
      }
    } else {
      console.log('Telegram WebApp not available - order data logged to console');
    }

    // Закрыть модальное окно
    closeOrderModal();

    // Показать уведомление об успешной отправке
    showSuccessMessage();

    // Сбросить форму
    resetOrderForm();

  }, 1000); // Задержка 1 секунда для UX
}

// Закрытие модального окна по клику вне его области
document.addEventListener('click', function (event) {
  const orderModal = document.getElementById('orderModal');
  const photoModal = document.getElementById('orderPhotoModal');

  if (photoModal && event.target === photoModal) {
    closeOrderPhotoPreview();
  } else if (orderModal && event.target === orderModal) {
    closeOrderModal();
  }
});

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    // Проверяем какое модальное окно открыто
    const photoModal = document.getElementById('orderPhotoModal');
    const orderModal = document.getElementById('orderModal');

    if (photoModal && photoModal.style.display === 'flex') {
      closeOrderPhotoPreview();
    } else if (orderModal && orderModal.style.display === 'flex') {
      closeOrderModal();
    }
  }
});

// Функция валидации формы заказа
function validateOrderForm() {
  const errors = [];

  // Проверка выбора страны
  if (!selectedCountry) {
    errors.push('Выберите страну доставки');
  }

  // Проверка товаров
  if (totalProducts === 0) {
    errors.push('Добавьте хотя бы один товар');
  }

  // Проверка каждого товара
  document.querySelectorAll('.product-form').forEach((form, index) => {
    const productNumber = index + 1;

    // Для Китая проверяем выбор площадки
    if (selectedCountry === 'china') {
      const marketplace = form.querySelector('.marketplace-select')?.value;
      if (!marketplace) {
        errors.push(`Товар ${productNumber}: выберите площадку`);
      }
    }

    // Проверка ссылки на товар
    const link = form.querySelector('.product-link')?.value;
    if (!link || link.trim() === '') {
      errors.push(`Товар ${productNumber}: введите ссылку на товар`);
    }

    // Проверка цвета
    const color = form.querySelector('.product-color')?.value;
    if (!color || color.trim() === '') {
      errors.push(`Товар ${productNumber}: введите цвет товара`);
    }

    // Проверка размера
    const size = form.querySelector('.product-size')?.value;
    if (!size || size.trim() === '') {
      errors.push(`Товар ${productNumber}: введите размер товара`);
    }

    // Проверка количества
    const quantity = form.querySelector('.product-quantity')?.value;
    if (!quantity || parseInt(quantity) < 1) {
      errors.push(`Товар ${productNumber}: укажите корректное количество`);
    }
  });

  // Проверка данных получателя
  const recipientName = document.getElementById('recipientName')?.value;
  const recipientUsername = document.getElementById('recipientUsername')?.value;
  const recipientAddress = document.getElementById('recipientAddress')?.value;

  if (!recipientName || recipientName.trim() === '') {
    errors.push('Введите ФИО получателя');
  }

  if (!recipientUsername || recipientUsername.trim() === '') {
    errors.push('Введите юзернейм получателя');
  }

  if (!recipientAddress || recipientAddress.trim() === '') {
    errors.push('Введите адрес ПВЗ СДЭК');
  }

  return errors;
}

// Функция показа ошибок валидации
function showValidationErrors(errors) {
  const errorContainer = document.getElementById('validationError');

  if (!errorContainer) {
    // Создаем контейнер для ошибок если его нет
    const container = document.createElement('div');
    container.id = 'validationError';
    container.className = 'validation-error';

    // Вставляем перед кнопкой создания заказа
    const submitBtn = document.querySelector('.submit-order-btn');
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(container, submitBtn);
    }
  }

  const container = document.getElementById('validationError');
  container.innerHTML = errors.map(error => `• ${error}`).join('<br>');
  container.classList.add('show');

  // Скрыть ошибки через 10 секунд
  setTimeout(() => {
    container.classList.remove('show');
  }, 10000);

  // Прокрутить к ошибкам
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Функция показа успешного сообщения
function showSuccessMessage() {
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.innerHTML = `
    <div class="success-content">
      <div class="success-icon">✓</div>
      <div class="success-text">
        <h3>Заказ отправлен!</h3>
        <p>Менеджер свяжется с вами в ближайшее время</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Показать уведомление
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Скрыть уведомление через 4 секунды
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// Функция сброса формы заказа
function resetOrderForm() {
  // Сброс выбора страны
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.value = '';
    selectedCountry = '';
  }

  // Скрыть секции
  const productsSection = document.getElementById('productsSection');
  const recipientSection = document.getElementById('recipientSection');

  if (productsSection) {
    productsSection.style.display = 'none';
  }

  if (recipientSection) {
    recipientSection.style.display = 'none';
  }

  // Сбросить товары к начальному состоянию
  resetProductsToInitialState();

  // Очистить форму получателя
  clearRecipientForm();

  // Очистить ошибки валидации
  const errorContainer = document.getElementById('validationError');
  if (errorContainer) {
    errorContainer.classList.remove('show');
    errorContainer.innerHTML = '';
  }

  console.log('Order form reset');
}
// Функция очистки формы получателя
function clearRecipientForm() {
  // Очистить общие данные получателя
  const recipientName = document.getElementById('recipientName');
  const recipientUsername = document.getElementById('recipientUsername');
  const recipientAddress = document.getElementById('recipientAddress');

  if (recipientName) recipientName.value = '';
  if (recipientUsername) recipientUsername.value = '';
  if (recipientAddress) recipientAddress.value = '';

  // Очистить индивидуальные формы получателей
  const individualData = document.getElementById('individualRecipientData');
  if (individualData) {
    const recipientForms = individualData.querySelectorAll('.recipient-form');
    recipientForms.forEach(form => {
      const nameField = form.querySelector('.recipient-name');
      const usernameField = form.querySelector('.recipient-username');
      const addressField = form.querySelector('.recipient-address');

      if (nameField) nameField.value = '';
      if (usernameField) usernameField.value = '';
      if (addressField) addressField.value = '';
    });
  }

  // Сбросить тип доставки
  const deliveryTypeSelect = document.getElementById('deliveryType');
  if (deliveryTypeSelect) {
    deliveryTypeSelect.value = 'same';
  }

  console.log('Recipient form cleared');
}
// Функция создания табов товаров
function createProductTabs(products) {
  const tabsContainer = document.getElementById('orderProductTabs');
  const contentContainer = document.getElementById('orderProductContent');

  if (!tabsContainer || !contentContainer) {
    console.error('Product containers not found');
    return;
  }

  // Скрываем контейнер табов и показываем только контент
  tabsContainer.style.display = 'none';
  contentContainer.innerHTML = '';

  // Создаем карточки товаров (вместо табов)
  products.forEach((product, index) => {
    console.log('Processing product', index, 'with photos:', product.photos);
    // Создаем карточку товара
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.style.cssText = `
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      color: #fff;
    `;

    let productHTML = '';

    if (product.marketplace) {
      const marketplaceName = product.marketplace === 'category1' ?
        'Категория 1 (POIZON, TaoBao, Weidan)' :
        'Категория 2 (WeChat, Yupoo, GooFish)';
      productHTML += `<div class="order-product-field">
        <span class="order-field-label">Площадка:</span>
        <span class="order-field-value">${marketplaceName}</span>
      </div>`;
    }

    if (product.link) {
      productHTML += `<div class="order-product-field">
        <span class="order-field-label">Ссылка:</span>
        <span class="order-field-value">${product.link}</span>
      </div>`;
    }

    if (product.color) {
      productHTML += `<div class="order-product-field">
        <span class="order-field-label">Цвет:</span>
        <span class="order-field-value">${product.color}</span>
      </div>`;
    }

    if (product.size) {
      productHTML += `<div class="order-product-field">
        <span class="order-field-label">Размер:</span>
        <span class="order-field-value">${product.size}</span>
      </div>`;
    }

    if (product.quantity) {
      productHTML += `<div class="order-product-field">
        <span class="order-field-label">Количество:</span>
        <span class="order-field-value">${product.quantity}</span>
      </div>`;
    }

    if (product.comment) {
      productHTML += `<div class="order-product-field">
        <span class="order-field-label">Комментарий:</span>
        <span class="order-field-value">${product.comment}</span>
      </div>`;
    }

    // Добавляем фотографии
    if (product.photos && product.photos.length > 0) {
      productHTML += `<div class="product-field">
        <span class="field-label">Фото (${product.photos.length}):</span>
        <span class="field-value"></span>
      </div>`;
      productHTML += `<div class="product-photos-preview">
        ${product.photos.map((photo, photoIndex) => `<img src="${photo}" alt="Фото товара" class="product-photo-thumb" data-photo="${photo}" data-index="${photoIndex}">`).join('')}
      </div>`;
    }

    productCard.innerHTML = productHTML;
    contentContainer.appendChild(productCard);
  });

  // Добавляем обработчики событий для фото
  setTimeout(() => {
    const photoThumbs = contentContainer.querySelectorAll('.product-photo-thumb');
    console.log('Setting up photo click handlers for', photoThumbs.length, 'photos');

    photoThumbs.forEach(thumb => {
      thumb.addEventListener('click', function () {
        const photoSrc = this.getAttribute('data-photo');
        console.log('Photo clicked, opening preview for:', photoSrc);
        openOrderPhotoPreview(photoSrc);
      });
    });
  }, 100);
}

// Функция переключения табов товаров
function selectOrderProductTab(index) {
  console.log('Switching to order product tab:', index);

  // Убираем активный класс со всех табов
  document.querySelectorAll('.order-product-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Скрываем все товары
  document.querySelectorAll('.order-product-item').forEach(item => {
    item.classList.remove('active');
  });

  // Активируем выбранный таб и товар
  const selectedTab = document.querySelectorAll('.order-product-tab')[index];
  const selectedItem = document.querySelector(`.order-product-item[data-product="${index}"]`);

  if (selectedTab) {
    selectedTab.classList.add('active');
    console.log('Tab activated:', index);
  }

  if (selectedItem) {
    selectedItem.classList.add('active');
    console.log('Product item activated:', index);
  }
}

// Функция заполнения информации о получателях
function fillRecipientsInfo(recipients) {
  const container = document.getElementById('orderRecipientsContent');

  if (!container) {
    console.error('Recipients container not found');
    return;
  }

  container.innerHTML = '';

  recipients.forEach((recipient, index) => {
    const recipientItem = document.createElement('div');
    recipientItem.className = 'order-recipient-item';

    const title = recipients.length > 1 ? `Получатель ${index + 1}` : 'Получатель';

    let recipientHTML = `<h4>${title}</h4>`;

    if (recipient.name) {
      recipientHTML += `<div class="order-product-field">
        <span class="order-field-label">ФИО:</span>
        <span class="order-field-value">${recipient.name}</span>
      </div>`;
    }

    if (recipient.username) {
      recipientHTML += `<div class="order-product-field">
        <span class="order-field-label">Юзернейм:</span>
        <span class="order-field-value">${recipient.username}</span>
      </div>`;
    }

    if (recipient.address) {
      recipientHTML += `<div class="order-product-field">
        <span class="order-field-label">Адрес ПВЗ:</span>
        <span class="order-field-value">${recipient.address}</span>
      </div>`;
    }

    recipientItem.innerHTML = recipientHTML;
    container.appendChild(recipientItem);
  });
}
// Функция предпросмотра фото в модальном окне заказа
function openOrderPhotoPreview(imageSrc) {
  // Скрываем модальное окно заказа
  const orderModal = document.getElementById('orderModal');
  if (orderModal) {
    orderModal.style.display = 'none';
  }

  // Создаем модальное окно для фото если его нет
  let photoModal = document.getElementById('orderPhotoModal');
  if (!photoModal) {
    photoModal = document.createElement('div');
    photoModal.id = 'orderPhotoModal';
    photoModal.className = 'order-photo-modal';
    photoModal.innerHTML = `
      <div class="order-photo-modal-content">
        <div class="order-photo-modal-header">
          <h3>Предпросмотр фото</h3>
          <button class="order-photo-modal-close" onclick="closeOrderPhotoPreview()">&times;</button>
        </div>
        <div class="order-photo-modal-body">
          <img id="orderPhotoPreview" src="" alt="Предпросмотр фото">
        </div>
        <div class="order-photo-modal-footer">
          <button class="order-photo-back-btn" onclick="closeOrderPhotoPreview()">Назад к заказу</button>
        </div>
      </div>
    `;
    document.body.appendChild(photoModal);
  }

  // Устанавливаем изображение
  const photoPreview = document.getElementById('orderPhotoPreview');
  if (photoPreview) {
    photoPreview.src = imageSrc;
  }

  // Показываем модальное окно фото
  photoModal.style.display = 'flex';
}

// Функция закрытия предпросмотра фото
function closeOrderPhotoPreview() {
  const photoModal = document.getElementById('orderPhotoModal');
  if (photoModal) {
    photoModal.style.display = 'none';
  }

  // Показываем обратно модальное окно заказа
  const orderModal = document.getElementById('orderModal');
  if (orderModal) {
    orderModal.style.display = 'flex';
  }
}

// Функция предпросмотра фото в карточках товаров
function openProductPhotoPreview(imageSrc) {
  console.log('openProductPhotoPreview called with:', imageSrc);

  // Создаем модальное окно для фото если его нет
  let photoModal = document.getElementById('productPhotoModal');
  if (!photoModal) {
    photoModal = document.createElement('div');
    photoModal.id = 'productPhotoModal';
    photoModal.className = 'product-photo-modal';
    photoModal.innerHTML = `
      <div class="product-photo-modal-content">
        <img id="productPhotoPreview" src="" alt="Предпросмотр фото">
        <button class="product-photo-close" onclick="closeProductPhotoPreview()">Закрыть</button>
      </div>
    `;
    document.body.appendChild(photoModal);

    // Закрытие по клику на фон
    photoModal.addEventListener('click', function (e) {
      if (e.target === photoModal) {
        closeProductPhotoPreview();
      }
    });
  }

  // Устанавливаем изображение и показываем модальное окно
  document.getElementById('productPhotoPreview').src = imageSrc;
  photoModal.style.display = 'flex';
}

// Функция закрытия предпросмотра фото
function closeProductPhotoPreview() {
  const photoModal = document.getElementById('productPhotoModal');
  if (photoModal) {
    photoModal.style.display = 'none';
  }
}