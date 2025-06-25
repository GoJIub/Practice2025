import apiClient from './client';
import { API_ENDPOINTS } from './fastapi-config';

/**
 * Получение списка всех складов
 * @returns {Promise} Список всех складов
 */
export const getWarehouseList = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.WAREHOUSES);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка складов:', error);
    throw error;
  }
};

/**
 * Получение информации о конкретном складе
 * @param {number} warehouseId - ID склада
 * @returns {Promise} Информация о складе
 */
export const getWarehouseById = async (warehouseId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.WAREHOUSE_BY_ID}/${warehouseId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении информации о складе ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Получение списка штабелей для конкретного склада
 * @param {number} warehouseId - ID склада
 * @returns {Promise} Список штабелей
 */
export const getPilesByWarehouse = async (warehouseId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.PILES_BY_WAREHOUSE}/${warehouseId}/piles`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении списка штабелей для склада ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Получение информации о конкретном штабеле
 * @param {number} warehouseId - ID склада
 * @param {number} pileId - ID штабеля
 * @returns {Promise} Информация о штабеле
 */
export const getPileById = async (warehouseId, pileId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.PILE_BY_ID}/${warehouseId}/piles/${pileId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении информации о штабеле ${pileId} в складе ${warehouseId}:`, error);
    throw error;
  }
};

/**
 * Получение списка пикетов для конкретного штабеля
 * @param {number} warehouseId - ID склада
 * @param {number} pileId - ID штабеля
 * @returns {Promise} Список пикетов
 */
export const getPicketsByPile = async (warehouseId, pileId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.PICKETS_BY_PILE}/${warehouseId}/piles/${pileId}/pickets`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении списка пикетов для штабеля ${pileId} в складе ${warehouseId}:`, error);
    throw error;
  }
}; 