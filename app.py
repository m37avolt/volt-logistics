from flask import Flask, send_from_directory

app = Flask(__name__)

# Раздача статических файлов
@app.route('/')
def serve_miniapp():
    return send_from_directory('static', 'miniapp.html')  # Заменяем 'index.html' на 'miniapp.html'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)