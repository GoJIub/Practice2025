import axios from 'axios';
import { API_BASE_URL } from './fastapi-config';

// Создаем инстанс axios с базовыми настройками
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Обработчик ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient; 