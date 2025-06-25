import { useState, useEffect } from 'react';
import { useFireData } from './context/FireDataContext';
import sunIcon from './assets/sun.svg';
import moonIcon from './assets/moon.svg';
import glowbyteLogo from './assets/glowbyte.svg';
import Calendar from './components/Calendar';
import Map from './components/Map';
import WarehouseSelector from './components/WarehouseSelector';
import './index.css';

const instructionMd = `- **Интерфейс**:
  - Шапка: "Добавить", переключение темы (солнце/луна).
  - Боковая панель: Карта, роза ветров, статистика.
  - Основное: Календарь (красный — возгорание, зелёный — нет, жёлтый — риск).
  - Подвал: Контакты, "О нас", инструкция.
- **Функции**:
  1. **Добавить данные**: "Добавить" → файлы/ввод → подтвердить.
  2. **Календарь**: Стрелки для месяцев, клик на день для инфо.
  3. **Дополнительные функции**: Переключение через боковую панель.`;

function App() {
  const { isLoading, error } = useFireData();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'map', 'wind' или 'stats'
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const qrCodes = [
    { 
      src: 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/SugarZhenia', 
      caption: 'Евгений\nФуллстек' 
    },
    { 
      src: 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/Girday', 
      caption: 'Максим\nФронтендер' 
    },
    { 
      src: 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/KR4K6', 
      caption: 'Андрей\nАналитик' 
    },
    { 
      src: 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/hxllmvdx', 
      caption: 'Матвей\nML-специалист' 
    },
    { 
      src: 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/tayaKU21', 
      caption: 'Тая\nБэкендер' 
    },
  ];

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest('.footer-nav-item')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    if (!isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMenu = (menuName) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const togglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrorMessage('Пожалуйста, выберите файл в формате CSV');
      setSelectedFile(null);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
  };

  const uploadFile = () => {
    if (!selectedFile) return;
    console.log('Загрузка файла:', selectedFile.name);
    setShowUploadModal(false);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log('Выбранное местоположение:', location);
  };

  return (
    <div className="main-wrapper">
      <header className="main-header">
        <h1 className="main-title">Прогноз возгораний</h1>
        <div className="header-actions">
          <button className="header-btn" onClick={() => setShowUploadModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Добавить
          </button>
          <button className="header-btn theme-toggle" onClick={toggleTheme}>
            <img src={isDarkTheme ? sunIcon : moonIcon} alt="Тема" width="30" height="30" />
          </button>
      </div>
      </header>

      <main className="main-content">
        <div className={`center-area ${activePanel ? 'has-side-panel' : ''}`}>
          <div className="side-buttons-mockup">
            <button 
              className={`side-btn-mockup ${activePanel === 'map' ? 'active' : ''}`}
              onClick={() => togglePanel('map')}
            >
              <svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M58.3252 0.416035C58.5363 0.589111 58.7063 0.806906 58.823 1.0537C58.9397 1.30048 59.0002 1.57011 59 1.8431V53.4681C58.9997 53.8942 58.8519 54.307 58.5817 54.6364C58.3114 54.9658 57.9354 55.1915 57.5176 55.275L39.0801 58.9625C38.8416 59.0102 38.5959 59.0102 38.3574 58.9625L20.2812 55.3487L2.20512 58.9625C1.93774 59.0159 1.66183 59.0094 1.39727 58.9434C1.13271 58.8773 0.886091 58.7534 0.675179 58.5806C0.464266 58.4078 0.294312 58.1903 0.17756 57.9439C0.0608075 57.6975 0.000164657 57.4283 0 57.1556L0 5.5306C0.000257321 5.10452 0.148076 4.69168 0.418323 4.36228C0.688569 4.03287 1.06456 3.80723 1.48238 3.72372L19.9199 0.0362227C20.1584 -0.0114594 20.4041 -0.0114594 20.6426 0.0362227L38.7188 3.64997L56.7949 0.0362227C57.0622 -0.0175565 57.3381 -0.0113854 57.6027 0.0542914C57.8673 0.119968 58.1141 0.243516 58.3252 0.416035ZM36.875 7.04247L22.125 4.09247V51.9562L36.875 54.9062V7.04247ZM40.5625 54.9062L55.3125 51.9562V4.09247L40.5625 7.04247V54.9062ZM18.4375 51.9562V4.09247L3.6875 7.04247V54.9062L18.4375 51.9562Z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              className={`side-btn-mockup ${activePanel === 'warehouse' ? 'active' : ''}`}
              onClick={() => togglePanel('warehouse')}
            >
              <svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M53.1 58.42H5.9C2.65 58.42 0 55.77 0 52.52V21.27C0 19.42 0.95 17.72 2.5 16.77L25.6 2.53C28.25 0.97 31.65 0.97 34.35 2.53L57.4 16.77C58.95 17.72 59.9 19.42 59.9 21.27V52.52C59.9 55.77 57.25 58.42 54 58.42H53.1Z" fill="currentColor"/>
                <path d="M45.14 27.17H14.76C13.2 27.17 11.96 28.42 11.96 29.97V58.42H47.99V29.97C47.94 28.42 46.69 27.17 45.14 27.17Z" fill="white" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.36 37.47V58.42" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M29.9 37.47V58.42" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M39.54 37.47V58.42" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`side-btn-mockup ${activePanel === 'stats' ? 'active' : ''}`}
              onClick={() => togglePanel('stats')}
            >
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 0H3.625V54.375H58V58H0V0ZM53.7116 11.2846C53.896 11.4355 54.0488 11.6211 54.1613 11.8311C54.2738 12.041 54.3439 12.271 54.3674 12.508C54.391 12.745 54.3676 12.9844 54.2986 13.2123C54.2296 13.4403 54.1164 13.6524 53.9654 13.8366L37.6529 33.7741C37.4925 33.9698 37.293 34.1298 37.0671 34.2437C36.8413 34.3577 36.594 34.4231 36.3414 34.4357C36.0887 34.4483 35.8362 34.4079 35.6 34.3171C35.3639 34.2262 35.1494 34.087 34.9704 33.9082L25.5925 24.5304L12.3395 42.7533C12.0496 43.1219 11.6281 43.3638 11.1635 43.4282C10.6989 43.4925 10.2275 43.3743 9.8483 43.0983C9.46908 42.8224 9.2116 42.4102 9.12996 41.9483C9.04832 41.4865 9.14888 41.011 9.4105 40.6217L23.9105 20.6842C24.0644 20.4722 24.2624 20.2961 24.491 20.168C24.7195 20.0399 24.9731 19.9629 25.2342 19.9422C25.4954 19.9215 25.758 19.9577 26.0038 20.0483C26.2496 20.1388 26.4729 20.2816 26.6583 20.4667L36.1159 29.928L51.1596 11.5384C51.3105 11.354 51.4961 11.2012 51.7061 11.0887C51.916 10.9762 52.146 10.9061 52.383 10.8826C52.62 10.859 52.8594 10.8824 53.0873 10.9514C53.3153 11.0204 53.5275 11.1336 53.7116 11.2846Z" fill="currentColor"/>
                </g>
              </svg>
        </button>
          </div>
          <div className={`center-window ${activePanel ? 'with-side-panel' : ''}`}>
            <Calendar />
          </div>
          {activePanel && (
            <div className="side-panel">
              {activePanel === 'map' && (
                <div className="map-container">
                  <h3>Карта возгораний</h3>
                  <Map />
                </div>
              )}
              {activePanel === 'warehouse' && (
                <div className="warehouse-selector-container">
                  <h3>Выбор местоположения</h3>
                  <WarehouseSelector onSelectComplete={handleLocationSelect} />
                </div>
              )}
              {activePanel === 'stats' && (
                <div className="stats-container">
                  <h3>Статистика возгораний</h3>
                  <div className="stats-content">
                    {isLoading ? (
                      <div className="loading-indicator">Загрузка статистики...</div>
                    ) : error ? (
                      <div className="error-message">{error}</div>
                    ) : (
                      <div className="stats-summary">
                        <div className="stat-item fire">
                          <div className="stat-title">Возгорания</div>
                          <div className="stat-value">3</div>
                        </div>
                        <div className="stat-item risk">
                          <div className="stat-title">Риски</div>
                          <div className="stat-value">8</div>
                        </div>
                        <div className="stat-item safe">
                          <div className="stat-title">Безопасно</div>
                          <div className="stat-value">19</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-nav">
            <div 
              className={`footer-nav-item ${activeMenu === 'contacts' ? 'active' : ''}`}
              onClick={() => toggleMenu('contacts')}
            >
              Контакты
              {activeMenu === 'contacts' && (
                <div className="footer-dropdown contacts-dropdown">
                  <div className="qr-codes">
                    {qrCodes.map((qr, index) => (
                      <div key={index} className="qr-code-item">
                        <img src={qr.src} alt={`QR код ${index + 1}`} className="qr-code" />
                        <div className="qr-caption">{qr.caption}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div 
              className={`footer-nav-item ${activeMenu === 'about' ? 'active' : ''}`}
              onClick={() => toggleMenu('about')}
            >
              О нас
              {activeMenu === 'about' && (
                <div className="footer-dropdown about-dropdown">
                  <div className="about-content">
                    <img src={glowbyteLogo} alt="Glowbyte Logo" className="about-logo" />
                    <p>
                      Проект разработан командой Glowbyte для хакатона "Лидеры цифровой трансформации 2023".
                      Наше решение предоставляет инструмент для мониторинга и прогнозирования возгораний на угольных складах.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div 
              className={`footer-nav-item ${activeMenu === 'instruction' ? 'active' : ''}`}
              onClick={() => toggleMenu('instruction')}
            >
              Инструкция
              {activeMenu === 'instruction' && (
                <div className="footer-dropdown instruction-dropdown">
                  <div className="instruction-content">
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(instructionMd) }} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="footer-copyright">
            &copy; 2023 Coal Calendar. Все права защищены.
          </div>
        </div>
      </footer>

      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal upload-modal">
            <h2>Загрузка данных</h2>
            <div 
              className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="file-upload-content">
                {selectedFile ? (
                  <div className="selected-file">
                    <div className="file-icon">📄</div>
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Перетащите файл CSV сюда или</p>
                    <label className="file-selector-label">
                      Выберите файл
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
            
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowUploadModal(false)}
              >
                Отмена
              </button>
              <button 
                className="modal-btn upload"
                disabled={!selectedFile}
                onClick={uploadFile}
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
