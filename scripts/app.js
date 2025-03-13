//---------Работа с картой---------
ymaps.ready(init);
function init() {
    var myMap = new ymaps.Map("map", {
        center: [55.76, 37.64], // Центр карты (Москва)
        zoom: 10,
        controls: []
    });

    // Данные об аварийных зданиях
    var buildings = [
        { coordinates: [55.7558, 37.6173], name: "Здание 1", repairCost: "100 000 руб." },
        { coordinates: [55.7558, 37.6179], name: "Здание 2", repairCost: "120 000 руб." },
        { coordinates: [55.7558, 37.6154], name: "Здание 3", repairCost: "400 000 руб." },
        { coordinates: [55.7558, 37.6136], name: "Здание 4", repairCost: "800 000 руб." },
        { coordinates: [55.7558, 37.6137], name: "Здание 5", repairCost: "800 000 руб." },
        { coordinates: [55.7558, 37.6138], name: "Здание 6", repairCost: "800 000 руб." },
        { coordinates: [55.7558, 37.6139], name: "Здание 7", repairCost: "800 000 руб." },
        { coordinates: [55.7415, 37.6156], name: "Здание 8", repairCost: "150 000 руб." },
        { coordinates: [55.7580, 37.6300], name: "Здание 9", repairCost: "200 000 руб." },
        { coordinates: [55.7580, 37.6301], name: "Здание 10", repairCost: "180 000 руб." },
        { coordinates: [55.7480, 37.6301], name: "Здание 11", repairCost: "180 000 руб." },
        { coordinates: [55.7480, 37.6303], name: "Здание 12", repairCost: "15 000 руб." },
    ];

    // Группировка для тепловой карты
    var groups = {};
    buildings.forEach(building => {
        var key = building.coordinates.join(',');
        if (!groups[key]) {
            groups[key] = 1;
        } else {
            groups[key]++;
        }
    });

    // Данные для тепловой карты
    var data = {
        type: 'FeatureCollection',
        features: []
    };
    for (var key in groups) {
        var count = groups[key];
        var weight = Math.min(count, 3); // Ограничиваем вес до 3
        var coordinates = key.split(',').map(Number);
        data.features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coordinates },
            properties: { weight: weight }
        });
    }

    // Нормализация весов
    var maxWeight = 3;
    data.features.forEach(feature => {
        feature.properties.weight = feature.properties.weight / maxWeight;
    });

    // Градиент для тепловой карты
    var gradient = {
        0.0: 'rgba(0, 255, 0, 0.7)',   // Зелёный
        0.3: 'rgba(255, 255, 0, 0.7)', // Жёлтый
        0.6: 'rgba(255, 0, 0, 1)'    // Красный
    };

    // Создание тепловой карты
    ymaps.modules.require(['Heatmap'], function (Heatmap) {
        var heatmap = new Heatmap(data, {
            gradient: gradient,
            dissipating: false
        });
        heatmap.setMap(myMap);
        heatmap.options.set('radius', 50); // Радиус тепловых зон
    });

    // Добавление маркеров для каждого здания
    buildings.forEach(building => {
        var placemark = new ymaps.Placemark(building.coordinates, {
            balloonContent: `<strong>${building.name}</strong><br>Стоимость ремонта: ${building.repairCost}`
        }, {
            preset: 'islands#icon', // Стандартный значок
            iconColor: '#0095b6'    // Цвет значка
        });
        myMap.geoObjects.add(placemark);
    });

    // Функционал скрытия/открытия правого блока
    document.querySelector('.toggle-btn').addEventListener('click', function() {
        var leftPanel = document.querySelector('.left-panel');
        let imgChevron = document.querySelector('.toggle-btn .img-chevron');
        console.log(imgChevron.src);
        leftPanel.classList.toggle('hidden');
        leftPanel.classList.contains('hidden') ? imgChevron.setAttribute("src", "/assets/chevron_right.svg") : imgChevron.setAttribute("src", "/assets/chevron_left.svg");
    });

    // Функция управления масштабом карты
    function zoomControl() {
        const zoomInButton = document.getElementById('map-button-zoom-in');
        const zoomOutButton = document.getElementById('map-button-zoom-out');
        //Увеличение масштаба
        zoomInButton.addEventListener('click', function() {
            const currentZoom = myMap.getZoom();
            if (currentZoom < 21) myMap.setZoom(currentZoom + 1, { duration: 300 });
        });
        //Уменьшение масштаба
        zoomOutButton.addEventListener('click', function() {
            const currentZoom = myMap.getZoom();
            if (currentZoom > 0) myMap.setZoom(currentZoom - 1, { duration: 300 });
        });
    }

    // Функция переключения слоев карты
    function layerControl() {
        const layersButton = document.getElementById('map-button-layers');
        const layerTypes = [
            'yandex#map',      // Стандартный слой (карта)
            'yandex#satellite', // Спутниковый слой
            'yandex#hybrid'    // Гибридный слой (спутник + подписи)
        ];
        let currentLayerIndex = 0; // Индекс текущего слоя

        layersButton.addEventListener('click', function() {
            // Переключаем индекс слоя
            currentLayerIndex = (currentLayerIndex + 1) % layerTypes.length;

            // Устанавливаем новый слой карты
            myMap.setType(layerTypes[currentLayerIndex]);
        });
    }

    function  Select() {
        let selectHeader = document.querySelectorAll('.select__header');
        let selectItem = document.querySelectorAll('.select__item');

        selectHeader.forEach(item => {
            item.addEventListener('click', selectToggle)
        });

        selectItem.forEach(item => {
            item.addEventListener('click', selectChoose)
        });

        document.addEventListener('click', function(event) {
            let dropdown = document.querySelector('.select.is-active');
            if (dropdown && !dropdown.contains(event.target)) {
                dropdown.classList.remove('is-active');
            }
        });

        function selectToggle() {
            this.parentElement.classList.toggle('is-active');
        }

        function selectChoose() {
            let text = this.innerText,
                select = this.closest('.select'),
                currentText = select.querySelector('.select__current');
            currentText.innerText = text;
            select.classList.remove('is-active');
            select.classList.add('is-chosen');
        }

    }
    let select = document.querySelector('.select');
    Select();
    zoomControl();
    layerControl();
}



