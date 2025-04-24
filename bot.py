# -*- coding: utf-8 -*-
import telebot
import sqlite3
import os
import json
import base64
from io import BytesIO
from telebot import types
import time

BOT_TOKEN = '6425282545:AAHv28Q5sWLgMpMnn-9FLrASUYITQNMDFkM'
bot = telebot.TeleBot(BOT_TOKEN)

# Курсы валют
yuan = 14.5
yen = 0.72
dollar = 98.1
euro = 105.3

# Доверенные менеджеры
trusted_users = [919034275, 372145026, 6432717873]

# Путь к базе данных
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'volt_logistics.db')
blocked_users = []

def is_manager(user_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT is_manager FROM users WHERE telegram_id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()
    if result and result[0]:
        return True
    return False

def add_user(user_id, is_manager=False):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Проверяем, является ли пользователь доверенным менеджером
    if user_id in trusted_users:
        is_manager = True
    cursor.execute("INSERT OR IGNORE INTO users (telegram_id, is_manager) VALUES (?, ?)", 
                   (user_id, is_manager))
    conn.commit()
    conn.close()

def create_order(user_id, status="Новый", **kwargs):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO orders (user_id, status, photos, comments) VALUES (?, ?, ?, ?)",
        (user_id, status, kwargs.get('photos', ''), json.dumps(kwargs.get('comments', [])))
    )
    order_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return order_id

def update_order(order_id, **kwargs):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    set_clause = ', '.join([f"{k} = ?" for k in kwargs.keys()])
    values = list(kwargs.values()) + [order_id]
    cursor.execute(f"UPDATE orders SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)
    conn.commit()
    conn.close()

def get_order(order_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    conn.close()
    return order

def get_user_orders(user_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, status FROM orders WHERE user_id = ?", (user_id,))
    orders = cursor.fetchall()
    conn.close()
    return orders

def get_all_users():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT telegram_id FROM users")
    users = cursor.fetchall()
    conn.close()
    return [u[0] for u in users]

def send_order_notification(user_id, order_id, message_text):
    bot.send_message(user_id, f"Заказ #{order_id}: {message_text}")

def add_photo_to_order(order_id, photo_url):
    order = get_order(order_id)
    if order:
        current_photos = order[4] or ''
        new_photos = f"{current_photos},{photo_url}" if current_photos else photo_url
        update_order(order_id, photos=new_photos)

def add_comment_to_order(order_id, manager_id, comment_text):
    order = get_order(order_id)
    if order:
        current_comments = order[5] or '[]'
        comments_list = json.loads(current_comments)
        comments_list.append({
            'manager_id': manager_id,
            'text': comment_text,
            'created_at': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        update_order(order_id, comments=json.dumps(comments_list))

def send_options(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
    btn2 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
    if is_manager(message.from_user.id):
        manager_button = types.KeyboardButton("ПАНЕЛЬ МЕНЕДЖЕРА")
        markup.add(btn1, btn2, manager_button)
    else:
        markup.add(btn1, btn2)
    bot.send_message(message.chat.id, "Добро пожаловать! Выберите действие:", reply_markup=markup)

@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.from_user.id
    add_user(user_id)  # Добавляем пользователя в базу
    send_options(message)

@bot.message_handler(commands=['change_course'])
def change_course(message):
    sender_id = message.from_user.id
    if sender_id in trusted_users:
        bot.send_message(sender_id, "Введите новые курсы в формате: yuan;yen;dollar;euro\nНапример: `14.5;0.72;98.1;105.3`")
        bot.register_next_step_handler(message, update_course)
    else:
        bot.send_message(sender_id, "Нет прав для выполнения этой команды.")

def update_course(message):
    global yuan, yen, dollar, euro
    try:
        new_values = list(map(float, message.text.split(';')))
        if len(new_values) == 4:
            yuan, yen, dollar, euro = new_values
            bot.send_message(message.chat.id, f"Курсы обновлены:\nCNY: {yuan}\nUSD: {dollar}\nEUR: {euro}\nJPY: {yen}")
        else:
            bot.send_message(message.chat.id, "Ошибка! Убедитесь, что ввели ровно 4 значения, разделенные точкой с запятой.")
    except ValueError:
        bot.send_message(message.chat.id, "Ошибка! Убедитесь, что все значения числовые и введены правильно.")

@bot.message_handler(commands=['sub'])
def subscribe(message):
    chat_id = message.chat.id
    with sqlite3.connect(db_path) as conn:
        conn.execute("UPDATE users SET is_subscribed = TRUE WHERE telegram_id = ?", (chat_id,))
    bot.send_message(chat_id, "Вы успешно подписались на рассылку.")

@bot.message_handler(commands=['unsub'])
def unsubscribe(message):
    chat_id = message.chat.id
    with sqlite3.connect(db_path) as conn:
        conn.execute("UPDATE users SET is_subscribed = FALSE WHERE telegram_id = ?", (chat_id,))
    bot.send_message(chat_id, "Вы успешно отписаны от рассылки.")

@bot.message_handler(commands=['broadcastspecial'])
def send_broadcast(message):
    if message.from_user.id in trusted_users:
        bot.send_message(message.chat.id, "Введите текст для рассылки:")
        bot.register_next_step_handler(message, handle_broadcast_text)
    else:
        bot.send_message(message.chat.id, "Нет прав для выполнения этой команды.")

def handle_broadcast_text(message):
    text = message.text
    bot.send_message(message.chat.id, "Введите текст для первой кнопки или отправьте команду /skip, если кнопки не нужны.")
    bot.register_next_step_handler(message, handle_button_text, text, [])

def handle_button_text(message, text, buttons):
    if message.text == "/skip":
        bot.send_message(message.chat.id, "Прикрепите фотографию к сообщению, которое вы хотите отправить в рассылке. Если фото не требуется, отправьте команду /skip.")
        bot.register_next_step_handler(message, handle_photo_for_broadcast, text, buttons)
    else:
        button_text = message.text
        bot.send_message(message.chat.id, f"Введите URL для кнопки \"{button_text}\":")
        bot.register_next_step_handler(message, handle_button_url, text, buttons, button_text)

def handle_button_url(message, text, buttons, button_text):
    button_url = message.text
    buttons.append((button_text, button_url))
    bot.send_message(message.chat.id, "Введите текст для следующей кнопки или отправьте команду /skip, если кнопки больше не нужны.")
    bot.register_next_step_handler(message, handle_button_text, text, buttons)

def handle_photo_for_broadcast(message, text, buttons):
    if message.photo:
        photo = message.photo[-1]
        success, not_delivered_users = send_broadcast_with_photo(message.from_user.id, photo, text, buttons)
        if success:
            if not not_delivered_users:
                bot.send_message(message.from_user.id, "Успешная рассылка. Пришла всем пользователям.")
            else:
                bot.send_message(message.from_user.id, f"Успешная рассылка. Не пришла пользователям {not_delivered_users}.")
        else:
            bot.send_message(message.from_user.id, "Рассылка не удалась.")
    else:
        success, not_delivered_users = send_broadcast_text(message.from_user.id, text, buttons)
        if success:
            if not not_delivered_users:
                bot.send_message(message.from_user.id, "Успешная рассылка. Пришла всем пользователям.")
            else:
                bot.send_message(message.from_user.id, f"Успешная рассылка. Не пришла пользователям {not_delivered_users}.")
        else:
            bot.send_message(message.from_user.id, "Рассылка не удалась.")

def send_broadcast_with_photo(sender_id, photo, text, buttons):
    not_delivered_users = []
    try:
        users = get_all_users()  # Используем всех пользователей
        markup = types.InlineKeyboardMarkup()
        for btn_text, btn_url in buttons:
            markup.add(types.InlineKeyboardButton(text=btn_text, url=btn_url))
        for user_id in users:
            if user_id not in blocked_users:
                try:
                    bot.send_photo(user_id, photo.file_id, caption=text, parse_mode="HTML", reply_markup=markup)
                except telebot.apihelper.ApiException as e:
                    if e.result.status_code == 403:
                        blocked_users.append(user_id)
                    else:
                        not_delivered_users.append(user_id)
        return True, not_delivered_users
    except Exception as e:
        print(f"Error sending broadcast with photo: {e}")
        return False, not_delivered_users

def send_broadcast_text(sender_id, text, buttons):
    not_delivered_users = []
    try:
        users = get_all_users()  # Используем всех пользователей
        markup = types.InlineKeyboardMarkup()
        for btn_text, btn_url in buttons:
            markup.add(types.InlineKeyboardButton(text=btn_text, url=btn_url))
        for user_id in users:
            if user_id not in blocked_users:
                try:
                    bot.send_message(user_id, text, parse_mode="HTML", reply_markup=markup)
                except telebot.apihelper.ApiException as e:
                    if e.result.status_code == 403:
                        blocked_users.append(user_id)
                    else:
                        not_delivered_users.append(user_id)
        return True, not_delivered_users
    except Exception as e:
        print(f"Error sending broadcast with text: {e}")
        return False, not_delivered_users

@bot.message_handler(func=lambda message: message.text == "🧮КАЛЬКУЛЯТОР🧮")
def calculator_main(message):
    markup = types.InlineKeyboardMarkup()
    web_app_button = types.InlineKeyboardButton(
        text="Открыть Калькулятор",
        web_app=types.WebAppInfo(url="https://m37avolt.github.io/volt-logistics/")
    )
    markup.add(web_app_button)
    bot.send_message(message.chat.id, "Калькулятор доступен здесь:", reply_markup=markup)

@bot.message_handler(content_types=['web_app_data'])
def handle_web_app_data(message):
    try:
        data = json.loads(message.web_app_data.data)
        user_id = message.from_user.id

        if data['command'] == 'create_order':
            full_name = data['full_name']
            telegram_username = data['telegram_username']
            items = data['items']

            # Создаем заказ в базе данных
            order_id = create_order(user_id, status="Новый", full_name=full_name, telegram_username=telegram_username)

            # Сохраняем информацию о товарах
            for item in items:
                add_item_to_order(order_id, item['photo'], item['color'], item['size'])

            bot.send_message(user_id, f"Добавлен новый заказ! Номер заказа: #{order_id}")
        else:
            bot.send_message(user_id, "Неизвестная команда.")
    except Exception as e:
        bot.send_message(message.chat.id, f"Ошибка: {str(e)}")

def add_item_to_order(order_id, photo, color, size):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO order_items (order_id, photo, color, size) VALUES (?, ?, ?, ?)",
        (order_id, photo, color, size)
    )
    conn.commit()
    conn.close()

def update_order_status(order_id, new_status):
    update_order(order_id, status=new_status)

def get_order_status(order_id):
    order = get_order(order_id)
    return order[3] if order else None

@bot.message_handler(commands=['track'])
def track_order(message):
    user_id = message.from_user.id
    orders = get_user_orders(user_id)
    if not orders:
        bot.send_message(user_id, "У вас нет активных заказов.")
        return_to_main_menu(message)
    else:
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        for order_id, status in orders:
            markup.add(types.KeyboardButton(f"Заказ #{order_id} ({status})"))
        back_button = types.KeyboardButton("Назад")
        markup.add(back_button)
        bot.send_message(user_id, "Выберите заказ для отслеживания:", reply_markup=markup)

@bot.message_handler(func=lambda message: message.text.startswith("Заказ #"))
def show_order_details(message):
    order_id = int(message.text.split()[1].strip('#'))
    order = get_order(order_id)
    if order:
        photos = order[4].split(',') if order[4] else []
        comments = json.loads(order[5]) if order[5] else []
        photos_text = ", ".join(photos) if photos else "Нет"
        comments_text = "\n".join([f"{c['text']} (от {c['manager_id']})" for c in comments]) if comments else "Нет"
        bot.send_message(message.chat.id, f"Детали заказа #{order_id}:\nСтатус: {order[3]}\nФото: {photos_text}\nКомментарии:\n{comments_text}")
    else:
        bot.send_message(message.chat.id, "Заказ не найден")

@bot.message_handler(commands=['edit_status'])
def edit_status(message):
    if is_manager(message.from_user.id):
        bot.send_message(message.chat.id, "Введите ID заказа:")
        bot.register_next_step_handler(message, process_order_id)
    else:
        bot.send_message(message.chat.id, "Нет прав для выполнения этой команды.")

def process_order_id(message):
    try:
        order_id = int(message.text)
        bot.send_message(message.chat.id, "Введите новый статус:")
        bot.register_next_step_handler(message, update_status, order_id)
    except:
        bot.send_message(message.chat.id, "Ошибка ID заказа")

def update_status(message, order_id):
    new_status = message.text
    update_order_status(order_id, new_status)
    bot.send_message(message.chat.id, f"Статус заказа {order_id} изменен на '{new_status}'")

@bot.message_handler(commands=['check_user'])
def check_user(message):
    user_id = message.from_user.id
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE telegram_id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if user:
        bot.send_message(
            message.chat.id,
            f"Вы в базе данных! Ваш статус:\n"
            f"ID в базе: {user[0]}\n"
            f"Telegram ID: {user[1]}\n"
            f"Менеджер: {'Да' if user[2] else 'Нет'}\n"
        )
    else:
        bot.send_message(message.chat.id, "Вы не добавлены в базу данных.")

@bot.message_handler(func=lambda message: message.text == "Назад")
def handle_back_after_quantity(message):
    return_to_main_menu(message)

@bot.message_handler(func=lambda message: message.text.upper() == "📈КУРСЫ ВАЛЮТ📈")
def show_currency(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, f"КУРСЫ ВАЛЮТ:\n1 CNY - {yuan} руб.\n1 USD - {dollar} руб.\n1 EUR - {euro} руб.\n1 JPY - {yen} руб.", parse_mode='HTML')

@bot.message_handler(func=lambda message: message.text.upper() == "❗️ИНФОРМАЦИЯ❗️")
def company_info(message):
    info_text = """
Мы — <i><b>VOLT Logistics🚀</b></i>
Один из лучших сервисов Выкупа и доставки, предоставляющих услуги сотрудничества с Китаем, Японией, Европой и США под ключ 🔑"""
    bot.send_message(message.chat.id, info_text, parse_mode='HTML')

@bot.message_handler(commands=['order'])
def handle_order_command(message):
    user_id = message.from_user.id
    order_id = create_order(user_id, status="Новый")
    send_order_notification(user_id, order_id, "Заказ успешно создан.")
    markup = types.InlineKeyboardMarkup()
    web_app_button = types.InlineKeyboardButton(text="Открыть Калькулятор", web_app=types.WebAppInfo(url="https://m37avolt.github.io/volt-logistics/"))
    markup.add(web_app_button)
    bot.send_message(user_id, "Калькулятор доступен здесь:", reply_markup=markup)

def return_to_main_menu(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
    btn2 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
    if is_manager(message.from_user.id):
        manager_button = types.KeyboardButton("ПАНЕЛЬ МЕНЕДЖЕРА")
        markup.add(btn1, btn2, manager_button)
    else:
        markup.add(btn1, btn2)
    bot.send_message(message.chat.id, "Вы вернулись в главное меню", reply_markup=markup)

# Обработчик любых сообщений для добавления пользователя в базу данных
@bot.message_handler(func=lambda message: True)
def any_message_handler(message):
    user_id = message.from_user.id
    add_user(user_id)  # Добавляем пользователя в базу
    send_options(message)

if __name__ == "__main__":
    print("Бот запущен...")
    bot.polling(none_stop=True)