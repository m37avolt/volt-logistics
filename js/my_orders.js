// JavaScript для страницы моих заказов (my_orders.html)

let currentUser = null;
let orderStatuses = {};

// Словарь переводов статусов заказов на русский язык
const statusTranslations = {
    // Английские статусы
    'pending_review': 'Ожидает проверки',
    'confirmed': 'Подтвержден',
    'processing': 'В обработке',
    'purchased': 'Куплен',
    'warehouse': 'На складе',
    'shipped': 'Отправлен',
    'delivered': 'Доставлен',
    'canceled': 'Отменен',
    'cancelled': 'Отменен',
    'pending': 'Ожидает',
    'approved': 'Одобрен',
    'rejected': 'Отклонен',
    'in_transit': 'В пути',
    'out_for_delivery': 'Доставляется',
    'returned': 'Возвращен',
    'refunded': 'Возмещен',
    'in_progress': 'В работе',
    'ready': 'Готов',
    'completed': 'Завершен',
    'on_hold': 'Приостановлен',
    'awaiting_payment': 'Ожидает оплаты',
    'payment_confirmed': 'Оплата подтверждена',
    'quality_check': 'Проверка качества',
    'packaging': 'Упаковка',
    'customs': 'Таможня',
    
    // Русские статусы (на случай, если они уже на русском)
    'Ожидает проверки': 'Ожидает проверки',
    'Подтвержден': 'Подтвержден',
    'В обработке': 'В обработке',
    'Куплен': 'Куплен',
    'На складе': 'На складе',
    'Отправлен': 'Отправлен',
    'Доставлен': 'Доставлен',
    'Отменен': 'Отменен'
};

// Функция получения русского названия статуса
function getStatusInRussian(status) {
    if (!status) return 'Неизвестен';
    return statusTranslations[status] || status;
}

// Функция загрузки статусов заказов
async function loadOrderStatuses() {
  console.log('📋 Загрузка статусов заказов...');
  
  try {
    const response = await fetch('http://localhost:5000/api/orders/statuses');
    const data = await response.json();
    
    if (data.status === 'success') {
      orderStatuses = data.statuses;
      console.log('✅ Статусы заказов загружены:', orderStatuses);
    } else {
      console.error('❌ Ошибка загрузки статусов:', data.message);
    }
  } catch (error) {
    console.error('❌ Ошибка соединения при загрузке статусов:', error);
  }
}

// Функция загрузки заказов пользователя
async function loadUserOrders() {
  if (!currentUser) {
    console.error('❌ Пользователь не определен');
    return;
  }
  
  console.log('📦 Загрузка заказов пользователя:', currentUser.id);
  
  const container = document.getElementById('ordersContainer');
  if (container) {
    container.innerHTML = '<div class="loading">Загрузка заказов...</div>';
  }

  try {
    console.log(`Отправка запроса к API: http://localhost:5000/api/orders/user/${currentUser.id}`);
    const response = await fetch(`http://localhost:5000/api/orders/user/${currentUser.id}?t=${Date.now()}`);
    console.log('Получен ответ от API, статус:', response.status);
    const data = await response.json();
    console.log('Полученные данные:', data);

    if (data.status === 'success') {
      console.log('Полученные заказы пользователя:', data.orders);
      displayOrders(data.orders);
      console.log('✅ Заказы пользователя загружены:', data.orders.length);
    } else {
      console.error('Ошибка загрузки заказов:', data.message);
      showError(data.message || 'Ошибка загрузки заказов');
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки заказов:', error);
    showError('Ошибка соединения с сервером. Убедитесь, что API сервер запущен.');
  }
}

// Функция отображения заказов
function displayOrders(orders) {
  const container = document.getElementById('ordersContainer');
  if (!container) {
    console.error('Контейнер для заказов не найден');
    return;
  }

  console.log('Отображаем заказы пользователя:', orders);
  console.log('Количество заказов для отображения:', orders.length);

  if (orders.length === 0) {
    console.log('Нет заказов для отображения');
    container.innerHTML = `
      <div class="empty-state">
        <h3>У вас пока нет заказов</h3>
        <p>Создайте свой первый заказ, чтобы отслеживать его статус</p>
        <button class="refresh-btn" onclick="navigateTo('order')">
          📝 Создать заказ
        </button>
      </div>
    `;
    return;
  }

  console.log('Создание HTML для заказов');
  const ordersHTML = orders.map(order => {
    console.log('Создание карточки для заказа:', order);
    return createOrderCard(order);
  }).join('');
  
  console.log('Сгенерированный HTML:', ordersHTML);
  container.innerHTML = ordersHTML;
  console.log('Заказы отображены');
}

// Function to create order card
function createOrderCard(order) {
    const statusInfo = orderStatuses[order.status] || { name: order.status, color: '#666' };
    
    // Form HTML for items
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        itemsHTML = `
            <div class="items-list">
                <h4>📦 Товары (${order.items.length})</h4>
                ${order.items.map((item, index) => `
                    <div class="item-card">
                        <div class="item-header">
                            <div class="item-name">Товар ${index + 1}</div>
                            ${item.link_or_id ? `<a href="${item.link_or_id}" class="item-link" target="_blank">🔗 Ссылка</a>` : ''}
                        </div>
                        <div class="item-details">
                            ${item.color ? `<div><strong>Цвет:</strong> ${item.color}</div>` : ''}
                            ${item.size ? `<div><strong>Размер:</strong> ${item.size}</div>` : ''}
                            <div><strong>Количество:</strong> ${item.quantity || 1}</div>
                            ${item.price ? `<div><strong>Цена:</strong> ${item.price} ¥</div>` : ''}
                            ${item.comment ? `<div><strong>Комментарий:</strong> ${item.comment}</div>` : ''}
                        </div>
                        ${item.photos && item.photos.length > 0 ? `
                            <div class="item-photos">
                                <strong>Фотографии (${item.photos.length}):</strong>
                                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
                                    ${item.photos.map((photo, photoIndex) => `
                                        <div style="position: relative; display: inline-block;">
                                            <img src="${photo}" alt="Фото товара ${photoIndex + 1}" 
                                                 style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #00DBFF; cursor: pointer;"
                                                 onclick="window.open('${photo}', '_blank')">
                                            <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                                                ${photoIndex + 1}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : '<div><em>Фото не приложены</em></div>'}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        itemsHTML = '<div class="empty-state"><p>Товары не найдены</p></div>';
    }
    
    // Get number of items and photos
    const itemsCount = order.total_items || (order.items && order.items.length) || 0;
    const photosCount = order.total_photos || (order.items ? order.items.reduce((sum, item) => sum + (item.photos ? item.photos.length : 0), 0) : 0);
    
    return `
        <div class="order-card" style="--status-color: ${statusInfo.color}">
            <div class="order-header">
                <div class="order-id-section">
                    <div class="order-id">${order.order_number ? `Заказ #${order.order_number}` : `Заказ #${order.id}`}</div>
                    ${order.order_number ? `<div style="font-size: 12px; color: #666; margin-top: 2px;">ID в системе: ${order.id}</div>` : ''}
                </div>
                <div class="order-date">${formatDate(order.created_at)}</div>
                <div class="order-status" style="color: ${statusInfo.color}">
                    ${getStatusInRussian(order.status)}
                </div>
            </div>
            
            <div class="order-details">
                <div class="detail-item">
                    <div class="detail-label">Пользователь</div>
                    <div class="detail-value">${order.full_name || order.telegram_username || 'Не указан'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Страна</div>
                    <div class="detail-value">${order.country === 'china' ? 'Китай' : order.country === 'japan' ? 'Япония' : 'Не указана'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Товаров</div>
                    <div class="detail-value">${itemsCount}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Фотографий</div>
                    <div class="detail-value">${photosCount}</div>
                </div>
            </div>
            
            ${itemsHTML}
            
            ${order.tracking_number ? `
                <div class="tracking-info">
                    <strong>Трек-номер:</strong> 
                    <span class="tracking-number">${order.tracking_number}</span>
                </div>
            ` : ''}
            
            <!-- Фотоотчет со склада -->
            ${order.photo_reports && order.photo_reports.length > 0 ? `
                <div class="photo-reports-section">
                    <h4>📷 Фотоотчет со склада</h4>
                    <div class="photo-reports-container">
                        ${order.photo_reports.map((report, reportIndex) => `
                            <div class="photo-report" style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                                <div style="font-size: 12px; color: #888; margin-bottom: 10px;">
                                    ${new Date(report.timestamp || order.status_updated_at).toLocaleString('ru-RU')}
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    ${report.photos ? report.photos.map((photo, photoIndex) => `
                                        <div style="position: relative; display: inline-block;">
                                            <img src="${photo}" alt="Фотоотчет ${reportIndex + 1}-${photoIndex + 1}" 
                                                 style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #2ECC71; cursor: pointer;"
                                                 onclick="openPhotoModal('${photo}')">
                                            <div style="position: absolute; top: 5px; right: 5px; background: rgba(46,204,113,0.8); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                                                ${photoIndex + 1}
                                            </div>
                                        </div>
                                    `).join('') : ''}
                                </div>
                                ${report.comment ? `<div style="margin-top: 8px; font-style: italic; color: #ccc;">${report.comment}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Комментарии менеджера -->
            ${order.manager_comments && order.manager_comments.length > 0 ? `
                <div class="manager-comments">
                    <h4>💬 Комментарии менеджера</h4>
                    ${order.manager_comments.slice(-3).map(comment => `
                        <div class="manager-comment" style="background: rgba(0,219,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #00DBFF;">
                            <div style="font-size: 12px; color: #888; margin-bottom: 5px;">
                                ${new Date(comment.timestamp).toLocaleString('ru-RU')}
                            </div>
                            <div>${comment.comment}</div>
                        </div>
                    `).join('')}
                    ${order.manager_comments.length > 3 ? `<div style="font-size: 12px; color: #888; text-align: center; margin-top: 5px;">и еще ${order.manager_comments.length - 3} комментариев...</div>` : ''}
                </div>
            ` : ''}
            
            ${order.notes ? `
                <div class="detail-item">
                    <div class="detail-label">Примечания</div>
                    <div class="detail-value">${order.notes}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// Функция форматирования даты
function formatDate(dateString) {
  if (!dateString) return 'Не указана';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  } catch (error) {
    return dateString;
  }
}

// Функция показа ошибки
function showError(message) {
  const container = document.getElementById('ordersContainer');
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <h3>Ошибка загрузки</h3>
        <p>${message}</p>
        <button class="refresh-btn" onclick="loadUserOrders()">
          🔄 Попробовать снова
        </button>
      </div>
    `;
  }
}

// Функция ручного обновления
async function refreshOrders() {
  console.log('🔄 Ручное обновление заказов...');
  await loadUserOrders();
}

// Делаем функцию глобально доступной
window.refreshOrders = refreshOrders;

// Функция отображения информации о пользователе
function displayUserInfo(user) {
  const userInfoElement = document.getElementById('userInfo');
  if (userInfoElement) {
    userInfoElement.innerHTML = `
      <div class="user-card">
        <h3>👤 ${user.first_name} ${user.last_name || ''}</h3>
        <p>@${user.username || 'Не указан'}</p>
      </div>
    `;
  }
}

// Инициализация страницы заказов
async function initMyOrdersPage() {
  console.log('📦 Инициализация страницы моих заказов');
  
  // Получаем данные пользователя
  currentUser = getTelegramUser();
  
  if (currentUser) {
    displayUserInfo(currentUser);
    console.log('👤 Пользователь:', currentUser);
    
    // Загружаем статусы и заказы
    await loadOrderStatuses();
    await loadUserOrders();
  } else {
    showError('Не удалось определить пользователя. Убедитесь, что вы открыли приложение через Telegram.');
  }
  
  console.log('✅ My orders page initialized');
}

// Функция открытия фото в модальном окне
function openPhotoModal(photoUrl) {
    const modalHTML = `
        <div id="photoModal" class="photo-modal" style="display: flex;" onclick="closePhotoModal()">
            <div class="photo-modal-content" onclick="event.stopPropagation()">
                <div class="photo-modal-header">
                    <button class="photo-close-btn" onclick="closePhotoModal()">&times;</button>
                </div>
                <div class="photo-modal-body">
                    <img src="${photoUrl}" alt="Фотоотчет" id="modalPhoto">
                </div>
                <div class="photo-modal-footer">
                    <button onclick="closePhotoModal()" class="photo-close-button">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Функция закрытия модального окна
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.remove();
    }
}

// Делаем функции глобально доступными
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initMyOrdersPage);

console.log('✅ My_orders.js loaded');