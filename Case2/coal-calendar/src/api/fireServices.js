import apiClient from './client';
import { API_ENDPOINTS } from './fastapi-config';

/**
 * Получение данных о возгораниях по дате
 * @param {Date} date - Дата, для которой нужны данные
 * @returns {Promise} Данные о возгораниях
 */
export const getFireDataByDate = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    const response = await apiClient.get(`${API_ENDPOINTS.FIRES_BY_DATE}/${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных о возгораниях:', error);
    throw error;
  }
};

/**
 * Получение данных о возгораниях за месяц
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @returns {Promise} Данные о возгораниях за месяц
 */
export const getFireDataByMonth = async (year, month) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.FIRES_BY_MONTH}/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных о возгораниях за месяц:', error);
    throw error;
  }
};

/**
 * Получение всех данных о возгораниях для конкретного склада
 * @param {number} warehouseId - ID склада
 * @returns {Promise} Данные о возгораниях для указанного склада
 */
export const getFireDataByWarehouse = async (warehouseId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.FIRES_BY_WAREHOUSE}/${warehouseId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении данных о возгораниях для склада ${warehouseId}:`, error);
    throw error;
  }
}; 