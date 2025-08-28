// JavaScript для страницы заказов (order.html)

let currentCountry = '';
let currentProducts = [];
let productCount = 1;

// Инициализация страницы заказов
function initOrderPage() {
  console.log('📝 Инициализация страницы заказов');
  
  // Перемещаем кнопку назад вниз по центру
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.classList.add('bottom-center');
    console.log('🔙 Кнопка назад перемещена вниз по центру');
  }
  
  // Инициализируем обработчики
  initEventHandlers();
  
  // НЕ показываем товары и получателя до выбора страны
  const productsSection = document.getElementById('productsSection');
  if (productsSection) {
    productsSection.style.display = 'none';
  }
  
  const recipientSection = document.getElementById('recipientSection');
  if (recipientSection) {
    recipientSection.style.display = 'none';
  }
  
  console.log('✅ Страница заказов инициализирована');
}

// Инициализация обработчиков событий
function initEventHandlers() {
  // Обработчик изменения страны
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.addEventListener('change', function() {
      handleCountryChange(this.value);
    });
  }
  
  // Обработчик изменения типа доставки
  const deliveryTypeSelect = document.getElementById('deliveryType');
  if (deliveryTypeSelect) {
    deliveryTypeSelect.addEventListener('change', function() {
      handleDeliveryTypeChange(this.value);
    });
  }
  
  // Обработчик отправки формы
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitOrder();
    });
  }
  
  // Обработчики для кнопок фото (делегирование событий)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.photo-upload-btn')) {
      var btn = e.target.closest('.photo-upload-btn');
      var productNumber = btn.getAttribute('data-product');
      if (productNumber) {
        uploadPhoto(parseInt(productNumber));
      }
    }
    
    // Обработчик для кнопок добавления товара
    if (e.target.closest('.add-product-btn')) {
      addProduct();
    }
    
    // Обработчик для кнопок удаления товара
    if (e.target.closest('.delete-product-btn')) {
      var btn = e.target.closest('.delete-product-btn');
      var productNumber = btn.getAttribute('data-product') || btn.closest('[data-product]').getAttribute('data-product');
      if (productNumber) {
        deleteProduct(parseInt(productNumber));
      }
    }
    
    // Обработчик для табов товаров
    if (e.target.closest('.product-tab')) {
      var tab = e.target.closest('.product-tab');
      var productNumber = tab.getAttribute('data-product');
      if (productNumber) {
        selectProduct(parseInt(productNumber));
      }
    }
    
    // Обработчик для кнопки отправки заказа
    if (e.target.closest('.submit-order-btn')) {
      submitOrder();
    }
    
    // Обработчики для модального окна
    if (e.target.closest('.order-cancel-btn')) {
      closeOrderModal();
    }
    
    if (e.target.closest('.order-confirm-btn')) {
      confirmOrder();
    }
  });
  
  // Обработчик для изменения файлов (input file)
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('photo-input')) {
      var productNumber = e.target.getAttribute('data-product');
      if (productNumber) {
        handlePhotoUpload(e.target, parseInt(productNumber));
      }
    }
  });
}

// Обновление интерфейса в зависимости от количества товаров
function updateInterface() {
  // Считаем видимые табы товаров
  var visibleTabs = document.querySelectorAll('.product-tab[data-product]');
  var visibleCount = 0;
  
  for (var i = 0; i < visibleTabs.length; i++) {
    var tab = visibleTabs[i];
    var style = window.getComputedStyle(tab);
    if (style.display !== 'none') {
      visibleCount++;
    }
  }
  
  console.log('🔍 Видимых товаров:', visibleCount);
  
  // Управляем видимостью секции выбора типа доставки
  var deliveryTypeSection = document.getElementById('deliveryTypeSection');
  if (deliveryTypeSection) {
    if (visibleCount > 1) {
      deliveryTypeSection.style.display = 'block';
    } else {
      deliveryTypeSection.style.display = 'none';
      // Если товар один, принудительно устанавливаем "на один адрес"
      var deliveryTypeSelect = document.getElementById('deliveryType');
      if (deliveryTypeSelect) {
        deliveryTypeSelect.value = 'same';
        handleDeliveryTypeChange('same');
      }
    }
  }
  
  // Управляем кнопками удаления товаров
  var deleteButtons = document.querySelectorAll('.delete-product-btn');
  for (var j = 0; j < deleteButtons.length; j++) {
    deleteButtons[j].style.display = visibleCount > 1 ? 'block' : 'none';
  }
}

// Обработка изменения типа доставки
function handleDeliveryTypeChange(deliveryType) {
  console.log('🚚 Выбран тип доставки:', deliveryType);
  
  const commonRecipientData = document.getElementById('commonRecipientData');
  const individualRecipientData = document.getElementById('individualRecipientData');
  
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
  const container = document.getElementById('recipientDataContainer');
  if (!container) return;
  
  // Считаем видимые товары
  const visibleTabs = document.querySelectorAll('.product-tab[data-product]');
  const visibleProducts = [];
  
  visibleTabs.forEach(tab => {
    const style = window.getComputedStyle(tab);
    if (style.display !== 'none') {
      visibleProducts.push(tab.getAttribute('data-product'));
    }
  });
  
  var formsHTML = '';
  
  for (var i = 0; i < visibleProducts.length; i++) {
    var productNumber = visibleProducts[i];
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
    formsHTML += '<label class="form-label">Юзернейм Telegram</label>';
    formsHTML += '<input type="text" class="recipient-username order-input" placeholder="">';
    formsHTML += '</div>';
    
    formsHTML += '<div class="form-group">';
    formsHTML += '<label class="form-label">Адрес доставки (ПВЗ СДЭК)</label>';
    formsHTML += '<textarea class="recipient-address order-textarea" placeholder=""></textarea>';
    formsHTML += '</div>';
    
    formsHTML += '</div>';
  }
  
  container.innerHTML = formsHTML;
}

// Обработка изменения страны
function handleCountryChange(country) {
  console.log('🌍 Выбрана страна:', country);
  currentCountry = country;
  
  const productsSection = document.getElementById('productsSection');
  if (productsSection) {
    productsSection.style.display = 'block';
    
    // Показываем секцию площадок для Китая
    const marketplaceSection = document.querySelector('.marketplace-section');
    if (marketplaceSection) {
      marketplaceSection.style.display = country === 'china' ? 'block' : 'none';
    }
    
    // Обновляем плейсхолдеры для ссылок
    updateLinkPlaceholders(country);
    
    // Активируем первый товар только после выбора страны
    selectProduct(1);
    
    // Обновляем интерфейс
    updateInterface();
  }
}

// Обновление плейсхолдеров для ссылок
function updateLinkPlaceholders(country) {
  const linkInputs = document.querySelectorAll('.product-link');
  const placeholder = country === 'china' 
    ? 'https://item.taobao.com/item.htm?id=...' 
    : 'https://item.rakuten.co.jp/...';
    
  linkInputs.forEach(input => {
    input.placeholder = placeholder;
  });
}

// Добавление нового товара
function addProduct() {
  // Находим первый свободный номер товара
  var nextProductNumber = 1;
  while (nextProductNumber <= 3) {
    var existingTab = document.querySelector('.product-tab[data-product="' + nextProductNumber + '"]');
    if (existingTab && window.getComputedStyle(existingTab).display === 'none') {
      break; // Нашли скрытый таб, можем его использовать
    }
    if (!existingTab) {
      break; // Таба с таким номером нет, можем создать
    }
    nextProductNumber++;
  }
  
  if (nextProductNumber > 3) {
    alert('Максимальное количество товаров: 3');
    return;
  }
  
  console.log('➕ Добавляем товар #', nextProductNumber);
  
  // Показываем таб
  var newTab = document.querySelector('.product-tab[data-product="' + nextProductNumber + '"]');
  if (newTab) {
    newTab.style.display = 'inline-block';
  }
  
  // Создаем новую форму товара если её нет
  createProductForm(nextProductNumber);
  
  // Переключаемся на новый товар
  selectProduct(nextProductNumber);
  
  // Обновляем интерфейс
  updateInterface();
}

// Создание формы товара
function createProductForm(productNumber) {
  const container = document.getElementById('productFormsContainer');
  if (!container) return;
  
  // Проверяем, есть ли уже форма
  const existingForm = container.querySelector('[data-product="' + productNumber + '"]');
  if (existingForm) return;
  
  var formHTML = '<div class="product-form" data-product="' + productNumber + '" style="display: none;">';
  
  // Выбор площадки (только для Китая)
  formHTML += '<div class="marketplace-section form-group" style="display: ' + (currentCountry === 'china' ? 'block' : 'none') + ';">';
  formHTML += '<label class="form-label">Выберите площадку</label>';
  formHTML += '<select class="marketplace-select order-select">';
  formHTML += '<option value="">Выберите площадку</option>';
  formHTML += '<option value="category1">POIZON, TaoBao, Weidan</option>';
  formHTML += '<option value="category2">WeChat, Yupoo, GooFish</option>';
  formHTML += '</select>';
  formHTML += '</div>';
  
  // Загрузка фото
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Загрузите фото товара</label>';
  formHTML += '<button type="button" class="photo-upload-btn" data-product="' + productNumber + '">';
  formHTML += '<img src="img/order_add_photo.svg" alt="Добавить фото">';
  formHTML += '</button>';
  formHTML += '<input type="file" class="photo-input" accept="image/*" multiple style="display: none;" data-product="' + productNumber + '">';
  formHTML += '<div class="photo-preview-container"></div>';
  formHTML += '</div>';
  
  // Поля товара
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label link-label">Вставьте ссылку</label>';
  formHTML += '<input type="url" class="product-link order-input" placeholder="">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите цвет (не обязательно)</label>';
  formHTML += '<input type="text" class="product-color order-input" placeholder="">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите размер (не обязательно)</label>';
  formHTML += '<input type="text" class="product-size order-input" placeholder="">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите количество</label>';
  formHTML += '<input type="number" class="product-quantity order-input" placeholder="1" min="1" max="99" value="1">';
  formHTML += '</div>';
  
  formHTML += '<div class="form-group">';
  formHTML += '<label class="form-label">Введите комментарий (не обязательно)</label>';
  formHTML += '<textarea class="product-comment order-textarea" placeholder="">-</textarea>';
  formHTML += '</div>';
  
  // Кнопка удаления товара
  formHTML += '<button type="button" class="delete-product-btn" data-product="' + productNumber + '" style="display: none;">';
  formHTML += '<img src="img/order_delete_item.svg" alt="Удалить товар">';
  formHTML += '</button>';
  
  formHTML += '</div>';
  
  container.insertAdjacentHTML('beforeend', formHTML);
}

// Выбор товара
function selectProduct(productNumber) {
  console.log('🎯 Выбран товар #', productNumber);
  
  // Скрываем все формы
  const forms = document.querySelectorAll('.product-form');
  forms.forEach(form => {
    form.style.display = 'none';
    form.classList.remove('active');
  });
  
  // Показываем выбранную форму
  const selectedForm = document.querySelector('.product-form[data-product="' + productNumber + '"]');
  console.log('🔍 Ищем форму товара #' + productNumber + ':', selectedForm);
  
  if (selectedForm) {
    selectedForm.style.display = 'block';
    selectedForm.classList.add('active');
    console.log('✅ Форма товара #' + productNumber + ' показана');
  } else {
    console.log('❌ Форма товара #' + productNumber + ' не найдена, создаем новую');
    // Если формы нет, создаем её
    createProductForm(productNumber);
    const newForm = document.querySelector('.product-form[data-product="' + productNumber + '"]');
    if (newForm) {
      newForm.style.display = 'block';
      newForm.classList.add('active');
      console.log('✅ Новая форма товара #' + productNumber + ' создана и показана');
    }
  }
  
  // Обновляем табы
  const tabs = document.querySelectorAll('.product-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const selectedTab = document.querySelector('.product-tab[data-product="' + productNumber + '"]');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Показываем секцию получателя если есть товары
  showRecipientSection();
  
  // Обновляем интерфейс
  updateInterface();
}

// Показать секцию получателя
function showRecipientSection() {
  const recipientSection = document.getElementById('recipientSection');
  if (recipientSection) {
    recipientSection.style.display = 'block';
  }
}

// Загрузка фото
function uploadPhoto(productNumber) {
  console.log('📷 Загрузка фото для товара #', productNumber);
  
  var form = document.querySelector('.product-form[data-product="' + productNumber + '"]');
  if (form) {
    var fileInput = form.querySelector('.photo-input');
    if (fileInput) {
      console.log('✅ Открываем диалог выбора файлов для товара #' + productNumber);
      fileInput.click();
    } else {
      console.log('❌ Input для файлов не найден в товаре #' + productNumber);
    }
  } else {
    console.log('❌ Форма товара #' + productNumber + ' не найдена');
  }
}

// Обработка загрузки фото
function handlePhotoUpload(input, productNumber) {
  console.log('📸 Обработка загрузки фото для товара #', productNumber);
  
  var files = input.files;
  if (files.length === 0) return;
  
  var form = document.querySelector('.product-form[data-product="' + productNumber + '"]');
  if (!form) {
    console.log('❌ Форма товара #' + productNumber + ' не найдена');
    return;
  }
  
  var previewContainer = form.querySelector('.photo-preview-container');
  if (!previewContainer) {
    console.log('❌ Контейнер для превью не найден');
    return;
  }
  
  // Проверяем текущее количество фото
  var currentPhotos = previewContainer.querySelectorAll('.photo-preview').length;
  var maxPhotos = 3;
  var availableSlots = maxPhotos - currentPhotos;
  
  if (availableSlots <= 0) {
    alert('Максимальное количество фото для товара: ' + maxPhotos);
    input.value = ''; // Очищаем input
    return;
  }
  
  // Ограничиваем количество загружаемых файлов
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
        
        var img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Фото товара';
        img.onclick = function() { showPhotoModal(e.target.result); };
        
        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-photo';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = function() { removePhoto(this); };
        
        preview.appendChild(img);
        preview.appendChild(removeBtn);
        previewContainer.appendChild(preview);
        
        console.log('✅ Фото добавлено. Всего фото: ' + previewContainer.querySelectorAll('.photo-preview').length);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Очищаем input для возможности повторной загрузки
  input.value = '';
  
  if (filesToProcess < files.length) {
    alert('Добавлено ' + filesToProcess + ' из ' + files.length + ' фото. Максимум ' + maxPhotos + ' фото на товар.');
  }
}

// Удаление фото
function removePhoto(button) {
  var preview = button.closest('.photo-preview');
  if (preview) {
    preview.remove();
    console.log('🗑️ Фото удалено');
  }
}

// Показать фото в модальном окне
function showPhotoModal(imageSrc) {
  console.log('🖼️ Открываем модальное окно с фото');
  
  // Удаляем существующее модальное окно если есть
  var existingModal = document.getElementById('photoModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Создаем новое модальное окно
  var modal = document.createElement('div');
  modal.id = 'photoModal';
  modal.className = 'photo-modal';
  
  var modalContent = document.createElement('div');
  modalContent.className = 'photo-modal-content';
  
  var img = document.createElement('img');
  img.src = imageSrc;
  img.alt = 'Предпросмотр фото';
  
  var closeBtn = document.createElement('button');
  closeBtn.className = 'photo-modal-close';
  closeBtn.innerHTML = 'Закрыть';
  closeBtn.onclick = closePhotoModal;
  
  modalContent.appendChild(img);
  modalContent.appendChild(closeBtn);
  modal.appendChild(modalContent);
  
  // Закрытие по клику на фон
  modal.onclick = function(e) {
    if (e.target === modal) {
      closePhotoModal();
    }
  };
  
  document.body.appendChild(modal);
  
  // Показываем модальное окно
  setTimeout(function() {
    modal.classList.add('show');
  }, 10);
  
  // Обработчик клавиши Escape
  var escapeHandler = function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closePhotoModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Закрыть модальное окно фото
function closePhotoModal() {
  var modal = document.getElementById('photoModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(function() {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
}

// Удаление товара с перенумерацией
function deleteProduct(productNumber) {
  console.log('🗑️ Удаление товара #', productNumber);
  
  // Собираем все видимые товары
  var visibleProducts = [];
  for (var i = 1; i <= 3; i++) {
    var tab = document.querySelector('.product-tab[data-product="' + i + '"]');
    var form = document.querySelector('.product-form[data-product="' + i + '"]');
    if (tab && window.getComputedStyle(tab).display !== 'none') {
      // Собираем данные товара
      var productData = null;
      if (form) {
        var linkEl = form.querySelector('.product-link');
        var colorEl = form.querySelector('.product-color');
        var sizeEl = form.querySelector('.product-size');
        var quantityEl = form.querySelector('.product-quantity');
        var commentEl = form.querySelector('.product-comment');
        var photos = form.querySelectorAll('.photo-preview img');
        
        productData = {
          link: linkEl ? linkEl.value : '',
          color: colorEl ? colorEl.value : '-',
          size: sizeEl ? sizeEl.value : '-',
          quantity: quantityEl ? quantityEl.value : '1',
          comment: commentEl ? commentEl.value : '-',
          photos: []
        };
        
        // Собираем фото
        for (var j = 0; j < photos.length; j++) {
          if (photos[j].src.startsWith('data:image/')) {
            productData.photos.push(photos[j].src);
          }
        }
      }
      
      visibleProducts.push({
        number: i,
        data: productData
      });
    }
  }
  
  // Не даем удалить последний товар
  if (visibleProducts.length <= 1) {
    alert('Нельзя удалить последний товар');
    return;
  }
  
  // Удаляем товар из массива
  visibleProducts = visibleProducts.filter(function(product) {
    return product.number !== productNumber;
  });
  
  console.log('📋 Товары после удаления:', visibleProducts);
  
  // Скрываем все табы и удаляем все формы
  for (var i = 1; i <= 3; i++) {
    var tab = document.querySelector('.product-tab[data-product="' + i + '"]');
    var form = document.querySelector('.product-form[data-product="' + i + '"]');
    
    if (tab) {
      tab.style.display = 'none';
    }
    if (form) {
      form.remove();
    }
  }
  
  // Пересоздаем товары с новой нумерацией
  for (var i = 0; i < visibleProducts.length; i++) {
    var newNumber = i + 1;
    var productData = visibleProducts[i].data;
    
    console.log('🔄 Пересоздаем товар #' + newNumber + ' из товара #' + visibleProducts[i].number);
    
    // Показываем таб
    var tab = document.querySelector('.product-tab[data-product="' + newNumber + '"]');
    if (tab) {
      tab.style.display = 'inline-block';
    }
    
    // Создаем форму
    createProductForm(newNumber);
    
    // Заполняем данные если они есть
    if (productData && productData.link) {
      var form = document.querySelector('.product-form[data-product="' + newNumber + '"]');
      if (form) {
        var linkEl = form.querySelector('.product-link');
        var colorEl = form.querySelector('.product-color');
        var sizeEl = form.querySelector('.product-size');
        var quantityEl = form.querySelector('.product-quantity');
        var commentEl = form.querySelector('.product-comment');
        var previewContainer = form.querySelector('.photo-preview-container');
        
        if (linkEl) linkEl.value = productData.link;
        if (colorEl) colorEl.value = productData.color;
        if (sizeEl) sizeEl.value = productData.size;
        if (quantityEl) quantityEl.value = productData.quantity;
        if (commentEl) commentEl.value = productData.comment;
        
        // Восстанавливаем фото
        if (previewContainer && productData.photos.length > 0) {
          previewContainer.innerHTML = '';
          for (var j = 0; j < productData.photos.length; j++) {
            var preview = document.createElement('div');
            preview.className = 'photo-preview';
            
            var img = document.createElement('img');
            img.src = productData.photos[j];
            img.alt = 'Фото товара';
            img.onclick = function() { showPhotoModal(this.src); };
            
            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-photo';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = function() { removePhoto(this); };
            
            preview.appendChild(img);
            preview.appendChild(removeBtn);
            previewContainer.appendChild(preview);
          }
        }
      }
    }
  }
  
  // Переключаемся на первый товар
  selectProduct(1);
  
  // Обновляем интерфейс
  updateInterface();
}

// Отправка заказа
function submitOrder() {
  console.log('📤 Отправка заказа');
  
  try {
    // Собираем данные заказа
    const orderData = collectOrderData();
    
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
  const user = getTelegramUser();
  
  const orderData = {
    telegram_user_id: user ? user.id : 919034275,
    user_name: user ? (user.first_name + ' ' + (user.last_name || '')).trim() : 'Test User',
    telegram_username: user ? user.username : 'test_user',
    full_name: (document.getElementById('recipientName') && document.getElementById('recipientName').value) || '',
    phone: (document.getElementById('recipientPhone') && document.getElementById('recipientPhone').value) || '',
    country: currentCountry,
    items: [],
    delivery_address: (document.getElementById('recipientAddress') && document.getElementById('recipientAddress').value) || '',
    comment: 'Заказ через веб-интерфейс'
  };
  
  // Собираем товары
  const forms = document.querySelectorAll('.product-form');
  forms.forEach(form => {
    const linkElement = form.querySelector('.product-link');
    const link = linkElement ? linkElement.value : '';
    if (link) {
      const colorElement = form.querySelector('.product-color');
      const sizeElement = form.querySelector('.product-size');
      const quantityElement = form.querySelector('.product-quantity');
      const commentElement = form.querySelector('.product-comment');
      
      var colorValue = (colorElement && colorElement.value.trim()) || '';
      var sizeValue = (sizeElement && sizeElement.value.trim()) || '';
      var commentValue = (commentElement && commentElement.value.trim()) || '';
      
      const item = {
        link_or_id: link,
        color: colorValue || '-',
        size: sizeValue || '-',
        quantity: (quantityElement && quantityElement.value) || '1',
        comment: commentValue || '-',
        photos: []
      };
      
      // Собираем фото (base64)
      const photos = form.querySelectorAll('.photo-preview img');
      photos.forEach(img => {
        if (img.src.startsWith('data:image/')) {
          item.photos.push(img.src);
        }
      });
      
      orderData.items.push(item);
    }
  });
  
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
  
  if (!orderData.full_name.trim()) {
    alert('Пожалуйста, введите ваше ФИО');
    return false;
  }
  
  if (!orderData.phone.trim()) {
    alert('Пожалуйста, введите ваш номер телефона');
    return false;
  }
  
  return true;
}

// Показать модальное окно подтверждения
function showOrderModal(orderData) {
  console.log('📋 Показываем модальное окно подтверждения');
  
  const modal = document.getElementById('orderModal');
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
  const countryElement = document.getElementById('orderCountry');
  if (countryElement) {
    countryElement.textContent = orderData.country === 'china' ? '🇨🇳 Китай' : '🇯🇵 Япония';
  }
  
  // Заполняем товары
  const productsContent = document.getElementById('orderProductContent');
  if (productsContent) {
    var itemsHTML = '';
    for (var i = 0; i < orderData.items.length; i++) {
      var item = orderData.items[i];
      itemsHTML += '<div class="order-item">';
      itemsHTML += '<h4>Товар ' + (i + 1) + '</h4>';
      itemsHTML += '<p><strong>Ссылка:</strong> ' + item.link_or_id + '</p>';
      itemsHTML += '<p><strong>Цвет:</strong> ' + item.color + '</p>';
      itemsHTML += '<p><strong>Размер:</strong> ' + item.size + '</p>';
      itemsHTML += '<p><strong>Количество:</strong> ' + item.quantity + '</p>';
      if (item.photos.length > 0) {
        itemsHTML += '<p><strong>Фото:</strong> ' + item.photos.length + ' шт.</p>';
      }
      itemsHTML += '</div>';
    }
    
    productsContent.innerHTML = itemsHTML;
  }
  
  // Заполняем информацию о получателе
  const recipientsContent = document.getElementById('orderRecipientsContent');
  if (recipientsContent) {
    recipientsContent.innerHTML = '<div class="recipient-info">' +
      '<p><strong>ФИО:</strong> ' + orderData.full_name + '</p>' +
      '<p><strong>Телефон:</strong> ' + orderData.phone + '</p>' +
      '<p><strong>Адрес:</strong> ' + orderData.delivery_address + '</p>' +
      '</div>';
  }
}

// Закрытие модального окна
function closeOrderModal() {
  const modal = document.getElementById('orderModal');
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
  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.value = '';
  }
  
  // Скрываем секции
  const productsSection = document.getElementById('productsSection');
  if (productsSection) {
    productsSection.style.display = 'none';
  }
  
  const recipientSection = document.getElementById('recipientSection');
  if (recipientSection) {
    recipientSection.style.display = 'none';
  }
  
  // Очищаем поля
  const inputs = document.querySelectorAll('.order-input, .order-textarea');
  inputs.forEach(input => {
    if (input.type === 'number') {
      input.value = '1';
    } else if (input.classList.contains('product-color') || input.classList.contains('product-size') || input.classList.contains('product-comment')) {
      input.value = '-';
    } else {
      input.value = '';
    }
  });
  
  // Сбрасываем товары
  productCount = 1;
  selectProduct(1);
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
  initOrderPage();
  
  // Принудительно убираем отступ у кнопки добавления товара
  setTimeout(function() {
    var addBtn = document.querySelector('.add-product-btn');
    if (addBtn) {
      addBtn.style.marginLeft = '0px';
      addBtn.style.setProperty('margin-left', '-7px', 'important'); // Отодвинуто еще на 5px: -12px + 5px = -7px
      addBtn.style.setProperty('transform', 'translateX(-3px)', 'important'); // Отодвинуто еще на 5px: -8px + 5px = -3px
      console.log('🔧 Отодвинуты стили кнопки добавления товара еще на 5px');
    }
  }, 100);
});

console.log('✅ Order.js loaded');