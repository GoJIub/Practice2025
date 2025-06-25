import apiClient from './client';

/**
 * Получение данных о температуре угля по дате
 * @param {Date} date - Дата, для которой нужны данные
 * @returns {Promise} Данные о температуре угля
 */
export const getTemperatureDataByDate = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    const response = await apiClient.get(`/api/temperatures/date/${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных о температуре угля:', error);
    throw error;
  }
};

/**
 * Получение данных о температуре угля для конкретного склада
 * @param {number} warehouseId - ID склада
 * @param {Date} date - Дата для выборки (опционально)
 * @returns {Promise} Данные о температуре угля для указанного склада
 */
export const getTemperatureDataByWarehouse = async (warehouseId, date = null) => {
  try {
    let url = `/api/temperatures/warehouse/${warehouseId}`;
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      url += `?date=${formattedDate}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении данных о температуре для склада ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Получение данных о температуре угля для конкретного штабеля
 * @param {number} warehouseId - ID склада
 * @param {number} pileId - ID штабеля
 * @param {Date} date - Дата для выборки (опционально)
 * @returns {Promise} Данные о температуре угля для указанного штабеля
 */
export const getTemperatureDataByPile = async (warehouseId, pileId, date = null) => {
  try {
    let url = `/api/temperatures/warehouse/${warehouseId}/pile/${pileId}`;
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      url += `?date=${formattedDate}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении данных о температуре для штабеля ${pileId}:`, error);
    throw error;
  }
}; 