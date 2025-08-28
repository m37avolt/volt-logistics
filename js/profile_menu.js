// JavaScript для страницы меню профиля (profile_menu.html)

// Функция проверки доступа менеджера
function checkManagerAccess() {
  console.log('🔍 Проверка прав менеджера');
  
  const user = getTelegramUser();
  const isManagerUser = isManager();
  
  console.log('👤 Пользователь:', user);
  console.log('👨‍💼 Менеджер:', isManagerUser);
  
  const managerPanel = document.querySelector('.manager-panel');
  if (managerPanel) {
    if (isManagerUser) {
      managerPanel.style.display = 'block';
      console.log('✅ Панель менеджера показана - пользователь является менеджером');
    } else {
      managerPanel.style.display = 'none';
      console.log('❌ Панель менеджера скрыта - пользователь не является менеджером');
    }
  }
}

// Функция получения аватарки пользователя
function getUserAvatar() {
  const user = getTelegramUser();
  if (user && user.photo_url) {
    return user.photo_url;
  }
  
  // Возвращаем дефолтную аватарку
  return 'img/default_avatar.svg';
}

// Функция отображения информации о пользователе
function displayUserInfo() {
  const user = getTelegramUser();
  
  // Обновляем имя пользователя
  const userNameElement = document.querySelector('.user-name');
  if (userNameElement && user) {
    userNameElement.textContent = user.first_name + ' ' + (user.last_name || '');
  }
  
  // Обновляем username
  const usernameElement = document.querySelector('.username');
  if (usernameElement && user && user.username) {
    usernameElement.textContent = '@' + user.username;
  }
  
  // Обновляем аватарку
  const avatarElement = document.querySelector('.user-avatar');
  if (avatarElement) {
    avatarElement.src = getUserAvatar();
  }
}

// Инициализация страницы профиля
function initProfileMenuPage() {
  console.log('👤 Инициализация страницы меню профиля');
  
  // Отображаем информацию о пользователе
  displayUserInfo();
  
  // Проверяем права менеджера с небольшой задержкой
  setTimeout(checkManagerAccess, 100);
  
  console.log('✅ Profile menu page initialized');
}

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initProfileMenuPage);

console.log('✅ Profile_menu.js loaded');