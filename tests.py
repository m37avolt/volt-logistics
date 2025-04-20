# -*- coding: utf-8 -*-
import telebot
import PIL
from PIL import Image, ImageDraw, ImageFont
import  time
from telebot import types
import os


bot = telebot.TeleBot('6425282545:AAHv28Q5sWLgMpMnn-9FLrASUYITQNMDFkM')

yuan=14
yen=0.71
dollar=98
euro=105

@bot.message_handler(commands=['change_course'])
def change_course(message):
    sender_id = message.from_user.id
    if sender_id in trusted_users:
        bot.send_message(sender_id, "Введите новые значения курсов валют в формате:\n`yuan;yen;dollar;euro`\nНапример: `14.5;0.72;98.1;105.3`")
        bot.register_next_step_handler(message, update_course)
    else:
        bot.send_message(sender_id, "У вас нет прав для выполнения этой команды.")

def update_course(message):
    global yuan, yen, dollar, euro
    try:
        new_values = list(map(float, message.text.split(';')))
        if len(new_values) == 4:
            yuan, yen, dollar, euro = new_values
            bot.send_message(message.chat.id, f"Курсы обновлены:\nЮань: {yuan}\nЙена: {yen}\nДоллар: {dollar}\nЕвро: {euro}")
        else:
            bot.send_message(message.chat.id, "Ошибка! Убедитесь, что ввели ровно 4 значения, разделенные точкой с запятой.")
    except ValueError:
        bot.send_message(message.chat.id, "Ошибка! Убедитесь, что все значения числовые и введены правильно.")



@bot.message_handler(commands=['start'])
def start(message):
    send_options(message)


def add_back_button(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    back_btn = types.KeyboardButton("Назад")
    markup.add(back_btn)
    bot.send_message(message.chat.id, "Введите количество товара:", reply_markup=markup)

blocked_users = []

script_dir = os.path.dirname(os.path.abspath(__file__))


chats_file_path = os.path.join(script_dir, 'chats.txt')

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


# Замените этими значениями реальные ID пользователей
trusted_users = [919034275, 372145026, 6432717873] 

script_dir = os.path.dirname(os.path.abspath(__file__))
chats_file_path = os.path.join(script_dir, 'chats.txt')

blocked_users = []

def get_subscribed_users(file_path):
    with open(file_path, 'r') as chats:
        return [int(line.strip()) for line in chats.readlines()]

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

def send_broadcast_with_photo(sender_id, photo, text, buttons):
    not_delivered_users = []
    try:
        users = get_subscribed_users(chats_file_path)
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
        users = get_subscribed_users(chats_file_path)
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


def send_options(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
    btn2 = types.KeyboardButton("💴ПОПОЛНЕНИЕ💴")
    btn4 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
    markup.add(btn1, btn2, btn4)
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

@bot.message_handler(func=lambda message: message.text == "Назад")
def handle_back_after_quantity(message):
    return_to_main_menu(message)



@bot.message_handler(func=lambda message: message.text.upper() == "🇨🇳КИТАЙ🇨🇳")
def china_options(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🏮POIZON/TAOBAO/WEIDAN И ДР.🏮")
    btn2 = types.KeyboardButton("🏮WEECHAT/YUPOO/GOOFISH🏮")
    btn3 = types.KeyboardButton("Назад")
    markup.add(btn1, btn2, btn3)
    bot.send_message(message.chat.id, "Выберите маркетплейс:", reply_markup=markup)


@bot.message_handler(func=lambda message: message.text.upper() == "🇪🇺ЕВРО\США🇺🇸")
def euorusoptions_options(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = types.KeyboardButton("🇪🇺ЕВРО🇪🇺")
    btn2 = types.KeyboardButton("🇺🇸США🇺🇸")
    btn3 = types.KeyboardButton("Назад")
    markup.add(btn1, btn2, btn3)
    bot.send_message(message.chat.id, "Выберите страну:", reply_markup=markup)

@bot.message_handler(func=lambda message: message.text.upper() == "💴ПОПОЛНЕНИЕ💴")
def alipay_request(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    back_btn = types.KeyboardButton("Назад")
    skip_btn = types.KeyboardButton("Пропустить")
    markup.add(back_btn, skip_btn)  # Добавляем обе кнопки в разметку
    bot.send_message(message.chat.id, f"Для отправки заявок в наш сервис пополнения и обмена валют ознакомьтесь с памяткой! \n"
                                     "Инструкция по работе:\n"
                                     "https://telegra.ph/Instrukciya-po-rabote-s-nami-04-09", reply_markup=markup)
    bot.send_chat_action(message.chat.id, 'typing')
    time.sleep(0.25)
    bot.send_message(message.chat.id, f"Отправьте фотогрфию (QR-код вашего кошелька Alipay, WeChat и т.д.):", reply_markup=markup)
    bot.register_next_step_handler(message, handle_alipay_request)

@bot.message_handler(content_types=['photo'])
def handle_alipay_request(message):
    photo = message.photo[-1] if message.photo else None
    
    if photo:
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        back_btn = types.KeyboardButton("Назад")
        markup.add(back_btn)
        bot.send_message(message.chat.id, "Пожалуйста, укажите ваше имя и фамилию на латинице:", reply_markup=markup)
        bot.register_next_step_handler(message, handle_name_input, photo)
    else:
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        back_btn = types.KeyboardButton("Назад")
        markup.add(back_btn)
        
        if message.text.lower() == "назад":
            return_to_main_menu(message)
        elif message.text.lower() == "пропустить":
            bot.send_message(message.chat.id, "Пожалуйста, укажите ваше имя и фамилию на латинице:", reply_markup=markup)
            bot.register_next_step_handler(message, handle_name_input, None)  # Pass None as photo
        else:
            bot.send_message( message.chat.id, f"Пожалуйста, отправьте фотографию (Если она не требуется, нажмите кнопку 'Пропустить').", reply_markup=markup)

def handle_name_input(message, photo):
    if message.text:

        if message.text.lower() == "назад":
            return_to_main_menu(message)
            return  
        elif not all(word.isalpha() for word in message.text.split()):
            bot.send_message(message.chat.id, "Ошибка! Введите Ваше имя и фамилию на латинице.")
            return_to_main_menu(message)
            return
        else:
            name = message.text
            bot.send_message(message.chat.id, "Пожалуйста, укажите количество юаней для обмена:")
            bot.register_next_step_handler(message, handle_amount_input, name, photo)
    else:
        bot.send_message(message.chat.id, "Пожалуйста, укажите Ваше имя и фамилию на латинице.")

def handle_amount_input(message, name, photo):
    if message.text:
        if message.text.lower() == "назад":
            return_to_main_menu(message)
            return
        elif not message.text.isdigit():
            bot.send_message(message.chat.id, "Ошибка! Введите количество юаней для обмена только цифрами.")
            bot.register_next_step_handler(message, handle_amount_input, name, photo)
            return
        else:
            amount = message.text
            bot.send_message(message.chat.id, "Пожалуйста, укажите Ваш номер телефона/карты/счета:")
            bot.register_next_step_handler(message, handle_phone_number_input, name, photo, amount)
    else:
        bot.send_message(message.chat.id, "Пожалуйста, укажите количество юаней для обмена только цифрами.")

def handle_phone_number_input(message, name, photo, amount):
    if message.text:
        if message.text.lower() == "назад":
            return_to_main_menu(message)
            return
        elif not message.text.isdigit():
            bot.send_message(message.chat.id, "Ошибка! Введите Ваш номер телефона или карты только цифрами.")
            bot.register_next_step_handler(message, handle_phone_number_input, name, photo, amount)
            return
        else:
            phone_number = message.text
            send_alipay_request(name, amount, photo, phone_number, message.from_user.username)
            markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
            btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
            btn2 = types.KeyboardButton("💴ПОПОЛНЕНИЕ💴")
            btn4 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
            markup.add(btn1, btn2, btn4)
            emulate_typing_and_delay(message)
            bot.send_message(message.chat.id, "Ваша заявка на пополнение Alipay отправлена менеджеру.", reply_markup=markup)
    else:
        bot.send_message(message.chat.id, "Пожалуйста, укажите ваш номер телефона только цифрами.")

def send_alipay_request(name, amount, photo, phone_number, username):
    manager_chat_id = "6508967389"
    request_message = f"Новая заявка на пополнение Alipay:\n\n" \
                      f"Имя и фамилия: {name}\n" \
                      f"Номер телефона/карты/счета: {phone_number}\n" \
                      f"Количество юаней: {amount} CNY\n" \
                      f"Юзернейм: @{username}"
    if photo:
        bot.send_photo(manager_chat_id, photo.file_id, caption=request_message)
    else:
        bot.send_message(manager_chat_id, request_message)

@bot.message_handler(func=lambda message: message.text.upper() == "🧮КАЛЬКУЛЯТОР🧮")
def calculator_main(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=3)
    btn1 = types.KeyboardButton("🇪🇺ЕВРО\США🇺🇸")
    btn2 = types.KeyboardButton("🇨🇳КИТАЙ🇨🇳")
    btn3 = types.KeyboardButton("⛩ЯПОНИЯ⛩")
    btn4 = types.KeyboardButton("Назад")
    markup.add(btn1, btn2, btn3, btn4)
    bot.send_message(message.chat.id, "Выберите маркетплейс:", reply_markup=markup)


@bot.message_handler(func=lambda message: message.text.upper() == "🇺🇸США🇺🇸")
def count_dollar(message):
    add_back_button(message)
    time.sleep(0.55)
    bot.register_next_step_handler(message, process_quantity_dollar)
    time.sleep(0.3)

@bot.message_handler(func=lambda message: message.text.upper() == "🇪🇺ЕВРО🇪🇺")
def count_euro(message):
    add_back_button(message)
    time.sleep(0.55)
    bot.register_next_step_handler(message, process_quantity_euro)
    time.sleep(0.3)

@bot.message_handler(func=lambda message: message.text.upper() == "⛩ЯПОНИЯ⛩")
def count_yen(message):
    add_back_button(message)
    time.sleep(0.55)
    bot.register_next_step_handler(message, process_quantity_yen)
    time.sleep(0.3)

# Функция для проверки подписки пользователя на рассылку
def is_subscribed(chat_id):
    with open(chats_file_path, 'r') as chats:
        lines = chats.read().splitlines()
    return str(chat_id) in lines

# Алгоритм отправки информации о компании
@bot.message_handler(func=lambda message: message.text == "❗️ИНФОРМАЦИЯ❗️")
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

# Обработчик нажатия кнопки подписки
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

# Обработчик нажатия кнопки "Курсы валют"
@bot.message_handler(func=lambda message: message.text == "📈Курсы валют📈")
def currency_info(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, f"КУРСЫ ВАЛЮТ:\n\t1 CNY - {yuan} руб.\n\t1 USD - {dollar} руб.\n\t1 EUR - {euro} руб.\n\t1 JPY - {yen} руб.")

@bot.message_handler(func=lambda message: message.text == "💙Информация о компании💙")
def total_info(message):
    # Указываем текст информации о компании с правильным форматированием для HTML
    info_text = """Мы — <i><b>VOLT Logistics🚀</b></i>\n\nОдин из лучших сервисов Выкупа и доставки, предоставляющих услуги сотрудничества с Китаем, Японией, Европой и США под ключ 🔑\n\n<i><b>Откуда VOLT доставляет грузы?</b></i>\n\t•Китай 🇨🇳\n\t•Япония 🇯🇵\n\t•Европа 🇪🇺\n\t•США 🇺🇸\n\n<i><b>Куда VOLT доставляет грузы?</b></i>\n\t•Россия 🇷🇺\n\t•Европа 🇪🇺 (доставка с помощью партнеров)\n\t•Страны СНГ\n\t•Остальной мир 🌍\n\nМы в Китае - https://t.me/VoltLogistics/541\n\nМы в Японии - https://t.me/VoltLogistics/525\n\nЕсли вы хотите заказать товар от закрытых поставщиков НАПИШИТЕ нашим менеджерам об этом и мы предоставим Вам эту возможность БЕСПЛАТНО (КИТАЙ 🇨🇳)\n\n💙<i><b>Почему именно мы?</b></i>\n\n• Живая работа в Китае, Японии, Италии\n\n• Собственные склады (в 4 городах Китая + Гонконг)\n\n• Тысячи довольных клиентов\n\n• Открытая и прозрачная работа без скрытых комиссий\n\n• Выгодные курсы обмена валют\n\n• Подбор лучших товаров и надежных поставщиков\n\n• Эксклюзивные предложения от фабрик-партнеров\n\n• Персональные скидки и акции для постоянных покупателей\n\n• Удобный сервис, поддержка 24/7 и личное ведение каждого клиента\n\n• С помощью профессионалов Volt Logistics🚀 Вы сможете приобрести любой товар по самой выгодной цене.\n\n• Наша команда также организует доставку крупногабаритного груза - авто, техника для производства, химикаты и прочее.\n\n• Машины и Мототехнику возим со всего мира 🌍\n\nНаш чат: https://t.me/+ZZGInD-niVsyOWRi\n\nБесплатный поиск товаров по запросу 💕\n\nСсылка на наш канал с отзывами: https://t.me/Voltfeedback \n\nДля заказа писать сюда 👉 https://t.me/VoltLogisticsAdmin 👈\n\nАктуальные контакты менеджеров:\n\n@VoltZakaz - ✅ (работает)\n@VoltLogisticsAdmin - ❌ (временно недоступен)\n\n❗️По Вопросам сотрудничества и решения сложных задач:\n@finesko - Валерий\n@Volt_vazhnoe - Георгий"""
    
    # Отправляем текст информации о компании с форматированием HTML
    bot.send_message(message.chat.id, info_text, parse_mode='HTML')


@bot.message_handler(func=lambda message: message.text.upper() == "🏮POIZON/TAOBAO/WEIDAN И ДР.🏮")
def count_yuan1(message):
    add_back_button(message)
    time.sleep(0.55)
    bot.register_next_step_handler(message, process_quantity_yuan1)
    time.sleep(0.3)


@bot.message_handler(func=lambda message: message.text.upper() == "🏮WEECHAT/YUPOO/GOOFISH🏮")
def process_price_yuan2(message):
    add_back_button(message)
    time.sleep(0.55)
    bot.register_next_step_handler(message, process_quantity_yuan2)
    time.sleep(0.3)


def return_to_main_menu(message):
    try:
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
        btn1 = types.KeyboardButton("🧮КАЛЬКУЛЯТОР🧮")
        btn2 = types.KeyboardButton("💴ПОПОЛНЕНИЕ💴")
        btn4 = types.KeyboardButton("❗️ИНФОРМАЦИЯ❗️")
        markup.add(btn1, btn2, btn4)
        bot.send_message(message.chat.id, "Вы вернулись в главное меню", reply_markup=markup)
    except ValueError:
        pass  # Игнорируем ошибку ValueError
    except Exception as e:
        print(f"Error handling 'Назад' button: {e}")



def add_buttons(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    btn1 = types.KeyboardButton("🇪🇺ЕВРО\США🇺🇸")
    btn2 = types.KeyboardButton("🇨🇳КИТАЙ🇨🇳")
    btn3 = types.KeyboardButton("⛩ЯПОНИЯ⛩")
    btn4 = types.KeyboardButton("Назад")
    markup.add(btn1, btn2, btn3, btn4)
    time.sleep(5)
    bot.send_chat_action(message.chat.id, 'typing')
    bot.send_message(message.chat.id,'Выберите команду:', reply_markup=markup)

def emulate_typing_and_delay(message):
    bot.send_chat_action(message.chat.id, 'typing')
    time.sleep(1.5)

def process_quantity_dollar(message):
    try:
        quantity = int(message.text)
        time.sleep(0.3)
        bot.send_message(message.chat.id,
                         "Введите стоимость в $ для каждого из товаров через запятую (цена1, цена2, ...):")
        bot.register_next_step_handler(message, lambda msg: process_price_dollar(msg, quantity))
    except ValueError:
        if message.text != "Назад":  # Проверяем, не нажата ли кнопка "Назад"
            bot.send_message(message.chat.id, "Ошибка! Введите корректную цену товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)


def process_quantity_euro(message):
    try:
        quantity = int(message.text)
        time.sleep(0.3)
        bot.send_message(message.chat.id, "Введите стоимость в € для каждого из товаров через запятую (цена1, цена2, ...):")
        bot.register_next_step_handler(message, lambda msg: process_price_euro(msg, quantity))
    except ValueError:
        if message.text != "Назад":  # Проверяем, не нажата ли кнопка "Назад"
            bot.send_message(message.chat.id, "Ошибка! Введите корректную цену товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)

def process_quantity_yuan1(message):
    try:
        quantity = int(message.text)
        time.sleep(0.3)
        bot.send_message(message.chat.id, "Введите стоимость в ¥ для каждого из товаров через запятую (цена1, цена2, ...):")
        bot.register_next_step_handler(message, lambda msg: process_price_yuan1(msg, quantity))
    except ValueError:
        if message.text != "Назад":  # Проверяем, не нажата ли кнопка "Назад"
            bot.send_message(message.chat.id, "Ошибка! Введите корректную цену товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)

def process_quantity_yuan2(message):
    try:
        quantity = int(message.text)
        time.sleep(0.3)
        bot.send_message(message.chat.id, "Введите стоимость в ¥ для каждого из товаров через запятую (цена1, цена2, ...):")
        bot.register_next_step_handler(message, lambda msg: process_price_yuan2(msg, quantity))
    except ValueError:
        if message.text != "Назад":  # Проверяем, не нажата ли кнопка "Назад"
            bot.send_message(message.chat.id, "Ошибка! Введите корректную цену товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)

def process_quantity_yen(message):
    try:
        quantity = int(message.text)
        time.sleep(0.3)
        bot.send_message(message.chat.id, "Введите стоимость в ¥ для каждого из товаров через запятую (цена1, цена2, ...):")
        bot.register_next_step_handler(message, lambda msg: process_price_yen(msg, quantity))
    except ValueError:
        if message.text != "Назад":  # Проверяем, не нажата ли кнопка "Назад"
            bot.send_message(message.chat.id, "Ошибка! Введите корректную цену товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)

current_dir = os.path.dirname(os.path.abspath(__file__))

# Пути к изображениям и шрифтам
image_path = os.path.join(current_dir, 'normal.png')  # замените на ваше изображение
font_path_main = os.path.join(current_dir, 'TT_Runs_Trial_Bold_HpQxXl.ttf')  # замените на ваш основной шрифт
font_path_secondary = os.path.join(current_dir, 'TT_Runs_Trial_Bold_HpQxXl.ttf')

# Создание изображения с текстом
def create_price_image(currency, total_cost, commission_cost, commission_percentage, country, exchange_rate):
    # Открытие фона изображения
    base = Image.open(image_path).convert('RGBA')
    
    # Создание объекта для рисования
    draw = ImageDraw.Draw(base)
    
    # Загрузка шрифтов
    font_main = ImageFont.truetype(font_path_main, size=100)  # для итоговой цены
    font_secondary = ImageFont.truetype(font_path_secondary, size=30)  # для остальных данных
    
    # Подготовка текста
    total_cost_text = f"{total_cost} ₽"
    commission_cost_text = f"{commission_cost} ₽"
    country_text = f"{country}"
    exchange_rate_text = f"1 {currency} - {exchange_rate} ₽"  # Изменено для вывода курса
    
    # Позиции для текста
    positions = {
        "total_cost": (670, 420),  # координаты нужно настроить
        "commission_cost": (910, 760),
        "country": (540, 760),
        "exchange_rate": (1260, 760)
    }
    
    # Размещение текста на изображении
    draw.text(positions["total_cost"], total_cost_text, font=font_main, fill="white")
    draw.text(positions["commission_cost"], commission_cost_text, font=font_secondary, fill="white")
    draw.text(positions["country"], country_text, font=font_secondary, fill="white")
    draw.text(positions["exchange_rate"], exchange_rate_text, font=font_secondary, fill="white")
    
    # Сохранение изображения
    output_path = os.path.join(current_dir, f'{country}_price_image.png')
    base.save(output_path)
    
    return output_path

# Пример использования функции для нескольких стран
def generate_images_for_countries(price_data):
    for country, data in price_data.items():
        currency = data['currency']
        total_cost = data['total_cost']
        commission_percentage = float(data['commission'].strip('%'))
        commission_cost = total_cost * commission_percentage / 100
        exchange_rate = data['exchange_rate']
        create_price_image(currency, total_cost, commission_cost, commission_percentage, country, exchange_rate)

if __name__ == "__main__":
    price_data = {
        "США": {"currency": "$", "total_cost": 1200, "commission": "10%", "exchange_rate": dollar},  # Используем переменную dollar для курса
        "Россия": {"currency": "₽", "total_cost": 75000, "commission": "5%", "exchange_rate": 1},  # Курс для рубля всегда 1
        "Европа": {"currency": "€", "total_cost": 850, "commission": "8%", "exchange_rate": 0.85},
        # Добавьте больше стран и их данных по мере необходимости
    }
    
    generate_images_for_countries(price_data)

# Обработчики для подсчета стоимости товаров в каждой валюте
def process_price_dollar(message, quantity):
    try:
        prices = list(map(float, message.text.split(',')))
        dollar_price = sum(prices)
        rubles = dollar_price * dollar  # Конвертация цены из долларов в рубли

        commission_percentage = 0
        if dollar_price <= 1000:
            commission_percentage = 25
        elif 1000 < dollar_price <= 5000:
            commission_percentage = 15
        else:
            bot.send_message(message.chat.id, "Цена договорная. Пишите в лс менеджеру.")
            return

        commission = rubles * commission_percentage / 100
        total_cost = rubles + commission
        advance_payment = dollar_price * (1 + commission_percentage / 100)

        # Создаем изображение с информацией о цене
        image_path = create_price_image("$", total_cost, commission, commission_percentage, "США", dollar)

        # Отправляем сообщение с информацией о цене и изображением
        final_message = f"Итоговая стоимость товаров: ~{total_cost} ₽\n\nИтоговая стоимость: {advance_payment} $\n\nСроки доставки:\n🇺🇸 1-7 дней по США\n🇷🇺 10-14 дней до вашей двери\n\nОформить заказ или задать любой интересующий вопрос: @VoltZakaz\n"
        bot.send_photo(message.chat.id, open(image_path, "rb"), caption=final_message)

        add_buttons(message)
    except ValueError:
        if message.text != "Назад":
            bot.send_message(message.chat.id, "Ошибка! Введите корректное количество товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)



def process_price_euro(message, quantity):
    try:
        prices = list(map(float, message.text.split(',')))
        euro_price = sum(prices)
        rubles = euro_price * euro  # Конвертация цены из евро в рубли

        commission_percentage = 0
        if euro_price <= 1000:
            commission_percentage = 25
        elif 1000 < euro_price <= 5000:
            commission_percentage = 15
        else:
            bot.send_message(message.chat.id, "Цена договорная. Пишите в лс менеджеру.")
            return

        commission = rubles * commission_percentage / 100
        total_cost = rubles + commission
        advance_payment = euro_price * (1 + commission_percentage / 100)

        # Создаем изображение с информацией о цене
        image_path = create_price_image("€", total_cost, commission, commission_percentage, "Европа", euro)

        # Отправляем сообщение с информацией о цене и изображением
        final_message = f"Итоговая стоимость товаров: ~{total_cost} ₽\n\nИтоговая стоимость: {advance_payment} €\n\nСроки доставки:\n🇪🇺 1-7 дней по Европе\n🇷🇺 10-14 дней до вашей двери\n\nОформить заказ или задать любой интересующий вопрос: @VoltZakaz\n"
        bot.send_photo(message.chat.id, open(image_path, "rb"), caption=final_message)

        add_buttons(message)
    except ValueError:
        if message.text != "Назад":
            bot.send_message(message.chat.id, "Ошибка! Введите корректное количество товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)


def process_price_yuan1(message, quantity):
    try:
        prices = list(map(float, message.text.split(',')))
        yuan_price = sum(prices)

        total_china_delivery_cost = quantity * 15
        rubles = (((yuan_price * yuan) * 1.08) + total_china_delivery_cost * yuan) + (quantity * 50)
        rubles = round(rubles, 1)

        insurance = round((((yuan_price * yuan) * 1.08) * 0.03), 2)
        measurements = round((((yuan_price * yuan) * 1.08) * 0.05), 2)
        commission_percentage = 8
        commission = round((yuan_price * yuan * commission_percentage / 100), 2)

        # Создаем изображение с информацией о цене
        image_path = create_price_image("CNY", rubles, commission, commission_percentage, "Китай", yuan)

        # Отправляем сообщение с информацией о цене и изображением
        final_message = (f"Итоговая стоимость товаров: ~{rubles} ₽\n\nКурс при подсчете: 1 CNY - {yuan}\n\n"
                         "Сроки доставки:\n🇨🇳 Срок доставки по Китаю до нашего склада зависит от продавца (в среднем 3 дня с момента отправки.)\n"
                         "🇷🇺 До России (Москва) от склада в Китае:\n\t▫️Авто Express: (9-15 дней)\n\t▫️Обычное авто: (18-29 дней)\n\t▫️Авиа: (3-5 дней)\n\n"
                         f"Оплачивается сразу:\n{yuan_price} + {total_china_delivery_cost} ¥\nВАЖНО: Доставка по Китаю возможно будет иметь другую стоимость\n\n"
                         "Доставка Китай -> Россия оплачивается отдельно, только после приезда груза на склад в Китае.\n\n"
                         f"Расчет:\n▫️Страхование груза (3%): {insurance} ₽\n▫️Комиссия за выкуп и проверка товара на брак (5%): {measurements} ₽\n\n"
                         "Оформить заказ или задать любой интересующий вопрос: @VoltZakaz")
        bot.send_photo(message.chat.id, open(image_path, "rb"), caption=final_message)
        add_buttons(message)
    except ValueError:
        if message.text != "Назад":
            bot.send_message(message.chat.id, "Ошибка! Введите корректное количество товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)


# Обработчики для подсчета стоимости товаров в юанях
def process_price_yuan2(message, quantity):
    try:
        prices = list(map(float, message.text.split(',')))
        yuan_price = sum(prices)

        purchase_service = round(yuan_price * 1.05, 2)
        total_china_delivery_cost = quantity * 15
        rubles = (((yuan_price * yuan) * 1.13) + total_china_delivery_cost * yuan) + (quantity * 50)
        rubles = round(rubles, 2)

        insurance = round((rubles * 0.03), 2)  # Страхование груза (3%)
        measurements = round((rubles * 0.05), 2)  # Комиссия за выкуп и проверка товара на брак (5%)
        commission_percentage = 13
        commission = round((yuan_price * yuan * commission_percentage / 100), 2)

        # Создаем изображение с информацией о цене
        image_path = create_price_image("CNY", rubles, commission, commission_percentage, "Китай", yuan)

        # Отправляем сообщение с информацией о цене и изображением
        final_message = (f"Итоговая стоимость товаров: ~{rubles} ₽\n\nКурс юаня при подсчете: 1 CNY - {yuan}\n\n"
                         "Сроки доставки:\n🇨🇳 Срок доставки по Китаю до нашего склада зависит от продавца (в среднем 3 дня с момента отправки.)\n"
                         "🇷🇺 До России (Москва) от склада в Китае:\n\t ▫️Авто Express: (9-14 дней)\n\t ▫️Обычное авто: (18-29 дней)\n\t ▫️Авиа: (3-5 дней)\n\n"
                         f"Оплачивается сразу:\n{yuan_price} + {total_china_delivery_cost} ¥\nВАЖНО: Доставка по Китаю возможно будет иметь другую стоимость\n\n"
                         "▫️Доставка Китай -> Россия оплачивается отдельно, только после приезда груза на склад в Китае.\n\n"
                         f"Расчет:\n▫️Страхование груза (3%): {insurance} ₽\n▫️Комиссия за выкуп и проверка товара на брак (10%): {measurements + purchase_service} ₽\n\n"
                         "Оформить заказ или задать любой интересующий вопрос: @VoltZakaz")
        bot.send_photo(message.chat.id, open(image_path, "rb"), caption=final_message)
        add_buttons(message)
    except ValueError:
        if message.text != "Назад":
            bot.send_message(message.chat.id, "Ошибка! Введите корректное количество товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)


def process_price_yen(message, quantity):
    try:
        prices = list(map(float, message.text.split(',')))
        rubles = 0

        for i in range(len(prices)):
            advance_payment = ((prices[i] * 1.05) + 300)
            rubles += advance_payment * yen

        rubles = round(rubles, 2)
        commission_percentage = 5
        commission_cost = round((sum(prices) * 1.05 + 300 * len(prices)) * yen * 0.05, 2)

        # Создаем изображение с информацией о цене
        image_path = create_price_image("JPY", rubles, commission_cost, commission_percentage, "Япония", yen)

        # Отправляем сообщение с информацией о цене и изображением
        final_message = (f"Итоговая стоимость товаров: ~{rubles} ₽\n\nОплачивается сразу: {advance_payment} ¥\n\n"
                         f"Курс иена при подсчете: 1 JPY - {yen}\n\nСроки доставки:\n"
                         "🇯🇵 Внутри Японии: В среднем 1-3 дня\n"
                         "🇷🇺 До России (Ваш город): 12-20 дней (зависит от вашего города)\n\n"
                         "Оформить заказ или задать любой интересующий вопрос: @VoltZakaz\n")
        bot.send_photo(message.chat.id, open(image_path, "rb"), caption=final_message)
        add_buttons(message)
    except ValueError:
        if message.text != "Назад":
            bot.send_message(message.chat.id, "Ошибка! Введите корректное количество товаров и попробуйте еще раз!")
            time.sleep(0.4)
            return_to_main_menu(message)
        else:
            return_to_main_menu(message)

if __name__ == "__main__":
    bot.polling(none_stop=True)