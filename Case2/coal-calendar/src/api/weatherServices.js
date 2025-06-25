import apiClient from './client';
import { API_ENDPOINTS } from './fastapi-config';

/**
 * Получение всех погодных данных
 * @returns {Promise} Список всех погодных данных
 */
export const getAllWeatherData = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.WEATHER);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении погодных данных:', error);
    throw error;
  }
};

/**
 * Получение погодных данных за конкретную дату
 * @param {Date} date - Дата, для которой нужны погодные данные
 * @returns {Promise} Погодные данные на указанную дату
 */
export const getWeatherDataByDate = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    const response = await apiClient.get(`${API_ENDPOINTS.WEATHER_BY_DATE}/${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении погодных данных по дате:', error);
    throw error;
  }
};

/**
 * Получение погодных данных за указанный месяц
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @returns {Promise} Погодные данные за указанный месяц
 */
export const getWeatherDataByMonth = async (year, month) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.WEATHER_BY_MONTH}/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении погодных данных за месяц:', error);
    throw error;
  }
};

/**
 * Получение погодных данных за период
 * @param {Date} startDate - Начальная дата периода
 * @param {Date} endDate - Конечная дата периода
 * @returns {Promise} Погодные данные за указанный период
 */
export const getWeatherDataByRange = async (startDate, endDate) => {
  try {
    const formattedStartDate = startDate.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    const formattedEndDate = endDate.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    
    const response = await apiClient.get(`${API_ENDPOINTS.WEATHER_BY_RANGE}?start=${formattedStartDate}&end=${formattedEndDate}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении погодных данных за период:', error);
    throw error;
  }
}; 