# -*- coding: utf-8 -*-
import telebot
import sqlite3
import os
from datetime import datetime
import pandas as pd
import json
import base64
import requests
from telebot import types

# --- Настройки бота ---
BOT_TOKEN = '6425282545:AAHv28Q5sWLgMpMnn-9FLrASUYITQNMDFkM'
bot = telebot.TeleBot(BOT_TOKEN)

# --- Курсы валют ---
currency_rates = {
    "CNY": 14.5,
    "JPY": 0.72,
    "USD": 98.1,
    "EUR": 105.3
}

# --- Настройки GitHub ---
GITHUB_REPO = "m37avolt/volt-orders"  # замените на ваш username/repo
GITHUB_TOKEN = "ghp_ваш_токен_здесь"  # замените на ваш Personal Access Token

GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}/contents/"

# --- Пути к файлам ---
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'volt_logistics.db')
orders_dir = os.path.join(script_dir, 'orders')
logs_dir = os.path.os.makedirs(orders_dir, exist_ok=True)
os.makedirs(logs_dir, exist_ok=True)

log_file_path = os.path.join(logs_dir, f"volt_log_{datetime.now().strftime('%Y-%m-%d')}.txt")

# --- Логирование ---
def log_event(event_type, user_id, message=None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file_path, "a", encoding="utf-8") as f:
        line = f"[{timestamp}] [{event_type}] [User {user_id}]"
        if message:
            line += f": {message}"
        line += "\n"
        f.write(line)
    print(f"[LOG] {event_type} | User: {user_id} | Message: {message}")

# --- Инициализация базы данных ---
def init_db():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Таблица пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            telegram_id INTEGER PRIMARY KEY,
            full_name TEXT,
            telegram_username TEXT,
            is_manager BOOLEAN DEFAULT FALSE
        )
    ''')

    # Таблица заказов
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            full_name TEXT,
            telegram_username TEXT,
            country TEXT,
            status TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Таблица товаров внутри заказа
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            photo TEXT,
            link_or_id TEXT,
            color TEXT,
            size TEXT,
            price REAL,
            quantity INTEGER,
            comment TEXT,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        )
    ''')

    conn.commit()
    conn.close()
    log_event("init_db", "system", "База данных инициализирована.")

init_db()

# --- Добавление пользователя ---
def add_user(user_id, full_name, username):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR IGNORE INTO users (telegram_id, full_name, telegram_username) VALUES (?, ?, ?)",
        (user_id, full_name, username)
    )
    conn.commit()
    conn.close()
    log_event("user_registered", user_id, f"{full_name}, @{username}")

# --- Создание заказа ---
def create_order(user_id, full_name, telegram_username, country):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO orders 
        (user_id, full_name, telegram_username, country, status)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, full_name, telegram_username, country, "В ожидании проверки"))
    order_id = cursor.lastrowid
    conn.commit()
    conn.close()
    log_event("order_created", user_id, f"Заказ #{order_id}, страна: {country}")
    return order_id

# --- Сохранение товара в заказе ---
def add_item_to_order(order_id, photo, link_or_id, color, size, price, quantity, comment=''):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO order_items 
        (order_id, photo, link_or_id, color, size, price, quantity, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (order_id, photo, link_or_id, color, size, price, quantity, comment))
    conn.commit()
    conn.close()
    log_event("item_added", order_id,
              f"Фото: {photo}, Ссылка: {link_or_id}, Цена: {price}, Кол-во: {quantity}")

# --- Получение всех заказов ---
def get_all_orders():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, status, country FROM orders")
    result = cursor.fetchall()
    conn.close()
    return result

# --- Создание дневного Excel-файла ---
def get_daily_excel_path():
    today = datetime.now().strftime("%Y-%m-%d")
    return os.path.join(orders_dir, f"{today}.xlsx")

def ensure_daily_excel_exists():
    daily_excel_path = get_daily_excel_path()
    if not os.path.exists(daily_excel_path):
        df = pd.DataFrame(columns=[
            'Фото', 'ID / Ссылка', 'Цвет',
            'Размер', 'Цена за единицу', 'Кол-во/шт',
            'tg контакт', 'Страна выкупа', 'комментарий'
        ])
        df.to_excel(daily_excel_path, index=False)
    return daily_excel_path

# --- Сохранение в Excel ---
def save_to_excel(item_data):
    daily_excel_path = get_daily_excel_path()
    try:
        df_existing = pd.read_excel(daily_excel_path)
    except Exception:
        df_existing = pd.DataFrame(columns=item_data.keys())

    df_new = pd.DataFrame([item_data])
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    df_combined.to_excel(daily_excel_path, index=False)
    log_event("excel_saved", "system", f"Данные записаны в {daily_excel_path}")

    # Отправляем файл в GitHub
    github_path = f"orders/{os.path.basename(daily_excel_path)}"
    update_github_file(github_path, daily_excel_path, "Обновлён дневной заказ")

# --- Обновление файла на GitHub ---
def update_github_file(path_in_repo, file_path, commit_message="Update file"):
    with open(file_path, "rb") as f:
        content = f.read()

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = GITHUB_API_URL + path_in_repo

    # Получаем SHA файла (если существует)
    try:
        response = requests.get(url, headers=headers)
        sha = response.json()["sha"] if response.status_code == 200 else None
    except Exception:
        sha = None

    payload = {
        "message": commit_message,
        "content": base64.b64encode(content).decode("utf-8"),
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha

    response = requests.put(url, headers=headers, json=payload)
    if response.status_code in [200, 201]:
        log_event("github_sync", "system", f"{path_in_repo} успешно обновлен на GitHub.")
    else:
        log_event("github_error", "system", f"{response.status_code}: {response.text}")

# --- Обновление SQLite в GitHub ---
def sync_db_with_github():
    db_dest_path = "volt_logistics.db"
    update_github_file(db_dest_path, db_path, "Обновлена база данных")

# --- Обработчик web_app_data ---
@bot.message_handler(content_types=['web_app_data'])
def handle_web_app_data(message):
    try:
        data = json.loads(message.web_app_data.data)
        user_id = message.from_user.id
        log_event("form_received", user_id, f"Получены данные от Web App: {data}")

        if not is_registered(user_id):
            bot.send_message(message.chat.id, "⚠️ Вы не зарегистрированы. Нажмите /start.")
            return

        if data.get('command') == 'create_order':
            full_name = data.get('full_name')
            telegram_username = data.get('telegram_username')
            country = data.get('country')
            items = data.get('items', [])

            if not all([full_name, telegram_username, country, len(items) > 0]):
                bot.send_message(message.chat.id, "⚠️ Не все поля формы заполнены.")
                return

            order_id = create_order(user_id, full_name, telegram_username, country)

            for item in items:
                photo_list = item.get('photos', [])
                photo = ', '.join(photo_list) if isinstance(photo_list, list) else ''
                link_or_id = item.get('link_or_id', '')
                color = item.get('color', '')
                size = item.get('size', '')
                price = float(item.get('price', 0))
                quantity = int(item.get('quantity', 1))
                comment = item.get('comment', '')

                add_item_to_order(order_id, photo, link_or_id, color, size, price, quantity, comment)

                excel_data = {
                    'Фото': photo,
                    'ID / Ссылка': link_or_id,
                    'Цвет': color,
                    'Размер': size,
                    'Цена за единицу': round(price * currency_rates.get(country.upper(), 1), 2),
                    'Кол-во/шт': quantity,
                    'tg контакт': telegram_username,
                    'Страна выкупа': country.upper(),
                    'комментарий': comment
                }

                save_to_excel(excel_data)

            # Синхронизация базы данных с GitHub
            sync_db_with_github()

            bot.send_message(message.chat.id, f"✅ Ваш заказ #{order_id} создан!")

        elif data.get('command') == 'preview_order':
            bot.send_message(message.chat.id, "Вы предпросмотрели заказ.")
            log_event("preview_order", user_id)

    except Exception as e:
        error_msg = str(e).replace("\n", "\\n")
        log_event("error", user_id, error_msg)
        bot.send_message(message.chat.id, f"❌ Ошибка при обработке данных: {error_msg}")

# --- Проверка регистрации ---
def is_registered(user_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT telegram_id FROM users WHERE telegram_id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return bool(result)

# --- Команда /start ---
@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.from_user.id
    full_name = message.from_user.full_name
    username = message.from_user.username or ""
    add_user(user_id, full_name, username)
    send_options(message)

# --- Главное меню ---
def send_options(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
    btn2 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
    manager_btn = types.KeyboardButton("🔒 Панель менеджера")
    markup.add(btn1, btn2, manager_btn)
    bot.send_message(message.chat.id, "Выберите действие:", reply_markup=markup)

# --- Является ли пользователь менеджером ---
def is_manager(user_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT is_manager FROM users WHERE telegram_id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return bool(result[0]) if result else False

# --- Менеджерская панель ---
@bot.message_handler(func=lambda m: m.text == "🔒 Панель менеджера")
def manager_panel(message):
    if is_manager(message.from_user.id):
        markup = types.InlineKeyboardMarkup(row_width=2)
        view_orders = types.InlineKeyboardButton("📊 Все заказы", callback_data="view_all_orders")
        back = types.InlineKeyboardButton("⬅ Назад", callback_data="back_main")
        markup.add(view_orders, back)
        bot.send_message(message.chat.id, "Добро пожаловать в панель менеджера.", reply_markup=markup)
    else:
        bot.send_message(message.chat.id, "Нет доступа к панели.")

# --- Callback handler ---
@bot.callback_query_handler(func=lambda call: True)
def handle_callback(call):
    if call.data == "view_all_orders":
        all_orders = get_all_orders()
        response = "📦 Все заказы:\n\n" + ("\n".join([
            f"• Заказ #{o[0]} | Статус: {o[1]} | Страна: {o[2]}"
            for o in all_orders
        ]) if all_orders else "Нет активных заказов.")
        bot.send_message(call.message.chat.id, response)
    elif call.data == "back_main":
        send_options(call.message)

# --- Вывод всех заказов ---
def get_all_orders():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, status, country FROM orders")
    result = cursor.fetchall()
    conn.close()
    return result

# --- Обработчик обычных сообщений ---
@bot.message_handler(func=lambda message: True)
def any_message_handler(message):
    send_options(message)

# --- Синхронизация с GitHub ---
def sync_db_with_github():
    update_github_file("volt_logistics.db", db_path, "Обновлена база данных")

# --- Запуск бота ---
if __name__ == "__main__":
    print("🟢 Бот запущен...")
    bot.polling(none_stop=True)
