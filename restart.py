import os
import time

# Получаем путь к текущей директории, где находится скрипт мониторинга
current_directory = os.path.dirname(os.path.abspath(__file__))

# Путь к файлу с кодом бота (предполагается, что он находится в той же директории)
bot_file_path = os.path.join(current_directory, "tests.py")

# Функция для запуска бота
def run_bot():
    os.system(f"python {bot_file_path}")

# Функция для мониторинга изменений в файле с кодом бота
def monitor_bot_file():
    # Сохраняем время последнего изменения файла с кодом бота
    last_modified_time = os.path.getmtime(bot_file_path)
    
    while True:
        # Проверяем, изменился ли файл с кодом бота
        current_modified_time = os.path.getmtime(bot_file_path)
        if current_modified_time != last_modified_time:
            # Останавливаем текущий экземпляр бота
            os.system("pkill -f 'python ваш_файл_бота.py'")
            
            # Запускаем новый экземпляр бота
            run_bot()
            
            # Обновляем время последнего изменения файла
            last_modified_time = current_modified_time
        
        # Ждем некоторое время перед следующей проверкой (например, 1 минуту)
        time.sleep(60)

# Запускаем мониторинг изменений в файле с кодом бота
if __name__ == "__main__":
    monitor_bot_file()
