// Production version of common.js - No emulation, only real Telegram WebApp integration

// Функции для обработки изображений
function handleImageError(img, fallbackText) {
  try {
    img.style.display = "none";
    const fallback = img.nextElementSibling;
    if (fallback && fallback.classList.contains("image-fallback")) {
      fallback.style.display = "flex";
      fallback.textContent = fallbackText;
    }
  } catch (e) {
    console.error('Error in handleImageError:', e);
  }
}

function handleImageLoad(img) {
  try {
    if (img && img.classList) {
      img.classList.remove("loading");
    }
  } catch (e) {
    console.error('Error in handleImageLoad:', e);
  }
}

// Функция для получения данных пользователя из Telegram WebApp
function getTelegramUser() {
  try {
    // Только реальные данные из Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return null;
  } catch (error) {
    console.error('Error getting Telegram user:', error);
    return null;
  }
}

// Функция для проверки, является ли пользователь менеджером
function isManager() {
  try {
    const user = getTelegramUser();
    if (user && user.id) {
      // Список ID менеджеров
      const managerIds = [
        919034275,   // ID первого менеджера
        372145026,   // ID второго менеджера
        6432717873   // ID третьего менеджера
      ];
      return managerIds.includes(user.id);
    }
    return false;
  } catch (error) {
    console.error('Error checking manager status:', error);
    return false;
  }
}

// Функция навигации
function navigateTo(pageId) {
  try {
    console.log('navigateTo called with:', pageId);
    
    const pageMap = {
      'home': 'index.html',
      'main': 'main.html',
      'order': 'order.html',
      'calculator': 'calculator.html',
      'currency': 'course.html',
      'promotions': 'promotions.html',
      'reviews': 'reviews.html',
      'help': 'index.html',
      'taobao': 'index.html',
      'yellow': 'index.html',
      'poizon': 'index.html',
      'my-profile': 'profile.html',
      'my_orders': 'my_orders.html',
      'manager-panel': 'manager_panel.html',
      'profile': 'profile_menu.html',
      'referral': 'index.html'
    };

    const targetPage = pageMap[pageId] || 'index.html';
    window.location.href = targetPage;
  } catch (error) {
    console.error('Error in navigateTo:', error);
    window.location.href = 'index.html';
  }
}

// Функция возврата назад
function goBack() {
  try {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error in goBack:', error);
    window.location.href = 'index.html';
  }
}

// Функция открытия чата с менеджером
function openTelegramManager() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/voltlogistics_manager');
    } else {
      window.open('https://t.me/voltlogistics_manager', '_blank');
    }
  } catch (error) {
    console.error('Error in openTelegramManager:', error);
    // Fallback
    window.open('https://t.me/voltlogistics_manager', '_blank');
  }
}

// Функция открытия канала отзывов
function openReviewsChannel() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/feedbackvolt');
    } else {
      window.open('https://t.me/feedbackvolt', '_blank');
    }
  } catch (error) {
    console.error('Error in openReviewsChannel:', error);
    // Fallback
    window.open('https://t.me/feedbackvolt', '_blank');
  }
}

// Инициализация Telegram WebApp
document.addEventListener('DOMContentLoaded', function() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log('Telegram WebApp initialized');
    }
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error);
  }
});

// Делаем функции глобально доступными
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;
window.getTelegramUser = getTelegramUser;
window.isManager = isManager;
window.navigateTo = navigateTo;
window.goBack = goBack;
window.openTelegramManager = openTelegramManager;
window.openReviewsChannel = openReviewsChannel;