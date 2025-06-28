// Состояние приложения
let currentPage = "home"
let pageHistory = ["home"] // История страниц для кнопки назад

// Улучшенное состояние заказа для тестовой версии
let figmaOrderState = {
  country: "",
  step: "country", // country, products, final
  currentProductId: 1, // Автоматически открывается товар 1
  maxProducts: 3, // Максимальное количество товаров
  activeProducts: [1], // Активные товары (начинаем с товара 1)
  products: {
    1: {
      marketplace: "",
      link: "",
      price: "",
      color: "",
      size: "",
      quantity: 1,
      comment: "",
      photos: [],
      recipient: null,
    },
    2: {
      marketplace: "",
      link: "",
      price: "",
      color: "",
      size: "",
      quantity: 1,
      comment: "",
      photos: [],
      recipient: null,
    },
    3: {
      marketplace: "",
      link: "",
      price: "",
      color: "",
      size: "",
      quantity: 1,
      comment: "",
      photos: [],
      recipient: null,
    },
  },
  deliveryType: "same", // "same" или "different"
  commonRecipient: {
    name: "",
    username: "",
    address: "",
  },
}

// Навигация
function navigateTo(pageId) {
  // Добавить текущую страницу в историю, если переходим на новую
  if (pageId !== currentPage) {
    pageHistory.push(pageId)
  }

  // Скрыть текущую страницу
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })

  // Показать новую страницу
  const newPage = document.getElementById(pageId)
  if (newPage) {
    newPage.classList.add("active")
    currentPage = pageId
  }

  // Управление кнопкой назад - НЕ ПОКАЗЫВАТЬ на главной странице
  const backButton = document.getElementById("backButton")
  if (pageHistory.length <= 1 || pageId === "home") {
    backButton.classList.remove("show")
  } else {
    setTimeout(() => {
      backButton.classList.add("show")
    }, 100)
  }

  // Управление навигационным меню
  const mainNav = document.getElementById("mainNav")
  if (pageId === "home") {
    setTimeout(() => {
      mainNav.classList.add("show")
    }, 200)
  } else {
    mainNav.classList.remove("show")
  }

  // Инициализация страницы заказа
  if (pageId === "order") {
    initFigmaOrderPage()
  }
}

function goBack() {
  // Удалить текущую страницу из истории
  if (pageHistory.length > 1) {
    pageHistory.pop()
    const previousPage = pageHistory[pageHistory.length - 1]

    // Скрыть текущую страницу
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active")
    })

    // Показать предыдущую страницу
    const prevPage = document.getElementById(previousPage)
    if (prevPage) {
      prevPage.classList.add("active")
      currentPage = previousPage
    }

    // Управление кнопкой назад - НЕ ПОКАЗЫВАТЬ на главной странице
    const backButton = document.getElementById("backButton")
    if (pageHistory.length <= 1 || previousPage === "home") {
      backButton.classList.remove("show")
    }

    // Управление навигационным меню
    const mainNav = document.getElementById("mainNav")
    if (previousPage === "home") {
      setTimeout(() => {
        mainNav.classList.add("show")
      }, 200)
    } else {
      mainNav.classList.remove("show")
    }
  }
}

// Улучшенная инициализация страницы заказа
function initFigmaOrderPage() {
  console.log("Initializing improved Figma order page")
  resetFigmaOrderState()
  updateFigmaStepsVisibility()
  setupFigmaEventListeners()
}

function resetFigmaOrderState() {
  figmaOrderState = {
    country: "",
    step: "country",
    currentProductId: 1,
    maxProducts: 3,
    activeProducts: [1],
    products: {
      1: {
        marketplace: "",
        link: "",
        price: "",
        color: "",
        size: "",
        quantity: 1,
        comment: "",
        photos: [],
        recipient: null,
      },
      2: {
        marketplace: "",
        link: "",
        price: "",
        color: "",
        size: "",
        quantity: 1,
        comment: "",
        photos: [],
        recipient: null,
      },
      3: {
        marketplace: "",
        link: "",
        price: "",
        color: "",
        size: "",
        quantity: 1,
        comment: "",
        photos: [],
        recipient: null,
      },
    },
    deliveryType: "same",
    commonRecipient: {
      name: "",
      username: "",
      address: "",
    },
  }

  // Сбросить форму
  const form = document.getElementById("figmaOrderForm")
  if (form) {
    form.reset()
  }

  // Скрыть все секции
  document.getElementById("figmaProductsSection").style.display = "none"
  document.getElementById("figmaRecipientSection").style.display = "none"
  document.getElementById("figmaMarketplaceSection").style.display = "none"

  // Очистить ошибки валидации
  clearValidationErrors()
}

function setupFigmaEventListeners() {
  // Автосохранение данных товара
  const productFields = [
    "figmaMarketplace",
    "figmaLink",
    "figmaPrice",
    "figmaColor",
    "figmaSize",
    "figmaQuantity",
    "figmaComment",
  ]

  productFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (field) {
      field.addEventListener("change", saveFigmaCurrentProductData)
      field.addEventListener("input", saveFigmaCurrentProductData)
    }
  })

  // Обработчик изменения маркетплейса
  document.getElementById("figmaMarketplace")?.addEventListener("change", () => {
    updateFigmaFieldsVisibility()
    saveFigmaCurrentProductData()
  })

  // Обработчик выбора типа доставки
  document.getElementById("deliveryType")?.addEventListener("change", (e) => {
    figmaOrderState.recipient.deliveryType = e.target.value
  })
}

// Улучшенная обработка выбора страны
function handleFigmaCountryChange(country) {
  figmaOrderState.country = country

  if (country === "china") {
    figmaOrderState.step = "products"
    document.getElementById("figmaMarketplaceSection").style.display = "block"
    updateFigmaStepsVisibility()
    // Автоматически показать товар 1
    updateFigmaProductTabs()
  } else if (country === "japan") {
    figmaOrderState.step = "products"
    document.getElementById("figmaMarketplaceSection").style.display = "none"
    updateFigmaStepsVisibility()
    // Автоматически показать товар 1
    updateFigmaProductTabs()
  } else {
    figmaOrderState.step = "country"
    updateFigmaStepsVisibility()
  }
}

// Улучшенное управление шагами
function updateFigmaStepsVisibility() {
  const productsSection = document.getElementById("figmaProductsSection")
  const recipientSection = document.getElementById("figmaRecipientSection")

  switch (figmaOrderState.step) {
    case "country":
      productsSection.style.display = "none"
      recipientSection.style.display = "none"
      break
    case "products":
      productsSection.style.display = "block"
      recipientSection.style.display = "none"
      break
    case "final":
      productsSection.style.display = "block"
      recipientSection.style.display = "block"
      break
  }

  updateFigmaSubmitButton()
}

// Выбор товара (1, 2, 3)
function selectFigmaProduct(productId) {
  // Сохранить данные текущего товара перед переключением
  saveFigmaCurrentProductData()

  figmaOrderState.currentProductId = productId
  updateFigmaProductTabs()
  loadFigmaProductData()
}

// Добавление нового товара через кнопку "+"
function addFigmaProduct() {
  // Найти следующий неактивный товар
  for (let i = 1; i <= figmaOrderState.maxProducts; i++) {
    if (!figmaOrderState.activeProducts.includes(i)) {
      figmaOrderState.activeProducts.push(i)
      figmaOrderState.currentProductId = i
      updateFigmaProductTabs()
      loadFigmaProductData()
      break
    }
  }
}

function updateFigmaProductTabs() {
  const tabs = document.querySelectorAll(".figma-product-tab")
  const addButton = document.querySelector(".figma-add-product")

  // Скрыть все табы сначала
  tabs.forEach((tab, index) => {
    tab.style.display = "none"
    tab.classList.remove("active")
  })

  // Показать только активные товары
  figmaOrderState.activeProducts.forEach((productId, index) => {
    const tab = tabs[productId - 1]
    if (tab) {
      tab.style.display = "block"
      if (productId === figmaOrderState.currentProductId) {
        tab.classList.add("active")
      }
    }
  })

  // Управление кнопкой добавления
  if (figmaOrderState.activeProducts.length >= figmaOrderState.maxProducts) {
    addButton.style.display = "none"
  } else {
    addButton.style.display = "block"
  }

  // Обновить индикатор скролла
  setTimeout(updateScrollIndicator, 100)
}

function loadFigmaProductData() {
  const product = figmaOrderState.products[figmaOrderState.currentProductId]
  if (!product) return

  // Загрузить данные товара в форму
  document.getElementById("figmaMarketplace").value = product.marketplace || ""
  document.getElementById("figmaLink").value = product.link || ""
  document.getElementById("figmaPrice").value = product.price || ""
  document.getElementById("figmaColor").value = product.color || ""
  document.getElementById("figmaSize").value = product.size || ""
  document.getElementById("figmaQuantity").value = product.quantity || 1
  document.getElementById("figmaComment").value = product.comment || ""

  // Обновить предпросмотр фото
  updatePhotoPreview()

  // Обновить отображение полей в зависимости от маркетплейса
  updateFigmaFieldsVisibility()
}

function saveFigmaCurrentProductData() {
  const product = figmaOrderState.products[figmaOrderState.currentProductId]
  if (!product) return

  product.marketplace = document.getElementById("figmaMarketplace").value
  product.link = document.getElementById("figmaLink").value
  product.price = document.getElementById("figmaPrice").value
  product.color = document.getElementById("figmaColor").value
  product.size = document.getElementById("figmaSize").value
  product.quantity = document.getElementById("figmaQuantity").value
  product.comment = document.getElementById("figmaComment").value

  // Проверить, можно ли перейти к финальному шагу
  if (validateFigmaProductsStep()) {
    figmaOrderState.step = "final"
    updateFigmaStepsVisibility()
  }
}

function updateFigmaFieldsVisibility() {
  const marketplace = document.getElementById("figmaMarketplace").value
  const linkField = document.getElementById("figmaLink")
  const linkLabel = document.getElementById("figmaLinkLabel")

  if (marketplace === "category2") {
    if (linkLabel) linkLabel.textContent = "Номер телефона/ссылка на контакт"
    linkField.placeholder = "Введите контактную информацию"
  } else {
    if (linkLabel) linkLabel.textContent = "Вставьте ссылку"
    linkField.placeholder = "Введите ссылку на товар"
  }
}

// Валидация
function validateFigmaProductsStep() {
  // Проверить хотя бы один заполненный товар из активных
  return figmaOrderState.activeProducts.some((productId) => {
    const product = figmaOrderState.products[productId]
    return product.link && product.price && product.quantity > 0
  })
}

function handleDeliveryTypeChange(deliveryType) {
  figmaOrderState.deliveryType = deliveryType

  const commonData = document.getElementById("commonRecipientData")
  const individualData = document.getElementById("individualRecipientData")

  if (deliveryType === "same") {
    commonData.style.display = "block"
    individualData.style.display = "none"
    // Очистить индивидуальные данные
    figmaOrderState.activeProducts.forEach((productId) => {
      figmaOrderState.products[productId].recipient = null
    })
  } else {
    commonData.style.display = "none"
    individualData.style.display = "block"
    generateIndividualRecipientForms()
  }

  clearValidationErrors()
}

function generateIndividualRecipientForms() {
  const container = document.getElementById("recipientDataContainer")
  container.innerHTML = ""

  figmaOrderState.activeProducts.forEach((productId) => {
    const product = figmaOrderState.products[productId]
    if (!product.recipient) {
      product.recipient = { name: "", username: "", address: "" }
    }

    const formHTML = `
      <div class="preview-item" style="margin-bottom: 24px;">
        <h4>Данные получателя для товара ${productId}</h4>
        
        <label class="figma-label">ФИО получателя</label>
        <input type="text" id="recipientName${productId}" class="figma-input" 
               value="${product.recipient.name}" 
               onchange="updateIndividualRecipient(${productId}, 'name', this.value)"
               placeholder="">

        <label class="figma-label">Юзернейм получателя</label>
        <input type="text" id="recipientUsername${productId}" class="figma-input" 
               value="${product.recipient.username}"
               onchange="updateIndividualRecipient(${productId}, 'username', this.value)"
               placeholder="">

        <label class="figma-label">ПВЗ СДЭК</label>
        <textarea id="recipientAddress${productId}" class="figma-textarea" 
                  onchange="updateIndividualRecipient(${productId}, 'address', this.value)"
                  placeholder="">${product.recipient.address}</textarea>
      </div>
    `
    container.innerHTML += formHTML
  })
}

function updateIndividualRecipient(productId, field, value) {
  if (figmaOrderState.products[productId] && figmaOrderState.products[productId].recipient) {
    figmaOrderState.products[productId].recipient[field] = value
  }
  clearValidationErrors()
}

function validateFigmaOrder() {
  const errors = []

  // Проверка страны
  if (!figmaOrderState.country) {
    errors.push("Выберите страну выкупа")
  }

  // Проверка товаров
  const hasValidProduct = figmaOrderState.activeProducts.some((productId) => {
    const product = figmaOrderState.products[productId]
    return product.link && product.price && product.quantity > 0
  })

  if (!hasValidProduct) {
    errors.push("Заполните данные хотя бы для одного товара")
  }

  // Проверка получателя в зависимости от типа доставки
  if (figmaOrderState.deliveryType === "same") {
    const name = document.getElementById("figmaRecipientName")?.value
    const username = document.getElementById("figmaRecipientUsername")?.value
    const address = document.getElementById("figmaRecipientAddress")?.value

    if (!name) errors.push("Введите ФИО получателя")
    if (!username) errors.push("Введите юзернейм получателя")
    if (!address) errors.push("Введите адрес ПВЗ СДЭК")
  } else {
    // Проверка индивидуальных данных для каждого активного товара
    figmaOrderState.activeProducts.forEach((productId) => {
      const product = figmaOrderState.products[productId]
      if (product.link && product.price) {
        // Только для заполненных товаров
        if (!product.recipient || !product.recipient.name) {
          errors.push(`Введите ФИО получателя для товара ${productId}`)
        }
        if (!product.recipient || !product.recipient.username) {
          errors.push(`Введите юзернейм получателя для товара ${productId}`)
        }
        if (!product.recipient || !product.recipient.address) {
          errors.push(`Введите адрес ПВЗ СДЭК для товара ${productId}`)
        }
      }
    })
  }

  return errors
}

function showValidationErrors(errors) {
  const errorContainer = document.getElementById("validationError")
  if (errors.length > 0) {
    errorContainer.innerHTML = errors.map((error) => `• ${error}`).join("<br>")
    errorContainer.classList.add("show")

    // Подсветить поля с ошибками
    highlightErrorFields(errors)

    // Прокрутить к ошибкам
    errorContainer.scrollIntoView({ behavior: "smooth", block: "center" })
  } else {
    clearValidationErrors()
  }
}

function clearValidationErrors() {
  const errorContainer = document.getElementById("validationError")
  errorContainer.classList.remove("show")

  // Убрать подсветку с полей
  document.querySelectorAll(".field-error").forEach((field) => {
    field.classList.remove("field-error")
  })
}

function highlightErrorFields(errors) {
  // Простая логика подсветки основных полей
  if (errors.some((e) => e.includes("ФИО"))) {
    document.getElementById("figmaRecipientName")?.classList.add("field-error")
  }
  if (errors.some((e) => e.includes("юзернейм"))) {
    document.getElementById("figmaRecipientUsername")?.classList.add("field-error")
  }
  if (errors.some((e) => e.includes("адрес"))) {
    document.getElementById("figmaRecipientAddress")?.classList.add("field-error")
  }
}

function updateFigmaSubmitButton() {
  const btn = document.querySelector(".figma-submit-button-image")
  if (!btn) return

  const errors = validateFigmaOrder()
  btn.disabled = errors.length > 0
  btn.style.opacity = errors.length > 0 ? "0.5" : "1"
}

// Отправка заказа
function submitFigmaOrder() {
  // Сохранить данные текущего товара
  saveFigmaCurrentProductData()

  // Сохранить общие данные получателя если доставка на один адрес
  if (figmaOrderState.deliveryType === "same") {
    figmaOrderState.commonRecipient = {
      name: document.getElementById("figmaRecipientName")?.value || "",
      username: document.getElementById("figmaRecipientUsername")?.value || "",
      address: document.getElementById("figmaRecipientAddress")?.value || "",
    }
  }

  const errors = validateFigmaOrder()
  if (errors.length > 0) {
    showValidationErrors(errors)
    return
  }

  showFigmaOrderPreview()
}

function uploadFigmaPhoto() {
  document.getElementById("figmaPhotoInput").click()
}

function handleFigmaPhotoUpload(input) {
  const files = input.files
  const product = figmaOrderState.products[figmaOrderState.currentProductId]

  if (!product) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()

    reader.onload = (e) => {
      product.photos.push(e.target.result)
      updatePhotoPreview()
    }

    reader.readAsDataURL(file)
  }

  // Очистить input для возможности повторной загрузки
  input.value = ""
}

function deleteFigmaProduct() {
  const currentId = figmaOrderState.currentProductId

  // Если это единственный активный товар, только очистить данные
  if (figmaOrderState.activeProducts.length === 1) {
    figmaOrderState.products[currentId] = {
      marketplace: "",
      link: "",
      price: "",
      color: "",
      size: "",
      quantity: 1,
      comment: "",
      photos: [],
      recipient: null,
    }
    loadFigmaProductData()
  } else {
    // Удалить товар из активных
    figmaOrderState.activeProducts = figmaOrderState.activeProducts.filter((id) => id !== currentId)

    // Очистить данные товара
    figmaOrderState.products[currentId] = {
      marketplace: "",
      link: "",
      price: "",
      color: "",
      size: "",
      quantity: 1,
      comment: "",
      photos: [],
      recipient: null,
    }

    // Переключиться на первый активный товар
    figmaOrderState.currentProductId = figmaOrderState.activeProducts[0]
    updateFigmaProductTabs()
    loadFigmaProductData()
  }

  updateFigmaSubmitButton()
}

function updatePhotoPreview() {
  const container = document.getElementById("photoPreviewContainer")
  const product = figmaOrderState.products[figmaOrderState.currentProductId]

  if (!container || !product) return

  container.innerHTML = ""

  product.photos.forEach((photo, index) => {
    const photoItem = document.createElement("div")
    photoItem.className = "photo-preview-item"
    photoItem.innerHTML = `
      <img src="${photo}" alt="Фото ${index + 1}" class="photo-preview-img">
      <button class="photo-delete-btn" onclick="deletePhoto(${index})" type="button">×</button>
    `
    container.appendChild(photoItem)
  })
}

function deletePhoto(index) {
  const product = figmaOrderState.products[figmaOrderState.currentProductId]
  if (product && product.photos) {
    product.photos.splice(index, 1)
    updatePhotoPreview()
  }
}

function showFigmaOrderPreview() {
  // Получить только заполненные товары из активных
  const filledProducts = figmaOrderState.activeProducts
    .map((productId) => ({ id: productId, ...figmaOrderState.products[productId] }))
    .filter((product) => product.link && product.price)

  // Создать модальное окно с предварительным просмотром заказа
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Подтверждение заказа</h3>
        <button class="modal-close" onclick="closeFigmaModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <div class="preview-item">
          <h4>Страна выкупа</h4>
          <div class="preview-field">
            <span class="preview-field-label">Страна:</span>
            <span class="preview-field-value">${figmaOrderState.country.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="preview-item">
          <h4>Тип доставки</h4>
          <div class="preview-field">
            <span class="preview-field-label">Доставка:</span>
            <span class="preview-field-value">${figmaOrderState.deliveryType === "same" ? "На один адрес" : "На разные адреса"}</span>
          </div>
        </div>
        
        ${filledProducts
          .map(
            (product) => `
          <div class="preview-item">
            <h4>Товар ${product.id}</h4>
            ${
              product.marketplace
                ? `
              <div class="preview-field">
                <span class="preview-field-label">Площадка:</span>
                <span class="preview-field-value">${product.marketplace === "category1" ? "Категория 1 (POIZON, TaoBao, Weidan)" : "Категория 2 (WeChat, Yupoo, GooFish)"}</span>
              </div>
            `
                : ""
            }
            <div class="preview-field">
              <span class="preview-field-label">Ссылка:</span>
              <span class="preview-field-value">${product.link}</span>
            </div>
            <div class="preview-field">
              <span class="preview-field-label">Цена:</span>
              <span class="preview-field-value">${product.price}</span>
            </div>
            <div class="preview-field">
              <span class="preview-field-label">Количество:</span>
              <span class="preview-field-value">${product.quantity}</span>
            </div>
            ${
              product.color
                ? `
              <div class="preview-field">
                <span class="preview-field-label">Цвет:</span>
                <span class="preview-field-value">${product.color}</span>
              </div>
            `
                : ""
            }
            ${
              product.size
                ? `
              <div class="preview-field">
                <span class="preview-field-label">Размер:</span>
                <span class="preview-field-value">${product.size}</span>
              </div>
            `
                : ""
            }
            ${
              product.comment
                ? `
              <div class="preview-field">
                <span class="preview-field-label">Комментарий:</span>
                <span class="preview-field-value">${product.comment}</span>
              </div>
            `
                : ""
            }
            ${
              product.photos && product.photos.length > 0
                ? `
              <div class="preview-field">
                <span class="preview-field-label">Фото (${product.photos.length}):</span>
                <div class="modal-photos">
                  ${product.photos.map((photo) => `<img src="${photo}" alt="Фото товара" class="modal-photo">`).join("")}
                </div>
              </div>
            `
                : ""
            }
            ${
              figmaOrderState.deliveryType === "different" && product.recipient
                ? `
              <div class="preview-field">
                <span class="preview-field-label">Получатель:</span>
                <span class="preview-field-value">${product.recipient.name} (@${product.recipient.username})</span>
              </div>
              <div class="preview-field">
                <span class="preview-field-label">Адрес:</span>
                <span class="preview-field-value">${product.recipient.address}</span>
              </div>
            `
                : ""
            }
          </div>
        `,
          )
          .join("")}

        ${
          figmaOrderState.deliveryType === "same"
            ? `
        <div class="preview-item">
          <h4>Получатель (общий)</h4>
          <div class="preview-field">
            <span class="preview-field-label">ФИО:</span>
            <span class="preview-field-value">${figmaOrderState.commonRecipient.name}</span>
          </div>
          <div class="preview-field">
            <span class="preview-field-label">Юзернейм:</span>
            <span class="preview-field-value">@${figmaOrderState.commonRecipient.username}</span>
          </div>
          <div class="preview-field">
            <span class="preview-field-label">ПВЗ СДЭК:</span>
            <span class="preview-field-value">${figmaOrderState.commonRecipient.address}</span>
          </div>
        </div>
        `
            : ""
        }
      </div>
      <div class="modal-footer">
        <button class="modal-btn cancel-btn" onclick="closeFigmaModal(this)">Отмена</button>
        <button class="modal-btn submit-btn" onclick="confirmFigmaOrder()">Подтвердить заказ</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
}

function closeFigmaModal(element) {
  const modal = element.closest(".modal")
  if (modal) {
    modal.remove()
  }
}

function confirmFigmaOrder() {
  // Здесь будет логика отправки заказа на сервер
  alert("Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.")

  // Закрыть модальное окно
  const modal = document.querySelector(".modal")
  if (modal) {
    modal.remove()
  }

  // ПОЛНОСТЬЮ очистить форму и состояние
  resetFigmaOrderState()

  // Очистить все поля формы
  const form = document.getElementById("figmaOrderForm")
  if (form) {
    form.reset()
  }

  // Очистить контейнер предпросмотра фото
  const photoContainer = document.getElementById("photoPreviewContainer")
  if (photoContainer) {
    photoContainer.innerHTML = ""
  }

  // Очистить контейнер индивидуальных данных получателя
  const recipientContainer = document.getElementById("recipientDataContainer")
  if (recipientContainer) {
    recipientContainer.innerHTML = ""
  }

  // Вернуться на главную и очистить историю
  pageHistory = ["home"]
  navigateTo("home")
}

// Функции для работы с изображениями
function handleImageError(img, fallbackText) {
  img.style.display = "none"
  const fallback = img.nextElementSibling
  if (fallback && fallback.classList.contains("image-fallback")) {
    fallback.style.display = "flex"
    fallback.textContent = fallbackText
  }
}

function handleImageLoad(img) {
  img.classList.remove("loading")
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
  window.open("https://t.me/volt_logistics", "_blank")
}

// Инициализация при загрузке
window.addEventListener("load", () => {
  console.log("Volt Logistics Order System loaded")

  // Показать навигационное меню на главной странице
  if (currentPage === "home") {
    setTimeout(() => {
      const mainNav = document.getElementById("mainNav")
      if (mainNav) {
        mainNav.classList.add("show")
      }
    }, 500)
  }

  // Показать кнопку назад если не на главной странице
  if (currentPage !== "home") {
    setTimeout(() => {
      const backButton = document.getElementById("backButton")
      if (backButton) {
        backButton.classList.add("show")
      }
    }, 100)
  }
})

// Добавить обработчики изменений для автосохранения данных товара
document.addEventListener("DOMContentLoaded", () => {
  // Обработчики для полей товара
  const productFields = [
    "figmaMarketplace",
    "figmaLink",
    "figmaPrice",
    "figmaColor",
    "figmaSize",
    "figmaQuantity",
    "figmaComment",
  ]

  productFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (field) {
      field.addEventListener("change", saveFigmaCurrentProductData)
      field.addEventListener("input", saveFigmaCurrentProductData)
    }
  })
})

function updateScrollIndicator() {
  const tabsContainer = document.querySelector(".figma-product-tabs")
  if (tabsContainer) {
    const isScrollable = tabsContainer.scrollWidth > tabsContainer.clientWidth
    if (isScrollable) {
      tabsContainer.classList.add("scrollable")
    } else {
      tabsContainer.classList.remove("scrollable")
    }
  }
}
