// JavaScript для страницы заказов (order.html) - полная версия

var currentCountry = '';
var productCount = 1;
var maxProducts = 3;

// Инициализация страницы заказов
function initOrderPage() {
  console.log('📝 Инициализация страницы заказов');
  
  // Инициализируем обработчики
  initEventHandlers();
  
  // Сбрасываем счетчик товаров
  productCount = 1;
  
  // Убеждаемся, что первый таб активен
  selectProduct(1);
  
  // Обновляем кнопки удаления и выбор получателя (должны быть скрыты для одного товара)
  updateDeleteButtons();
  
  console.log('✅ Страница заказов инициализирована');
}

// Инициализация обработчиков событий
function initEventHandlers() {
  // Обработчик изменения страны
  var countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.addEventListener('change', function() {
      handleCountryChange(this.value);
    });
  }
  
  // Обработчик отправки формы
  var orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitOrder();
    });
  }
}

// Обработка изменения страны
function handleCountryChange(country) {
  console.log('🌍 Выбрана страна:', country);
  currentCountry = country;
  
  var productsSection = document.getElementById('productsSection');
  if (productsSection) {
    productsSection.style.display = 'block';
    
    // Показываем секцию площадок для Китая
    var marketplaceSection = document.querySelector('.marketplace-section');
    if (marketplaceSection) {
      marketplaceSection.style.display = country === 'china' ? 'block' : 'none';
    }
    
    // Обновляем плейсхолдеры для ссылок
    updateLinkPlaceholders(country);
  }
}

// Обновление плейсхолдеров для ссылок
function updateLinkPlaceholders(country) {
  var linkInputs = document.querySelectorAll('.product-link');
  var placeholder = country === 'china' 
    ? 'https://item.taobao.com/item.htm?id=...' 
    : 'https://item.rakuten.co.jp/...';
    
  for (var i = 0; i < linkInputs.length; i++) {
    linkInputs[i].placeholder = placeholder;
  }
}

// Добавление нового товара
function addProduct() {
  if (productCount >= maxProducts) {
    alert('Максимальное количество товаров: ' + maxProducts);
    return;
  }
  
  productCount++;
  console.log('➕ Добавляем товар #', productCount);
  
  // Показываем новый таб
  var newTab = document.querySelector('.product-tab[data-product="' + productCount + '"]');
  if (newTab) {
    newTab.style.display = 'inline-block';
  }
  
  // Создаем новую форму товара если её нет
  createProductForm(productCount);
  
  // Переключаемся на новый товар
  selectProduct(productCount);
  
  // Обновляем кнопки удаления
  updateDeleteButtons();
  
  // Скрываем кнопку добавления если достигли максимума
  if (productCount >= maxProducts) {
    var addBtn = document.querySelector('.add-product-btn');
    if (addBtn) {
      addBtn.style.display = 'none';
    }
  }
}

// Создание формы товара
function createProductForm(productNumber) {
  var container = document.getElementById('productFormsContainer');
  if (!container) return;
  
  // Проверяем, есть ли уже форма
  var existingForm = container.querySelector('[data-product="' + productNumber + '"]');
  if (existingForm) return;
  
  var formHTML = '<div class="product-form" data-product="' + productNumber + '" style="display: none;">';
  formHTML += '<div class="marketplace-section form-group" style="display: ' + (currentCountry === 'china' ? 'block' : 'none') + ';">';
  formHTML += '<label class="form-label">Выберите площадку</label>';
  formHTML += '<select class="marketplace-select order-select">';
  formHTML += '<option value="">Выберите площадку</option>';
  formHTML += '<option value="category1">POIZON, TaoBao, Weidan</option>';
  formHTML += '<option value="category2">WeChat, Yupoo, GooFish</option>';
  formHTML += '</select>';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Загрузите фото товара</label>';
  formHTML += '<button type="button" class="photo-upload-btn" onclick="uploadPhoto(' + productNumber + ')">';
  formHTML += '<img src="img/order_add_photo.svg" alt="Добавить фото">';
  formHTML += '</button>';
  formHTML += '<input type="file" class="photo-input" accept="image/*" multiple style="display: none;" onchange="handlePhotoUpload(this, ' + productNumber + ')">';
  formHTML += '<div class="photo-preview-container"></div>';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label link-label">Вставьте ссылку</label>';
  formHTML += '<input type="url" class="product-link order-input" placeholder="">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите цвет</label>';
  formHTML += '<input type="text" class="product-color order-input" placeholder="-" value="-">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите размер</label>';
  formHTML += '<input type="text" class="product-size order-input" placeholder="-" value="-">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите количество</label>';
  formHTML += '<input type="number" class="product-quantity order-input" placeholder="1" min="1" max="99" value="1">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите комментарий</label>';
  formHTML += '<textarea class="product-comment order-textarea" placeholder="-">-</textarea>';
  formHTML += '</div>';
  
  formHTML += '<button type="button" class="delete-product-btn" onclick="deleteProduct(' + productNumber + ')">';
  formHTML += '<img src="img/order_delete_item.svg" alt="Удалить товар">';
  formHTML += '</button>';
  
  formHTML += '</div>';
  
  container.insertAdjacentHTML('beforeend', formHTML);
}

// Удаление товара
function deleteProduct(productNumber) {
  console.log('🗑️ Удаление товара #', productNumber);
  
  // Считаем видимые табы
  var allTabs = document.querySelectorAll('.product-tab[data-product]');
  var visibleTabsCount = 0;
  
  for (var i = 0; i < allTabs.length; i++) {
    var tab = allTabs[i];
    var style = window.getComputedStyle(tab);
    if (style.display !== 'none') {
      visibleTabsCount++;
    }
  }
  
  // Не даем удалить последний товар
  if (visibleTabsCount <= 1) {
    alert('Нельзя удалить последний товар');
    return;
  }
  
  // Скрываем таб
  var tab = document.querySelector('.product-tab[data-product="' + productNumber + '"]');
  if (tab) {
    tab.style.display = 'none';
  }
  
  // Удаляем форму
  var form = document.querySelector('.product-form[data-product="' + productNumber + '"]');
  if (form) {
    form.remove();
  }
  
  // Показываем кнопку добавления если скрыта
  var addBtn = document.querySelector('.add-product-btn');
  if (addBtn) {
    addBtn.style.display = 'inline-block';
  }
  
  // Переключаемся на первый доступный товар
  var firstVisibleTab = null;
  for (var i = 0; i < allTabs.length; i++) {
    var tabStyle = window.getComputedStyle(allTabs[i]);
    if (tabStyle.display !== 'none') {
      firstVisibleTab = allTabs[i];
      break;
    }
  }
  
  if (firstVisibleTab) {
    var firstProductNumber = firstVisibleTab.getAttribute('data-product');
    selectProduct(parseInt(firstProductNumber));
  }
  
  // Обновляем кнопки удаления
  updateDeleteButtons();
}

// Обновление кнопок удаления и выбора получателя
function updateDeleteButtons() {
  // Считаем видимые табы более надежным способом
  var allTabs = document.querySelectorAll('.product-tab[data-product]');
  var visibleTabsCount = 0;
  
  for (var i = 0; i < allTabs.length; i++) {
    var tab = allTabs[i];
    var style = window.getComputedStyle(tab);
    if (style.display !== 'none') {
      visibleTabsCount++;
    }
  }
  
  console.log('🔍 Видимых табов:', visibleTabsCount);
  
  var showDeleteButtons = visibleTabsCount > 1;
  var showDeliveryTypeSelection = visibleTabsCount > 1;
  
  // Обновляем кнопки удаления
  var deleteBtns = document.querySelectorAll('.delete-product-btn');
  console.log('🗑️ Кнопок удаления найдено:', deleteBtns.length);
  
  for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].style.display = showDeleteButtons ? 'block' : 'none';
    console.log('🗑️ Кнопка удаления #' + (i + 1) + ':', showDeleteButtons ? 'показана' : 'скрыта');
  }
  
  // Обновляем секцию выбора способа доставки
  var deliveryTypeSection = document.getElementById('deliveryTypeSection');
  if (deliveryTypeSection) {
    deliveryTypeSection.style.display = showDeliveryTypeSelection ? 'block' : 'none';
    console.log('📦 Выбор способа доставки:', showDeliveryTypeSelection ? 'показан' : 'скрыт');
    
    // Если товар один, принудительно устанавливаем "на один адрес"
    if (!showDeliveryTypeSelection) {
      var deliveryTypeSelect = document.getElementById('deliveryType');
      if (deliveryTypeSelect) {
        deliveryTypeSelect.value = 'same';
        handleDeliveryTypeChange('same');
      }
    }
  }
}

// Выбор товара
function selectProduct(productNumber) {
  console.log('🎯 Выбран товар #', productNumber);
  
  // Создаем форму если её нет
  createProductForm(productNumber);
  
  // Скрываем все формы
  var forms = document.querySelectorAll('.product-form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].style.display = 'none';
    forms[i].classList.remove('active');
  }
  
  // Показываем выбранную форму
  var selectedForm = document.querySelector('.product-form[data-product="' + productNumber + '"]');
  if (selectedForm) {
    selectedForm.style.display = 'block';
    selectedForm.classList.add('active');
  } else {
    console.error('Форма товара #' + productNumber + ' не найдена');
  }
  
  // Обновляем табы
  var tabs = document.querySelectorAll('.product-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  
  var selectedTab = document.querySelector('.product-tab[data-product="' + productNumber + '"]');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Показываем секцию получателя если есть товары
  showRecipientSection();
  
  // Обновляем кнопки удаления и выбор получателя
  updateDeleteButtons();
}

// Показать секцию получателя
function showRecipientSection() {
  var recipientSection = document.getElementById('recipientSection');
  if (recipientSection) {
    recipientSection.style.display = 'block';
  }
}

// Обработка изменения способа доставки
function handleDeliveryTypeChange(deliveryType) {
  console.log('🚚 Выбран способ доставки:', deliveryType);
  
  var commonRecipientData = document.getElementById('commonRecipientData');
  var individualRecipientData = document.getElementById('individualRecipientData');
  
  if (deliveryType === 'same') {
    // Показываем общие данные получателя
    if (commonRecipientData) {
      commonRecipientData.style.display = 'block';
    }
    if (individualRecipientData) {
      individualRecipientData.style.display = 'none';
    }
  } else if (deliveryType === 'different') {
    // Показываем индивидуальные данные для каждого товара
    if (commonRecipientData) {
      commonRecipientData.style.display = 'none';
    }
    if (individualRecipientData) {
      individualRecipientData.style.display = 'block';
      createIndividualRecipientForms();
    }
  }
}

// Создание индивидуальных форм получателей
function createIndividualRecipientForms() {
  var container = document.getElementById('recipientDataContainer');
  if (!container) return;
  
  var visibleTabs = document.querySelectorAll('.product-tab[style*="inline-block"], .product-tab:not([style*="none"])');
  var formsHTML = '';
  
  for (var i = 0; i < visibleTabs.length; i++) {
    var productNumber = visibleTabs[i].getAttribute('data-product');
    
    formsHTML += '<div class="individual-recipient-form" data-product="' + productNumber + '">';
    formsHTML += '<h3>Получатель для товара ' + productNumber + '</h3>';
    
    formsHTML += '<div class="form-group">';
    formsHTML += '<label class="form-label">ФИО получателя</label>';
    formsHTML += '<input type="text" class="recipient-name order-input" placeholder="">';
    formsHTML += '</div>';
    
    formsHTML += '<div class="form-group">';
    formsHTML += '<label class="form-label">Номер телефона</label>';
    formsHTML += '<input type="tel" class="recipient-phone order-input" placeholder="+7 (___) ___-__-__">';
    formsHTML += '</div>';
    
    formsHTML += '<div class="form-group">';
    formsHTML += '<label class="form-label">Адрес доставки</label>';
    formsHTML += '<textarea class="recipient-address order-textarea" placeholder=""></textarea>';
    formsHTML += '</div>';
    
    formsHTML += '</div>';
  }
  
  container.innerHTML = formsHTML;
}

// Загрузка фото
function uploadPhoto(productNumber) {
  console.log('📷 Загрузка фото для товара #', productNumber);
  
  var form = document.querySelector('[data-product="' + productNumber + '"]');
  if (form) {
    var fileInput = form.querySelector('.photo-input');
    if (fileInput) {
      fileInput.click();
    }
  }
}

// Обработка загрузки фото
function handlePhotoUpload(input, productNumber) {
  console.log('📸 Обработка загрузки фото для товара #', productNumber);
  
  var files = input.files;
  if (files.length === 0) return;
  
  var form = document.querySelector('.product-form[data-product="' + productNumber + '"]');
  if (!form) return;
  
  var previewContainer = form.querySelector('.photo-preview-container');
  if (!previewContainer) return;
  
  // Ограничиваем количество фото
  var maxPhotos = 3;
  var currentPhotos = previewContainer.querySelectorAll('.photo-preview').length;
  var availableSlots = maxPhotos - currentPhotos;
  
  if (availableSlots <= 0) {
    alert('Максимальное количество фото: ' + maxPhotos);
    return;
  }
  
  var filesToProcess = Math.min(files.length, availableSlots);
  
  for (var i = 0; i < filesToProcess; i++) {
    var file = files[i];
    if (file.type.indexOf('image/') === 0) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл ' + file.name + ' слишком большой. Максимальный размер: 5MB');
        continue;
      }
      
      var reader = new FileReader();
      reader.onload = function(e) {
        var preview = document.createElement('div');
        preview.className = 'photo-preview';
        preview.innerHTML = '<img src="' + e.target.result + '" alt="Фото товара" onclick="showPhotoModal(this.src)"><button type="button" onclick="removePhoto(this)" class="remove-photo">×</button>';
        previewContainer.appendChild(preview);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Очищаем input для возможности повторной загрузки
  input.value = '';
}

// Удаление фото
function removePhoto(button) {
  var preview = button.parentNode;
  if (preview) {
    preview.remove();
  }
}

// Показать фото в модальном окне
function showPhotoModal(imageSrc) {
  // Создаем модальное окно для фото если его нет
  var existingModal = document.getElementById('photoModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  var modal = document.createElement('div');
  modal.id = 'photoModal';
  modal.className = 'photo-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  
  modal.innerHTML = '<div style="position: relative; max-width: 90%; max-height: 90%;"><img src="' + imageSrc + '" style="max-width: 100%; max-height: 100%; object-fit: contain;"><button onclick="closePhotoModal()" style="position: absolute; top: -10px; right: -10px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button></div>';
  
  modal.onclick = function(e) {
    if (e.target === modal) {
      closePhotoModal();
    }
  };
  
  document.body.appendChild(modal);
}

// Закрыть модальное окно фото
function closePhotoModal() {
  var modal = document.getElementById('photoModal');
  if (modal) {
    modal.remove();
  }
}

// Отправка заказа
function submitOrder() {
  console.log('📤 Отправка заказа');
  
  try {
    // Собираем данные заказа
    var orderData = collectOrderData();
    
    if (!validateOrderData(orderData)) {
      return;
    }
    
    // Показываем модальное окно подтверждения
    showOrderModal(orderData);
    
  } catch (error) {
    console.error('❌ Ошибка при отправке заказа:', error);
    alert('Ошибка при обработке заказа: ' + error.message);
  }
}

// Сбор данных заказа
function collectOrderData() {
  var user = getTelegramUser();
  var deliveryType = document.getElementById('deliveryType').value;
  
  var orderData = {
    telegram_user_id: user ? user.id : 919034275,
    user_name: user ? (user.first_name + ' ' + (user.last_name || '')).replace(/\s+/g, ' ').trim() : 'Test User',
    telegram_username: user ? user.username : 'test_user',
    country: currentCountry,
    delivery_type: deliveryType,
    items: [],
    comment: 'Заказ через веб-интерфейс'
  };
  
  if (deliveryType === 'same') {
    // Общие данные получателя
    var recipientNameEl = document.getElementById('recipientName');
    var recipientPhoneEl = document.getElementById('recipientPhone');
    var recipientAddressEl = document.getElementById('recipientAddress');
    
    orderData.full_name = (recipientNameEl && recipientNameEl.value) || '';
    orderData.phone = (recipientPhoneEl && recipientPhoneEl.value) || '';
    orderData.delivery_address = (recipientAddressEl && recipientAddressEl.value) || '';
  }
  
  // Собираем товары
  var forms = document.querySelectorAll('.product-form');
  for (var i = 0; i < forms.length; i++) {
    var form = forms[i];
    var productNumber = form.getAttribute('data-product');
    var linkElement = form.querySelector('.product-link');
    var link = linkElement ? linkElement.value : '';
    
    if (link) {
      var colorElement = form.querySelector('.product-color');
      var sizeElement = form.querySelector('.product-size');
      var quantityElement = form.querySelector('.product-quantity');
      var commentElement = form.querySelector('.product-comment');
      
      var item = {
        link_or_id: link,
        color: (colorElement && colorElement.value) || '-',
        size: (sizeElement && sizeElement.value) || '-',
        quantity: (quantityElement && quantityElement.value) || '1',
        comment: (commentElement && commentElement.value) || '-',
        photos: []
      };
      
      // Если индивидуальная доставка, добавляем данные получателя для каждого товара
      if (deliveryType === 'different') {
        var recipientForm = document.querySelector('.individual-recipient-form[data-product="' + productNumber + '"]');
        if (recipientForm) {
          var nameEl = recipientForm.querySelector('.recipient-name');
          var phoneEl = recipientForm.querySelector('.recipient-phone');
          var addressEl = recipientForm.querySelector('.recipient-address');
          
          item.recipient = {
            name: (nameEl && nameEl.value) || '',
            phone: (phoneEl && phoneEl.value) || '',
            address: (addressEl && addressEl.value) || ''
          };
        }
      }
      
      // Собираем фото (base64)
      var photos = form.querySelectorAll('.photo-preview img');
      for (var j = 0; j < photos.length; j++) {
        if (photos[j].src.indexOf('data:image/') === 0) {
          item.photos.push(photos[j].src);
        }
      }
      
      orderData.items.push(item);
    }
  }
  
  return orderData;
}

// Валидация данных заказа
function validateOrderData(orderData) {
  if (!orderData.country) {
    alert('Пожалуйста, выберите страну выкупа');
    return false;
  }
  
  if (orderData.items.length === 0) {
    alert('Пожалуйста, добавьте хотя бы один товар');
    return false;
  }
  
  if (orderData.delivery_type === 'same') {
    // Валидация общих данных получателя
    if (!orderData.full_name || !orderData.full_name.trim()) {
      alert('Пожалуйста, введите ваше ФИО');
      return false;
    }
    
    if (!orderData.phone || !orderData.phone.trim()) {
      alert('Пожалуйста, введите ваш номер телефона');
      return false;
    }
  } else if (orderData.delivery_type === 'different') {
    // Валидация индивидуальных данных получателей
    for (var i = 0; i < orderData.items.length; i++) {
      var item = orderData.items[i];
      if (!item.recipient || !item.recipient.name || !item.recipient.name.trim()) {
        alert('Пожалуйста, введите ФИО получателя для товара ' + (i + 1));
        return false;
      }
      
      if (!item.recipient.phone || !item.recipient.phone.trim()) {
        alert('Пожалуйста, введите номер телефона получателя для товара ' + (i + 1));
        return false;
      }
    }
  }
  
  return true;
}

// Показать модальное окно подтверждения
function showOrderModal(orderData) {
  console.log('📋 Показываем модальное окно подтверждения');
  
  var modal = document.getElementById('orderModal');
  if (modal) {
    // Заполняем данные в модальном окне
    fillOrderModal(orderData);
    modal.style.display = 'block';
  } else {
    // Если модального окна нет, отправляем сразу
    confirmOrder(orderData);
  }
}

// Заполнение модального окна
function fillOrderModal(orderData) {
  // Заполняем основную информацию
  var countryElement = document.getElementById('orderCountry');
  if (countryElement) {
    countryElement.textContent = orderData.country === 'china' ? '🇨🇳 Китай' : '🇯🇵 Япония';
  }
  
  // Создаем табы для товаров
  var productTabs = document.getElementById('orderProductTabs');
  var productsContent = document.getElementById('orderProductContent');
  
  if (productTabs && productsContent) {
    var tabsHTML = '';
    var contentHTML = '';
    
    for (var i = 0; i < orderData.items.length; i++) {
      var item = orderData.items[i];
      var isActive = i === 0 ? ' active' : '';
      
      // Создаем таб
      tabsHTML += '<button type="button" class="order-product-tab' + isActive + '" onclick="showOrderProduct(' + (i + 1) + ')">Товар ' + (i + 1) + '</button>';
      
      // Создаем контент
      contentHTML += '<div class="order-product-item' + isActive + '" data-product="' + (i + 1) + '">';
      contentHTML += '<div class="order-item-details">';
      contentHTML += '<p><strong>Ссылка:</strong> <a href="' + item.link_or_id + '" target="_blank">' + item.link_or_id.substring(0, 50) + '...</a></p>';
      contentHTML += '<p><strong>Цвет:</strong> ' + item.color + '</p>';
      contentHTML += '<p><strong>Размер:</strong> ' + item.size + '</p>';
      contentHTML += '<p><strong>Количество:</strong> ' + item.quantity + '</p>';
      contentHTML += '<p><strong>Комментарий:</strong> ' + item.comment + '</p>';
      
      // Добавляем фото если есть
      if (item.photos && item.photos.length > 0) {
        contentHTML += '<div class="order-item-photos">';
        contentHTML += '<p><strong>Фото (' + item.photos.length + '):</strong></p>';
        contentHTML += '<div class="order-photos-grid">';
        for (var j = 0; j < item.photos.length; j++) {
          contentHTML += '<img src="' + item.photos[j] + '" alt="Фото товара" class="order-photo-thumb" onclick="showPhotoModal(\'' + item.photos[j] + '\')">';
        }
        contentHTML += '</div>';
        contentHTML += '</div>';
      }
      
      contentHTML += '</div>';
      contentHTML += '</div>';
    }
    
    productTabs.innerHTML = tabsHTML;
    productsContent.innerHTML = contentHTML;
  }
  
  // Заполняем информацию о получателе
  var recipientsContent = document.getElementById('orderRecipientsContent');
  if (recipientsContent) {
    recipientsContent.innerHTML = '<div class="recipient-info"><p><strong>ФИО:</strong> ' + orderData.full_name + '</p><p><strong>Телефон:</strong> ' + orderData.phone + '</p><p><strong>Адрес:</strong> ' + orderData.delivery_address + '</p></div>';
  }
}

// Показать товар в модальном окне
function showOrderProduct(productNumber) {
  // Обновляем табы
  var tabs = document.querySelectorAll('.order-product-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  
  var activeTab = document.querySelector('.order-product-tab:nth-child(' + productNumber + ')');
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Обновляем контент
  var items = document.querySelectorAll('.order-product-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.remove('active');
  }
  
  var activeItem = document.querySelector('.order-product-item[data-product="' + productNumber + '"]');
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// Закрытие модального окна
function closeOrderModal() {
  var modal = document.getElementById('orderModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Подтверждение заказа
function confirmOrder(orderData) {
  console.log('✅ Подтверждение заказа');
  
  if (!orderData) {
    orderData = collectOrderData();
  }
  
  // Отправляем заказ на сервер
  sendOrderToServer(orderData);
  
  // Закрываем модальное окно
  closeOrderModal();
}

// Отправка заказа на сервер
function sendOrderToServer(orderData) {
  console.log('📤 Отправка заказа на сервер:', orderData);
  
  // Используем XMLHttpRequest для совместимости
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:5000/api/orders', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        var result = JSON.parse(xhr.responseText);
        
        if (xhr.status === 200 && result.status === 'success') {
          alert('✅ Заказ успешно создан!\n\nID заказа: ' + result.order_id + '\n\nВы можете отслеживать его в разделе "Мои заказы"');
          
          // Очищаем форму
          resetOrderForm();
          
          // Переходим на страницу заказов
          setTimeout(function() {
            navigateTo('my-orders');
          }, 2000);
          
        } else {
          throw new Error(result.message || 'Неизвестная ошибка сервера');
        }
        
      } catch (error) {
        console.error('❌ Ошибка отправки заказа:', error);
        alert('❌ Ошибка при создании заказа:\n\n' + error.message + '\n\nПроверьте подключение к интернету и попробуйте снова.');
      }
    }
  };
  
  xhr.send(JSON.stringify(orderData));
}

// Сброс формы заказа
function resetOrderForm() {
  console.log('🔄 Сброс формы заказа');
  
  // Сбрасываем выбор страны
  var countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.value = '';
  }
  
  // Скрываем секции
  var productsSection = document.getElementById('productsSection');
  if (productsSection) {
    productsSection.style.display = 'none';
  }
  
  var recipientSection = document.getElementById('recipientSection');
  if (recipientSection) {
    recipientSection.style.display = 'none';
  }
  
  // Очищаем поля
  var inputs = document.querySelectorAll('.order-input, .order-textarea');
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    if (input.type === 'number') {
      input.value = '1';
    } else if (input.classList.contains('product-color') || input.classList.contains('product-size') || input.classList.contains('product-comment')) {
      input.value = '-';
    } else {
      input.value = '';
    }
  }
  
  // Сбрасываем товары
  productCount = 1;
  selectProduct(1);
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initOrderPage);

console.log('✅ Order.js (simple version) loaded');