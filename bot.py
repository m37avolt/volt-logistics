# -*- coding: utf-8 -*-
import telebot
import os
from telebot import types
import time

bot = telebot.TeleBot('6425282545:AAHv28Q5sWLgMpMnn-9FLrASUYITQNMDFkM')

# Глобальные переменные для курсов валют
yuan = 14.5
yen = 0.72
dollar = 98.1
euro = 105.3

# Замените этими значениями реальные ID пользователей
trusted_users = [919034275, 372145026, 6432717873]

# Пути к файлам
script_dir = os.path.dirname(os.path.abspath(__file__))
chats_file_path = os.path.join(script_dir, 'chats.txt')
orders_file_path = os.path.join(script_dir, 'orders.txt')
blocked_users = []

# Функция для эмуляции печати и задержки
def emulate_typing_and_delay(message):
    bot.send_chat_action(message.chat.id, 'typing')
    time.sleep(1.5)

# Функция для отправки главного меню
def send_options(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
    btn4 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
    markup.add(btn1, btn4)
    emulate_typing_and_delay(message)
    bot.send_message(message.chat.id,
                     "Добрый день!\n"
                     "Давайте знакомиться🤝\n"
                     "Мы — <i><b>VOLT Logistics🚀</b></i>\n"
                     "Один из лучших сервисов Выкупа и доставки, предоставляющих услуги сотрудничества с Китаем, Японией, Европой и США под ключ 🔑\n"
                     "<i><b>Откуда VOLT доставляет грузы?</b></i>\n"
                     "\t•Китай 🇨🇳\n"
                     "\t•Япония 🇯🇵\n"
                     "\t•Европа 🇪🇺\n"
                     "\t•США 🇺🇸\n"
                     "<i><b>Куда VOLT доставляет грузы?</b></i>\n"
                     "\t•Россия 🇷🇺\n"
                     "\t•Европа 🇪🇺 (доставка с помощью партнеров)\n"
                     "\t•Страны СНГ\n"
                     "\t•Остальной мир 🌍\n"
                     "Мы в Китае: https://t.me/VoltLogistics/541\n"
                     "Мы в Японии: https://t.me/VoltLogistics/525\n"
                     "Если вы хотите заказать товар от закрытых поставщиков НАПИШИТЕ нашим менеджерам об этом и мы предоставим Вам эту возможность БЕСПЛАТНО (КИТАЙ 🇨🇳)\n"
                     "💙<i><b>Почему именно мы?</b></i>\n"
                     "• Живая работа в Китае, Японии, Италии\n"
                     "• Собственные склады (в 4 городах Китая + Гонконг)\n"
                     "• Тысячи довольных клиентов\n"
                     "• Открытая и прозрачная работа без скрытых комиссий\n"
                     "• Выгодные курсы обмена валют\n"
                     "• Подбор лучших товаров и надежных поставщиков\n"
                     "• Эксклюзивные предложения от фабрик-партнеров\n"
                     "• Персональные скидки и акции для постоянных покупателей\n"
                     "• Удобный сервис, поддержка 24/7 и личное ведение каждого клиента\n"
                     "• С помощью профессионалов Volt Logistics🚀 Вы сможете приобрести любой товар по самой выгодной цене.\n"
                     "• Наша команда также организует доставку крупногабаритного груза - авто, техника для производства, химикаты и прочее.\n"
                     "• Машины и Мототехнику возим со всего мира 🌍\n"
                     "Наш чат: https://t.me/+ZZGInD-niVsyOWRi\n"
                     "Бесплатный поиск товаров по запросу 💕\n"
                     "Ссылка на наш канал с отзывами: https://t.me/Voltfeedback\n"
                     "Для заказа писать 👉 (https://t.me/VoltLogisticsAdmin)сюда (https://t.me/VoltZakaz)👈\n"
                     "(https://t.me/VoltLogisticsAdmin)\n"
                     "Актуальные контакты менеджеров:\n"
                     "@VoltZakaz - ✅ (работает)\n"
                     "@VoltLogisticsAdmin - ❌ (временно недоступен)\n"
                     "❗️По Вопросам сотрудничества и решения сложных задач:\n"
                     "@finesko - Валерий\n"
                     "@Volt_vazhnoe - Георгий", parse_mode='HTML', reply_markup=markup)

# Функция для возврата в главное меню
def return_to_main_menu(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
    btn4 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
    markup.add(btn1, btn4)
    bot.send_message(message.chat.id, "Вы вернулись в главное меню", reply_markup=markup)

# Функция для проверки подписки пользователя на рассылку
def is_subscribed(chat_id):
    with open(chats_file_path, 'r') as chats:
        lines = chats.read().splitlines()
    return str(chat_id) in lines

# Функция для получения списка подписанных пользователей
def get_subscribed_users(file_path):
    with open(file_path, 'r') as chats:
        return [int(line.strip()) for line in chats.readlines()]

# Функция для отправки рассылки с текстом
def send_broadcast_text(sender_id, text, buttons):
    not_delivered_users = []
    try:
        users = get_subscribed_users(chats_file_path)
        users.extend(get_order_users(orders_file_path))
        users = list(set(users))  # Убираем дубликаты
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

# Функция для отправки рассылки с изображением
def send_broadcast_with_photo(sender_id, photo, text, buttons):
    not_delivered_users = []
    try:
        users = get_subscribed_users(chats_file_path)
        users.extend(get_order_users(orders_file_path))
        users = list(set(users))  # Убираем дубликаты
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

# Функция для получения пользователей с заказами
def get_order_users(file_path):
    users = set()
    with open(file_path, 'r') as orders:
        for line in orders:
            parts = line.strip().split(',')
            if len(parts) > 0:
                user_id = int(parts[0])
                users.add(user_id)
    return list(users)

# Функция для отправки уведомления пользователю о заказе
def send_order_notification(user_id, order_id, message_text):
    bot.send_message(user_id, f"Заказ #{order_id}: {message_text}")

# Функция для создания нового заказа
def create_order(user_id, status="Новый"):
    order_id = len(get_order_users(orders_file_path)) + 1
    with open(orders_file_path, 'a') as orders:
        orders.write(f"{user_id},{order_id},{status}\n")
    return order_id

# Функция для обновления статуса заказа
def update_order_status(order_id, new_status):
    orders = []
    with open(orders_file_path, 'r') as orders_file:
        for line in orders_file:
            parts = line.strip().split(',')
            if len(parts) > 2 and int(parts[1]) == order_id:
                parts[2] = new_status
            orders.append(','.join(parts))
    with open(orders_file_path, 'w') as orders_file:
        orders_file.write('\n'.join(orders))

# Функция для получения статуса заказа
def get_order_status(order_id):
    with open(orders_file_path, 'r') as orders_file:
        for line in orders_file:
            parts = line.strip().split(',')
            if len(parts) > 2 and int(parts[1]) == order_id:
                return parts[2]
    return None

# Функция для получения всех заказов пользователя
def get_user_orders(user_id):
    orders = []
    with open(orders_file_path, 'r') as orders_file:
        for line in orders_file:
            parts = line.strip().split(',')
            if len(parts) > 2 and int(parts[0]) == user_id:
                orders.append((int(parts[1]), parts[2]))
    return orders

# Обработчик команды /start
@bot.message_handler(commands=['start'])
def start(message):
    send_options(message)

# Обработчик команды /change_course
@bot.message_handler(commands=['change_course'])
def change_course(message):
    sender_id = message.from_user.id
    if sender_id in trusted_users:
        bot.send_message(sender_id, "Введите новые значения курсов валют в формате:\n"
                                  "`yuan;yen;dollar;euro`\n"
                                  "Например: `14.5;0.72;98.1;105.3`")
        bot.register_next_step_handler(message, update_course)
    else:
        bot.send_message(sender_id, "У вас нет прав для выполнения этой команды.")

def update_course(message):
    global yuan, yen, dollar, euro
    try:
        new_values = list(map(float, message.text.split(';')))
        if len(new_values) == 4:
            yuan, yen, dollar, euro = new_values
            bot.send_message(message.chat.id, f"Курсы обновлены:\n"
                                            f"Юань: {yuan}\n"
                                            f"Йена: {yen}\n"
                                            f"Доллар: {dollar}\n"
                                            f"Евро: {euro}")
        else:
            bot.send_message(message.chat.id, "Ошибка! Убедитесь, что ввели ровно 4 значения, разделенные точкой с запятой.")
    except ValueError:
        bot.send_message(message.chat.id, "Ошибка! Убедитесь, что все значения числовые и введены правильно.")

# Обработчик команды /sub
@bot.message_handler(commands=['sub'])
def handle_subscribe(message):
    chat_id = message.chat.id
    with open(chats_file_path, 'r') as chats:
        lines = chats.read().splitlines()
    if str(chat_id) not in lines:
        with open(chats_file_path, 'a') as chats:
            chats.write(str(chat_id) + '\n')
        bot.reply_to(message, "Вы успешно подписались на рассылку.")
    else:
        bot.reply_to(message, "Вы уже подписаны на рассылку.")

# Обработчик команды /unsub
@bot.message_handler(commands=['unsub'])
def handle_unsubscribe(message):
    chat_id = message.chat.id
    try:
        with open(chats_file_path, 'r') as chats:
            lines = chats.read().splitlines()
        if str(chat_id) in lines:
            lines.remove(str(chat_id))
            with open(chats_file_path, 'w') as chats:
                chats.write('\n'.join(lines))
            bot.reply_to(message, "Вы успешно отписаны от рассылки.")
        else:
            bot.reply_to(message, "Вы не подписаны на рассылку.")
    except Exception as e:
        print(f"Error handling unsubscribe: {e}")
        bot.reply_to(message, "Произошла ошибка при отписке.")

# Обработчик команды /broadcastspecial
@bot.message_handler(commands=['broadcastspecial'])
def handle_broadcast_special(message):
    sender_id = message.from_user.id
    if sender_id in trusted_users:
        bot.send_message(sender_id, "Введите текст для рассылки:")
        bot.register_next_step_handler(message, handle_broadcast_text)
    else:
        bot.send_message(sender_id, "У вас нет прав для выполнения этой команды.")

def handle_broadcast_text(message):
    sender_id = message.from_user.id
    text = message.text
    bot.send_message(sender_id, "Введите текст для первой кнопки или отправьте команду /skip, если кнопки не нужны.")
    bot.register_next_step_handler(message, handle_button_text, text, [])

def handle_button_text(message, text, buttons):
    sender_id = message.from_user.id
    if message.text == "/skip":
        bot.send_message(sender_id, "Прикрепите фотографию к сообщению, которое вы хотите отправить в рассылке. Если фото не требуется, отправьте команду /skip.")
        bot.register_next_step_handler(message, handle_photo_for_broadcast, text, buttons)
    else:
        button_text = message.text
        bot.send_message(sender_id, f"Введите URL для кнопки \"{button_text}\":")
        bot.register_next_step_handler(message, handle_button_url, text, buttons, button_text)

def handle_button_url(message, text, buttons, button_text):
    sender_id = message.from_user.id
    button_url = message.text
    buttons.append((button_text, button_url))
    bot.send_message(sender_id, "Введите текст для следующей кнопки или отправьте команду /skip, если кнопки больше не нужны.")
    bot.register_next_step_handler(message, handle_button_text, text, buttons)

def handle_photo_for_broadcast(message, text, buttons):
    sender_id = message.from_user.id
    if message.photo:
        photo = message.photo[-1]
        success, not_delivered_users = send_broadcast_with_photo(sender_id, photo, text, buttons)
        if success:
            if not not_delivered_users:
                bot.send_message(sender_id, "Успешная рассылка. Пришла всем пользователям.")
            else:
                bot.send_message(sender_id, f"Успешная рассылка. Не пришла пользователям {not_delivered_users}.")
        else:
            bot.send_message(sender_id, "Рассылка не удалась.")
    else:
        success, not_delivered_users = send_broadcast_text(sender_id, text, buttons)
        if success:
            if not not_delivered_users:
                bot.send_message(sender_id, "Успешная рассылка. Пришла всем пользователям.")
            else:
                bot.send_message(sender_id, f"Успешная рассылка. Не пришла пользователям {not_delivered_users}.")
        else:
            bot.send_message(sender_id, "Рассылка не удалась.")

# Обработчик команды /order
@bot.message_handler(commands=['order'])
def handle_order_command(message):
    user_id = message.from_user.id
    order_id = create_order(user_id)
    send_order_notification(user_id, order_id, "Заказ успешно создан.")
    markup = types.InlineKeyboardMarkup()
    web_app_button = types.InlineKeyboardButton(text="Открыть Калькулятор", web_app=types.WebAppInfo(url="https://yourdomain.com"))
    markup.add(web_app_button)
    bot.send_message(user_id, "Откройте калькулятор для оформления заказа:", reply_markup=markup)

# Обработчик команды /track
@bot.message_handler(commands=['track'])
def handle_track_command(message):
    user_id = message.chat.id
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

# Обработчик выбора заказа для отслеживания
@bot.message_handler(func=lambda message: message.text.startswith("Заказ #"))
def handle_order_tracking(message):
    user_id = message.chat.id
    order_id = int(message.text.split()[1].strip('#'))
    status = get_order_status(order_id)
    bot.send_message(user_id, f"Заказ #{order_id}\nСтатус: {status}")
    return_to_main_menu(message)

# Обработчик кнопки "Назад"
@bot.message_handler(func=lambda message: message.text == "Назад")
def handle_back_after_quantity(message):
    return_to_main_menu(message)

# Обработчик кнопки "🧮КАЛЬКУЛЯТОР🧮"
@bot.message_handler(func=lambda message: message.text.upper() == "🧮КАЛЬКУЛЯТОР🧮")
def calculator_main(message):
    markup = types.InlineKeyboardMarkup()
    web_app_button = types.InlineKeyboardButton(text="Открыть Калькулятор", web_app=types.WebAppInfo(url="https://yourdomain.com"))
    markup.add(web_app_button)
    bot.send_message(message.chat.id, "Откройте калькулятор для расчета стоимости товаров:", reply_markup=markup)

# Обработчик кнопки "ҰЗНАТИ ҚОШІМДАҚ"
@bot.message_handler(func=lambda message: message.text.upper() == "ҰЗНАТИ ҚОШІМДАҚ")
def inf(message):
    chat_id = message.chat.id
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    currency_button = types.KeyboardButton("📈Курсы валют📈")
    markup.add(currency_button)
    if is_subscribed(chat_id):
        company_info_button = types.KeyboardButton("💙Информация о компании💙")
        markup.add(company_info_button)
    else:
        subscribe_button = types.KeyboardButton("💙Подписаться на рассылку💙")
        markup.add(subscribe_button)
        company_info_button = types.KeyboardButton("💙Информация о компании💙")
        markup.add(company_info_button)
    back_button = types.KeyboardButton("Назад")
    markup.add(back_button)
    bot.send_message(chat_id, "Выберите раздел:", reply_markup=markup)

# Обработчик кнопки "💙Подписаться на рассылку💙"
@bot.message_handler(func=lambda message: message.text == "💙Подписаться на рассылку💙")
def subscribe(message):
    chat_id = message.chat.id
    if not is_subscribed(chat_id):
        with open(chats_file_path, 'a') as chats:
            chats.write(str(chat_id) + '\n')
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    currency_button = types.KeyboardButton("📈Курсы валют📈")
    markup.add(currency_button)
    company_info_button = types.KeyboardButton("💙Информация о компании💙")
    markup.add(company_info_button)
    back_button = types.KeyboardButton("Назад")
    markup.add(back_button)
    bot.send_message(chat_id, "Вы успешно подписались на рассылку.", reply_markup=markup)

# Обработчик кнопки "📈Курсы валют📈"
@bot.message_handler(func=lambda message: message.text == "📈Курсы валют📈")
def currency_info(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, f"КУРСЫ ВАЛЮТ:\n"
                            f"\t1 CNY - {yuan} руб.\n"
                            f"\t1 USD - {dollar} руб.\n"
                            f"\t1 EUR - {euro} руб.\n"
                            f"\t1 JPY - {yen} руб.")

# Обработчик кнопки "💙Информация о компании💙"
@bot.message_handler(func=lambda message: message.text == "💙Информация о компании💙")
def total_info(message):
    info_text = """Мы — <i><b>VOLT Logistics🚀</b></i>
Один из лучших сервисов Выкупа и доставки, предоставляющих услуги сотрудничества с Китаем, Японией, Европой и США под ключ 🔑
<i><b>Откуда VOLT доставляет грузы?</b></i>
\t•Китай 🇨🇳
\t•Япония 🇯🇵
\t•Европа 🇪🇺
\t•США 🇺🇸
<i><b>Куда VOLT доставляет грузы?</b></i>
\t•Россия 🇷🇺
\t•Европа 🇪🇺 (доставка с помощью партнеров)
\t•Страны СНГ
\t•Остальной мир 🌍
Мы в Китае - https://t.me/VoltLogistics/541
Мы в Японии - https://t.me/VoltLogistics/525
Если вы хотите заказать товар от закрытых поставщиков НАПИШИТЕ нашим менеджерам об этом и мы предоставим Вам эту возможность БЕСПЛАТНО (КИТАЙ 🇨🇳)
💙<i><b>Почему именно мы?</b></i>
• Живая работа в Китае, Японии, Италии
• Собственные склады (в 4 городах Китая + Гонконг)
• Тысячи довольных клиентов
• Открытая и прозрачная работа без скрытых комиссий
• Выгодные курсы обмена валют
• Подбор лучших товаров и надежных поставщиков
• Эксклюзивные предложения от фабрик-партнеров
• Персональные скидки и акции для постоянных покупателей
• Удобный сервис, поддержка 24/7 и личное ведение каждого клиента
• С помощью профессионалов Volt Logistics🚀 Вы сможете приобрести любой товар по самой выгодной цене.
• Наша команда также организует доставку крупногабаритного груза - авто, техника для производства, химикаты и прочее.
• Машины и Мототехнику возим со всего мира 🌍
Наш чат: https://t.me/+ZZGInD-niVsyOWRi
Бесплатный поиск товаров по запросу 💕
Ссылка на наш канал с отзывами: https://t.me/Voltfeedback 
Для заказа писать сюда 👉 https://t.me/VoltLogisticsAdmin 👈
Актуальные контакты менеджеров:
@VoltZakaz - ✅ (работает)
@VoltLogisticsAdmin - ❌ (временно недоступен)
❗️По Вопросам сотрудничества и решения сложных задач:
@finesko - Валерий
@Volt_vazhnoe - Георгий"""
    bot.send_message(message.chat.id, info_text, parse_mode='HTML')

if __name__ == "__main__":
    bot.polling(none_stop=True)