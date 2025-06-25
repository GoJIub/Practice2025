import { createContext, useState, useContext, useEffect } from 'react';
import { getFireDataByMonth, getWeatherDataByMonth, getWarehouseList } from '../api';

// Создаем контекст для данных о возгораниях
const FireDataContext = createContext();

// Поставщик контекста
export const FireDataProvider = ({ children }) => {
  const [fireData, setFireData] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Функция для загрузки данных о возгораниях за текущий месяц
  const fetchFireData = async (year, month) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fires = await getFireDataByMonth(year, month);
      setFireData(fires);
      return fires;
    } catch (err) {
      console.error('Ошибка при загрузке данных о возгораниях:', err);
      setError('Не удалось загрузить данные о возгораниях');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для загрузки погодных данных за текущий месяц
  const fetchWeatherData = async (year, month) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const weather = await getWeatherDataByMonth(year, month);
      setWeatherData(weather);
      return weather;
    } catch (err) {
      console.error('Ошибка при загрузке погодных данных:', err);
      setError('Не удалось загрузить погодные данные');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для загрузки данных о складах
  const fetchWarehouseData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const warehouses = await getWarehouseList();
      setWarehouseData(warehouses);
      return warehouses;
    } catch (err) {
      console.error('Ошибка при загрузке данных о складах:', err);
      setError('Не удалось загрузить данные о складах');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для изменения текущего месяца и загрузки новых данных
  const changeMonth = async (year, month) => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    
    try {
      // Запускаем загрузку данных при изменении месяца
      await Promise.all([
        fetchFireData(year, month),
        fetchWeatherData(year, month)
      ]);
    } catch (err) {
      console.error('Ошибка при изменении месяца:', err);
    }
  };
  
  // Функция для получения данных о возгораниях для конкретного дня
  const getFireDataForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    
    return fireData.filter(item => item.date === dateString);
  };
  
  // Функция для получения погодных данных для конкретного дня
  const getWeatherDataForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    
    return weatherData.find(item => item.date === dateString);
  };
  
  // Группировка данных о возгораниях по дням
  const getFireDataByDays = () => {
    const dataByDay = {};
    
    fireData.forEach(item => {
      const date = new Date(item.date);
      const day = date.getDate();
      
      if (!dataByDay[day]) {
        dataByDay[day] = [];
      }
      
      dataByDay[day].push(item);
    });
    
    return dataByDay;
  };
  
  // Группировка погодных данных по дням
  const getWeatherDataByDays = () => {
    const dataByDay = {};
    
    weatherData.forEach(item => {
      const date = new Date(item.date);
      const day = date.getDate();
      
      dataByDay[day] = item;
    });
    
    return dataByDay;
  };
  
  // Загружаем данные о складах при первой загрузке
  useEffect(() => {
    fetchWarehouseData();
  }, []);
  
  // Загружаем данные при изменении текущего месяца
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // API ожидает месяц от 1 до 12
    
    fetchFireData(year, month);
    fetchWeatherData(year, month);
  }, [currentDate]);
  
  const contextValue = {
    fireData,
    weatherData,
    warehouseData,
    isLoading,
    error,
    currentDate,
    changeMonth,
    getFireDataForDay,
    getWeatherDataForDay,
    getFireDataByDays,
    getWeatherDataByDays,
    fetchFireData,
    fetchWeatherData,
    fetchWarehouseData
  };
  
  return (
    <FireDataContext.Provider value={contextValue}>
      {children}
    </FireDataContext.Provider>
  );
};

// Хук для использования контекста в компонентах
export const useFireData = () => {
  const context = useContext(FireDataContext);
  if (!context) {
    throw new Error('useFireData должен использоваться внутри FireDataProvider');
  }
  return context;
};

export default FireDataContext; 