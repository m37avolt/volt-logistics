// JavaScript для главной страницы (index.html)

// Функция создания тестового заказа
function createTestOrder() {
  console.log('🧪 Создание тестового заказа...');

  const btn = document.querySelector('.test-order-btn');
  if (btn) {
    const originalText = btn.textContent;
    btn.textContent = '⏳ Создание заказа...';
    btn.disabled = true;

    const testOrderData = {
      telegram_user_id: (getTelegramUser() && getTelegramUser().id) || 919034275,
      user_name: "Тестовый Пользователь",
      telegram_username: "test_user",
      full_name: "Иван Тестовый",
      phone: "+7 (999) 123-45-67",
      items: [
        {
          name: "Тестовый товар",
          price: "100",
          quantity: "1",
          link: "https://example.com/test-item",
          size: "M",
          color: "Красный",
          comment: "Тестовый комментарий",
          photos: []
        }
      ],
      delivery_address: "Тестовый адрес доставки",
      comment: "Тестовый заказ"
    };

    console.log('📊 Отправка тестового заказа:', testOrderData);

    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ Заказ отправлен:', data);
      
      if (data.status === 'success') {
        alert('✅ Заказ успешно создан!\n\nID заказа: ' + data.order_id + '\n\n🧪 Режим: Локальное тестирование');
      } else {
        alert('❌ Ошибка создания заказа:\n' + data.message);
      }
    })
    .catch(error => {
      console.error('❌ Ошибка отправки:', error);
      alert('❌ Ошибка отправки данных:\n' + error.message + '\n\n💡 Убедитесь, что API сервер запущен на порту 5000');
    })
    .finally(() => {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
}

// Функция-обработчик для кнопки
function handleTestOrderClick() {
  console.log('🔘 Test order button clicked');
  
  if (typeof createTestOrder === 'function') {
    console.log('✅ createTestOrder function found, calling...');
    createTestOrder();
  } else {
    console.error('❌ createTestOrder function not found!');
    alert('❌ Ошибка: функция createTestOrder не найдена. Проверьте консоль браузера.');
  }
}

// Инициализация главной страницы
function initIndexPage() {
  console.log('🏠 Инициализация главной страницы');
  
  // Показываем фиксированное меню
  showFixedMenu();
  
  // Делаем функции доступными глобально
  window.createTestOrder = createTestOrder;
  window.handleTestOrderClick = handleTestOrderClick;
  
  console.log('✅ Index page initialized');
}

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initIndexPage);

console.log('✅ Index.js loaded');