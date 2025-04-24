function addItem() {
    const container = document.getElementById('items-container');
    const newItem = document.createElement('div');
    newItem.className = 'item';
    newItem.innerHTML = `
        <hr>
        <label for="item-photo">Фото товара:</label>
        <input type="file" class="form-control-file item-photo" accept="image/*" required>
        <br>
        <label for="item-color">Цвет:</label>
        <input type="text" class="form-control item-color" required>
        <br>
        <label for="item-size">Размер:</label>
        <input type="text" class="form-control item-size" required>
        <br>
    `;
    container.appendChild(newItem);
}

function submitOrder() {
    const items = [];
    const itemsContainer = document.getElementById('items-container').querySelectorAll('.item');
    let isValid = true;

    itemsContainer.forEach(item => {
        const photoInput = item.querySelector('.item-photo');
        const colorInput = item.querySelector('.item-color');
        const sizeInput = item.querySelector('.item-size');

        if (!photoInput.files.length || !colorInput.value.trim() || !sizeInput.value.trim()) {
            isValid = false;
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(photoInput.files[0]);
        reader.onload = () => {
            items.push({
                photo: reader.result.split(',')[1], // Base64-encoded image
                color: colorInput.value,
                size: sizeInput.value
            });

            // Если это последний элемент, отправляем данные
            if (items.length === itemsContainer.length) {
                sendOrderData(items);
            }
        };
    });

    if (!isValid) {
        alert('Пожалуйста, заполните все поля для каждого товара.');
    }
}

function sendOrderData(items) {
    const fullName = document.getElementById('full-name').value.trim();
    const telegramUsername = document.getElementById('telegram-username').value.trim();

    if (!fullName || !telegramUsername) {
        alert('Пожалуйста, укажите ваше ФИО и юзернейм в Telegram.');
        return;
    }

    const requestData = {
        command: 'create_order',
        full_name: fullName,
        telegram_username: telegramUsername,
        items: items
    };

    tg.sendData(JSON.stringify(requestData));
}