/**
 * Сервис для работы с данными о складах и штабелях
 * В реальном приложении здесь будут запросы к API
 */

// Моковые данные для тестирования
const mockWarehouses = [
  { id: 1, name: 'Склад №1' },
  { id: 2, name: 'Склад №2' },
  { id: 3, name: 'Склад №3' },
  { id: 4, name: 'Склад №4' }
];

// Константа для обозначения опции "Все склады"
export const ALL_WAREHOUSES = {
  id: 'all',
  name: 'Все склады'
};

// Генерация случайных данных о штабелях для конкретного склада
const generateMockPiles = (warehouseId) => {
  const pileCount = 3 + Math.floor(Math.random() * 5); // от 3 до 7 штабелей
  return Array.from({ length: pileCount }, (_, index) => ({
    id: `${warehouseId}-${index + 1}`,
    name: `Штабель ${index + 1}`,
    warehouseId
  }));
};

/**
 * Получение списка всех складов
 * @returns {Promise} Промис, возвращающий список складов
 */
export const getWarehouses = () => {
  // Имитация задержки сетевого запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      // Добавляем опцию "Все склады" в начало списка
      resolve([ALL_WAREHOUSES, ...mockWarehouses]);
    }, 500);
  });
};

/**
 * Получение склада по ID
 * @param {number|string} id - ID склада
 * @returns {Promise} Промис, возвращающий данные склада
 */
export const getWarehouseById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === ALL_WAREHOUSES.id) {
        resolve(ALL_WAREHOUSES);
        return;
      }
      
      const warehouse = mockWarehouses.find(w => w.id === id);
      if (warehouse) {
        resolve(warehouse);
      } else {
        reject(new Error(`Склад с ID ${id} не найден`));
      }
    }, 300);
  });
};

/**
 * Получение списка штабелей для конкретного склада
 * @param {number|string} warehouseId - ID склада
 * @returns {Promise} Промис, возвращающий список штабелей
 */
export const getPilesByWarehouse = (warehouseId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Если запрошены все склады, возвращаем пустой массив,
      // так как выбор штабеля не требуется
      if (warehouseId === ALL_WAREHOUSES.id) {
        resolve([]);
        return;
      }
      
      resolve(generateMockPiles(warehouseId));
    }, 500);
  });
};

/**
 * Получение данных о штабеле по ID
 * @param {string} pileId - ID штабеля
 * @returns {Promise} Промис, возвращающий данные штабеля
 */
export const getPileById = (pileId) => {
  return new Promise((resolve, reject) => {
    // Извлекаем ID склада из ID штабеля (формат ID: `${warehouseId}-${index}`)
    const warehouseId = parseInt(pileId.split('-')[0]);
    
    setTimeout(() => {
      const piles = generateMockPiles(warehouseId);
      const pile = piles.find(p => p.id === pileId);
      
      if (pile) {
        resolve(pile);
      } else {
        reject(new Error(`Штабель с ID ${pileId} не найден`));
      }
    }, 300);
  });
};

/**
 * Получение статистики риска возгораний для указанного дня по всем складам
 * @param {Date} date - Дата, для которой запрашивается статистика
 * @returns {Promise} Промис, возвращающий статистику возгораний
 */
export const getFireRiskStatsByDate = (date) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Генерируем случайные данные о рисках возгорания для всех складов и штабелей
      const riskData = [];
      
      // Для каждого склада генерируем от 0 до 3 записей о возможных возгораниях
      mockWarehouses.forEach(warehouse => {
        // Для каждого склада определяем, сколько будет штабелей с риском
        const riskPilesCount = Math.floor(Math.random() * 4); // от 0 до 3 штабелей с риском
        
        if (riskPilesCount === 0) return; // Нет рисков для этого склада
        
        // Получаем все штабели склада
        const piles = generateMockPiles(warehouse.id);
        
        // Случайным образом выбираем штабели для рисков
        const selectedPiles = [];
        while (selectedPiles.length < riskPilesCount && selectedPiles.length < piles.length) {
          const randomIndex = Math.floor(Math.random() * piles.length);
          const pile = piles[randomIndex];
          
          // Добавляем только если этого штабеля еще нет в списке
          if (!selectedPiles.some(p => p.id === pile.id)) {
            selectedPiles.push(pile);
          }
        }
        
        // Добавляем записи о рисках для выбранных штабелей
        selectedPiles.forEach(pile => {
          const riskLevel = Math.random();
          let status;
          
          if (riskLevel < 0.3) {
            status = 'fire'; // 30% вероятность фактического пожара
          } else if (riskLevel < 0.7) {
            status = 'risk'; // 40% вероятность риска
          } else {
            status = 'safe'; // 30% вероятность безопасности
          }
          
          riskData.push({
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            pileId: pile.id,
            pileName: pile.name,
            status,
            temperature: Math.floor(Math.random() * 20) + 15, // Температура от 15 до 35 градусов
            humidity: Math.floor(Math.random() * 50) + 30, // Влажность от 30% до 80%
            windSpeed: Math.floor(Math.random() * 10) + 2 // Скорость ветра от 2 до 12 м/с
          });
        });
      });
      
      resolve(riskData);
    }, 600);
  });
}; 