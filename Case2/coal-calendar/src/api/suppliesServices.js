import apiClient from './client';

/**
 * Получение данных о поставках угля по дате
 * @param {Date} date - Дата, для которой нужны данные
 * @returns {Promise} Данные о поставках угля
 */
export const getSuppliesDataByDate = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    const response = await apiClient.get(`/api/supplies/date/${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных о поставках угля:', error);
    throw error;
  }
};

/**
 * Получение данных о поставках угля за месяц
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @returns {Promise} Данные о поставках угля за месяц
 */
export const getSuppliesDataByMonth = async (year, month) => {
  try {
    const response = await apiClient.get(`/api/supplies/month/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных о поставках угля за месяц:', error);
    throw error;
  }
};

/**
 * Получение данных о поставках угля для конкретного склада
 * @param {number} warehouseId - ID склада
 * @returns {Promise} Данные о поставках угля для указанного склада
 */
export const getSuppliesDataByWarehouse = async (warehouseId) => {
  try {
    const response = await apiClient.get(`/api/supplies/warehouse/${warehouseId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении данных о поставках для склада ${warehouseId}:`, error);
    throw error;
  }
}; 