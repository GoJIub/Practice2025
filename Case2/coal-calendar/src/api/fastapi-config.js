/**
 * Конфигурация для работы с FastAPI бэкендом
 * Здесь хранятся настройки и URL-адреса для подключения к API
 */

// Базовый URL для API (меняем на локальный сервер для разработки)
export const API_BASE_URL = 'http://localhost:8000';

// PostgreSQL строка подключения (используется только на бэкенде)
export const POSTGRES_CONNECTION_STRING = 'postgresql://postgres:ZEcOwNDTbOQDjLHchZKyhEOeEOfnEcFW@switchyard.proxy.rlwy.net:44380/railway';

// Пути API (без префикса /api, так как в FastAPI мы не использовали такой префикс)
export const API_ENDPOINTS = {
  // Возгорания
  FIRES: '/fires',
  FIRES_BY_DATE: '/fires/date', // + /{date}
  FIRES_BY_MONTH: '/fires/month', // + /{year}/{month}
  FIRES_BY_WAREHOUSE: '/fires/warehouse', // + /{warehouseId}
  
  // Температура угля
  TEMPERATURES: '/temperatures',
  TEMPERATURES_BY_DATE: '/temperatures/date', // + /{date}
  TEMPERATURES_BY_WAREHOUSE: '/temperatures/warehouse', // + /{warehouseId}
  TEMPERATURES_BY_PILE: '/temperatures/warehouse', // + /{warehouseId}/pile/{pileId}
  TEMPERATURES_BY_PICKET: '/temperatures/warehouse', // + /{warehouseId}/pile/{pileId}/picket/{picketId}
  
  // Погода
  WEATHER: '/weather',
  WEATHER_BY_DATE: '/weather/date', // + /{date}
  WEATHER_BY_MONTH: '/weather/month', // + /{year}/{month}
  WEATHER_BY_RANGE: '/weather/range', // + ?start={startDate}&end={endDate}
  
  // Поставки угля
  SUPPLIES: '/supplies',
  SUPPLIES_BY_DATE: '/supplies/date', // + /{date}
  SUPPLIES_BY_MONTH: '/supplies/month', // + /{year}/{month}
  SUPPLIES_BY_WAREHOUSE: '/supplies/warehouse', // + /{warehouseId}
  
  // Склады и штабели
  WAREHOUSES: '/warehouses',
  WAREHOUSE_BY_ID: '/warehouses', // + /{warehouseId}
  PILES_BY_WAREHOUSE: '/warehouses', // + /{warehouseId}/piles
  PILE_BY_ID: '/warehouses', // + /{warehouseId}/piles/{pileId}
  PICKETS_BY_PILE: '/warehouses', // + /{warehouseId}/piles/{pileId}/pickets
};

// Форматы даты
export const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD', // Формат даты для API
  DISPLAY_DATE: 'DD.MM.YYYY', // Формат для отображения
};

// Параметры для запросов
export const API_PARAMS = {
  DEFAULT_LIMIT: 100, // Лимит по умолчанию для пагинации
  MAX_LIMIT: 1000, // Максимальный лимит для пагинации
}; 