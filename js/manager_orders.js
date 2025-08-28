// JavaScript для страницы управления заказами менеджера (manager_orders.html)

let allOrders = [];
let filteredOrders = [];
let orderStatuses = {};

// Функция загрузки статусов заказов
async function loadOrderStatuses() {
  console.log('📋 Загрузка статусов заказов...');
  
  try {
    const response = await fetch('http://localhost:5000/api/orders/statuses');
    const data = await response.json();
    
    if (data.status === 'success') {
      orderStatuses = data.statuses;
      console.log('✅ Статусы заказов загружены:', orderStatuses);
      populateStatusFilter();
    } else {
      console.error('❌ Ошибка загрузки статусов:', data.message);
    }
  } catch (error) {
    console.error('❌ Ошибка соединения при загрузке статусов:', error);
  }
}

// Функция загрузки всех заказов
async function loadAllOrders() {
  console.log('📦 Загрузка всех заказов...');
  
  const container = document.getElementById('ordersContainer');
  if (container) {
    container.innerHTML = '<div class="loading">Загрузка заказов...</div>';
  }

  try {
    const response = await fetch('http://localhost:5000/api/orders/all');
    const data = await response.json();

    if (data.status === 'success') {
      allOrders = data.orders;
      filteredOrders = [...allOrders];
      displayOrders();
      updateStats();
      updateUserFilter();
      console.log('✅ Все заказы загружены:', allOrders.length);
    } else {
      showError(data.message || 'Ошибка загрузки заказов');
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки заказов:', error);
    showError('Ошибка соединения с сервером. Убедитесь, что API сервер запущен на порту 5000.');
  }
}

// Функция отображения заказов
function displayOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  if (filteredOrders.length === 0) {
    container.innerHTML = '<div class="loading">Заказы не найдены</div>';
    return;
  }

  const ordersHTML = filteredOrders.map(order => createOrderRow(order)).join('');
  container.innerHTML = ordersHTML;
}

// Функция создания строки заказа
function createOrderRow(order) {
  const status = orderStatuses[order.status] || { name: order.status, color: '#888' };
  const createdDate = new Date(order.created_at).toLocaleDateString('ru-RU');
  const updatedDate = new Date(order.status_updated_at).toLocaleDateString('ru-RU');
  
  // Получаем количество товаров и фотографий
  const itemsCount = order.total_items || (order.items && order.items.length) || 0;
  const photosCount = order.total_photos || (order.items ? order.items.reduce((sum, item) => sum + (item.photos ? item.photos.length : 0), 0) : 0);

  return `
    <div class="order-row">
      <div class="order-info">
        <div class="order-id" onclick="showOrderDetails('${order.id}')">
          ${order.order_number ? `#${order.order_number}` : `ID: ${order.id}`}
        </div>
        ${!order.order_number ? `<div style="font-size: 10px; color: #666;">ID: ${order.id}</div>` : ''}
        <div class="order-user">
          👤 ${order.full_name || order.telegram_username || 'Без имени'}
        </div>
        <div class="order-items">
          📦 ${itemsCount} товаров, 📷 ${photosCount} фото
        </div>
      </div>
      <div class="status-display" style="background: ${status.color}; color: white; padding: 8px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-align: center; min-width: 120px;">
        ${status.name}
      </div>
      <div class="date-cell">${createdDate}</div>
      <div class="items-count">📦 ${itemsCount}</div>
      <div class="photos-count">📷 ${photosCount}</div>
      <div class="date-cell">${updatedDate}</div>
      <div class="actions">
        <button class="action-btn" style="padding: 10px 18px; font-size: 14px; margin-right: 8px;" onclick="editOrder('${order.id}')">✏️ Редактировать</button>
        <button class="action-btn" style="padding: 10px 18px; font-size: 14px;" onclick="showOrderDetails('${order.id}')">👁️ Просмотр</button>
      </div>
    </div>
  `;
}

// Status updates are now handled through the edit modal

// Функция обновления статистики
function updateStats() {
  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;
  
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length
  };
  
  statsContainer.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">Всего заказов</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.pending}</div>
        <div class="stat-label">В обработке</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.confirmed}</div>
        <div class="stat-label">Подтверждены</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.shipped}</div>
        <div class="stat-label">Отправлены</div>
      </div>
    </div>
  `;
}

// Функция заполнения фильтра статусов
function populateStatusFilter() {
  const statusFilter = document.getElementById('statusFilter');
  if (!statusFilter) return;
  
  statusFilter.innerHTML = '<option value="">Все статусы</option>' +
    Object.keys(orderStatuses).map(status => 
      `<option value="${status}">${orderStatuses[status].name}</option>`
    ).join('');
}

// Функция обновления фильтра пользователей
function updateUserFilter() {
  const userFilter = document.getElementById('userFilter');
  if (!userFilter) return;
  
  const users = [...new Set(allOrders.map(o => o.username).filter(u => u))];
  
  userFilter.innerHTML = '<option value="">Все пользователи</option>' +
    users.map(user => `<option value="${user}">${user}</option>`).join('');
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
        <button class="refresh-btn" onclick="loadAllOrders()">
          🔄 Попробовать снова
        </button>
      </div>
    `;
  }
}

// Инициализация страницы менеджера
async function initManagerOrdersPage() {
  console.log('👨‍💼 Инициализация панели управления заказами');
  
  // Проверяем права менеджера
  if (!isManager()) {
    document.body.innerHTML = `
      <div class="access-denied">
        <h2>❌ Доступ запрещен</h2>
        <p>Эта страница доступна только менеджерам</p>
        <button onclick="navigateTo('home')">🏠 На главную</button>
      </div>
    `;
    return;
  }
  
  // Загружаем статусы и заказы
  await loadOrderStatuses();
  await loadAllOrders();
  
  // Автообновление заказов отключено для лучшей производительности
  console.log('🔄 Автообновление заказов отключено - используйте кнопку обновления');
  
  console.log('✅ Manager orders page initialized');
}

// Status updates are now handled through the edit modal
// updateOrderStatus function removed since dropdowns are no longer used

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initManagerOrdersPage);

console.log('✅ Manager_orders.js loaded');