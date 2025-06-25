import { useState, useEffect, useRef } from 'react';
import { useFireData } from '../context/FireDataContext';
import './Calendar.css';

const Calendar = () => {
  // Получаем данные и функции из контекста
  const { 
    currentDate, 
    changeMonth, 
    getFireDataByDays, 
    getWeatherDataByDays,
    getFireDataForDay,
    getWeatherDataForDay,
    isLoading,
    error 
  } = useFireData();
  
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [dayStatuses, setDayStatuses] = useState({});
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  
  // Реф для обработки кликов вне селектора даты
  const dateSelectorRef = useRef(null);
  const titleRef = useRef(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Создаем массив лет для выбора (текущий год и 10 лет назад/вперед)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push(i);
  }

  // Обновляем статусы дней при изменении данных о возгораниях
  useEffect(() => {
    updateDayStatuses();
  }, [currentDate]);
  
  // Обработчик кликов вне селектора даты
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDateSelector &&
        dateSelectorRef.current && 
        !dateSelectorRef.current.contains(event.target) &&
        titleRef.current &&
        !titleRef.current.contains(event.target)
      ) {
        setShowDateSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateSelector]);

  // Обновление статусов дней на основе данных о возгораниях
  const updateDayStatuses = () => {
    const fireDataByDay = getFireDataByDays();
    const statuses = {};
    
    // Для каждого дня определяем статус
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = fireDataByDay[day] || [];
      
      if (dayData.length > 0) {
        statuses[day] = getDayStatus(dayData);
      } else {
        // Если нет данных для дня, генерируем случайный статус
        statuses[day] = getRandomStatus(day);
      }
    }
    
    setDayStatuses(statuses);
  };

  // Получение приоритета статуса для определения наиболее важного
  const getStatusPriority = (status) => {
    const priorities = {
      'fire': 3,
      'risk': 2,
      'safe': 1
    };
    return priorities[status] || 0;
  };

  // Генерация случайных статусов для дней (для демонстрации)
  const getRandomStatuses = () => {
    const statuses = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      statuses[day] = getRandomStatus(day);
    }
    
    return statuses;
  };

  // Генерация случайного статуса для дня (для демонстрации)
  const getRandomStatus = (day, seed = null) => {
    const random = seed !== null ? seed : Math.random();
    
    // Большинство дней - безопасные
    if (random < 0.7) {
      return 'safe';
    }
    // Некоторые имеют риск возгорания
    else if (random < 0.9) {
      return 'risk';
    }
    // Очень редко - возгорания
    else {
      return 'fire';
    }
  };

  // Переход к предыдущему месяцу
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    changeMonth(prevMonth.getFullYear(), prevMonth.getMonth() + 1);
  };

  // Переход к следующему месяцу
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    changeMonth(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  };

  // Обработка клика по дню
  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  // Показать/скрыть селектор даты
  const toggleDateSelector = () => {
    setShowDateSelector(!showDateSelector);
  };

  // Обработка изменения месяца в селекторе
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    changeMonth(newDate.getFullYear(), newDate.getMonth() + 1);
  };
  
  // Обработка изменения года в селекторе
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    changeMonth(newDate.getFullYear(), newDate.getMonth() + 1);
  };

  // Тестирование подключения к API
  const testApiConnection = async () => {
    try {
      setApiTestResult({ status: 'loading', message: 'Тестирование подключения...' });
      
      // Получаем текущие год и месяц
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Проверяем основной адрес API
      const rootResult = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`);
      
      if (!rootResult.ok) {
        throw new Error(`Ошибка при подключении к API: ${rootResult.status} ${rootResult.statusText}`);
      }
      
      // Тестируем загрузку данных о возгораниях
      const fireResult = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/fires/month/${year}/${month}`);
      
      if (fireResult.ok) {
        const data = await fireResult.json();
        setApiTestResult({ 
          status: 'success', 
          message: `Подключение успешно. Получено ${data.length} записей о возгораниях.`,
          data: data
        });
      } else {
        throw new Error(`Ошибка API fires: ${fireResult.status} ${fireResult.statusText}`);
      }
    } catch (error) {
      console.error('Ошибка при тестировании API:', error);
      
      setApiTestResult({ 
        status: 'error', 
        message: `Ошибка при подключении к API: ${error.message}`,
        error: error
      });
    }
  };

  // Отрисовка дней календаря
  const renderCalendarDays = () => {
    const days = [];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    // Отображаем названия дней недели
    dayNames.forEach(name => {
      days.push(
        <div key={`header-${name}`} className="calendar-day-header">
          {name}
        </div>
      );
    });
    
    // Добавляем пустые ячейки для выравнивания первого дня месяца
    // В России неделя начинается с понедельника (1), а не с воскресенья (0)
    let firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Отображаем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const status = dayStatuses[day] || 'safe';
      const isSelected = day === selectedDay;
      
      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${status} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
        </div>
      );
    }
    
    return days;
  };

  // Получение данных о выбранном дне
  const getSelectedDayData = () => {
    // Получаем данные о возгораниях для выбранного дня
    const fireDataForDay = getFireDataForDay(selectedDay);
    
    if (!fireDataForDay || fireDataForDay.length === 0) {
      return (
        <div className="day-data-container empty">
          <p>Нет данных о возгораниях на этот день</p>
        </div>
      );
    }
    
    return (
      <div className="day-data-container">
        <h4>Данные о возгораниях</h4>
        {fireDataForDay.map((item, index) => (
          <div key={index} className={`fire-item ${item.status}`}>
            <div className="fire-header">
              <span className="fire-warehouse">{item.warehouse_name || `Склад №${item.warehouse_id}`}</span>
              <span className="fire-status">{getDayStatusText(item.status)}</span>
            </div>
            <div className="fire-details">
              <div className="fire-pile">Штабель: {item.pile_name || `№${item.pile_id}`}</div>
              {item.humidity && <div className="fire-humidity">Влажность: {item.humidity}%</div>}
              {item.wind_speed && <div className="fire-wind">Ветер: {item.wind_speed} м/с</div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Получение погодных данных для выбранного дня
  const getSelectedDayWeather = () => {
    // Получаем погодные данные для выбранного дня
    const weatherForDay = getWeatherDataForDay(selectedDay);
    
    if (!weatherForDay) {
      return (
        <div className="weather-data empty">
          <p>Нет погодных данных на этот день</p>
        </div>
      );
    }
    
    return (
      <div className="weather-data">
        <h4>Погодные условия</h4>
        <div className="weather-details">
          {weatherForDay.temperature && <div>Температура: {weatherForDay.temperature}°C</div>}
          {weatherForDay.humidity && <div>Влажность: {weatherForDay.humidity}%</div>}
          {weatherForDay.wind_speed && <div>Скорость ветра: {weatherForDay.wind_speed} м/с</div>}
          {weatherForDay.wind_direction && <div>Направление: {weatherForDay.wind_direction}°</div>}
          {weatherForDay.precipitation && <div>Осадки: {weatherForDay.precipitation} мм</div>}
        </div>
      </div>
    );
  };

  // Определение статуса для набора данных
  const getDayStatus = (dayData) => {
    if (!dayData || dayData.length === 0) {
      return 'safe';
    }
    
    // Находим самый опасный статус из всех данных за день
    let maxPriority = 0;
    let resultStatus = 'safe';
    
    dayData.forEach(item => {
      const priority = getStatusPriority(item.status);
      if (priority > maxPriority) {
        maxPriority = priority;
        resultStatus = item.status;
      }
    });
    
    return resultStatus;
  };

  // Получение текстового описания статуса
  const getDayStatusText = (status) => {
    switch (status) {
      case 'fire':
        return 'Возгорание';
      case 'risk':
        return 'Риск возгорания';
      case 'safe':
        return 'Безопасно';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 
          ref={titleRef}
          className="calendar-title" 
          onClick={toggleDateSelector}
        >
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          <svg 
            className={`calendar-dropdown-icon ${showDateSelector ? 'open' : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h2>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {showDateSelector && (
          <div ref={dateSelectorRef} className="date-selector">
            <div className="date-selector-field">
              <label>Месяц:</label>
              <select 
                value={currentDate.getMonth()} 
                onChange={handleMonthChange}
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index}>{name}</option>
                ))}
              </select>
            </div>
            <div className="date-selector-field">
              <label>Год:</label>
              <select 
                value={currentDate.getFullYear()} 
                onChange={handleYearChange}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="calendar-loading">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      ) : (
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      )}
      
      <div className="day-info">
        <h3>Информация на {selectedDay} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="test-api-btn" onClick={testApiConnection}>
              Проверить подключение к API
            </button>
          </div>
        ) : (
          <>
            {getSelectedDayData()}
            {getSelectedDayWeather()}
          </>
        )}
      </div>
      
      {apiTestResult && (
        <div className={`api-test-result ${apiTestResult.status}`}>
          <h4>Результат проверки API</h4>
          <p>{apiTestResult.message}</p>
          {apiTestResult.status === 'success' && (
            <p>Первые 3 записи: {JSON.stringify(apiTestResult.data.slice(0, 3))}</p>
          )}
          <button onClick={() => setApiTestResult(null)}>Закрыть</button>
        </div>
      )}
    </div>
  );
};

export default Calendar; 