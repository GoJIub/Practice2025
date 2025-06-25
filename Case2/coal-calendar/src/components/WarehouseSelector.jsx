import React, { useState, useEffect } from 'react';
import { useFireData } from '../context/FireDataContext';
import './WarehouseSelector.css';

// Константа для опции "Все склады"
const ALL_WAREHOUSES = { id: -1, name: 'Все склады' };

const WarehouseSelector = ({ onSelectComplete }) => {
  const { warehouseData, isLoading, error, fetchWarehouseData } = useFireData();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [piles, setPiles] = useState([]);
  const [selectedPile, setSelectedPile] = useState(null);

  // Загрузка списка складов при монтировании компонента
  useEffect(() => {
    fetchWarehouseData();
  }, []);

  // Обновление списка складов при изменении данных в контексте
  useEffect(() => {
    if (warehouseData && warehouseData.length > 0) {
      // Добавляем опцию "Все склады" в начало списка
      const warehousesWithAll = [ALL_WAREHOUSES, ...warehouseData];
      setWarehouses(warehousesWithAll);
    }
  }, [warehouseData]);

  // Обновление списка штабелей при выборе склада
  useEffect(() => {
    if (selectedWarehouse && selectedWarehouse.id !== ALL_WAREHOUSES.id) {
      // Получаем штабели из выбранного склада
      const selectedWarehouseData = warehouseData.find(w => w.id === selectedWarehouse.id);
      if (selectedWarehouseData && selectedWarehouseData.piles) {
        setPiles(selectedWarehouseData.piles);
      } else {
        setPiles([]);
      }
    } else {
      setPiles([]);
      setSelectedPile(null);
    }
  }, [selectedWarehouse, warehouseData]);

  // Обработчик выбора склада
  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setSelectedPile(null);
  };

  // Обработчик выбора штабеля
  const handlePileSelect = (pile) => {
    setSelectedPile(pile);
  };

  // Обработчик подтверждения выбора
  const handleConfirm = () => {
    if (selectedWarehouse) {
      // Если выбран "Все склады", не требуем выбор штабеля
      if (selectedWarehouse.id === ALL_WAREHOUSES.id) {
        onSelectComplete({
          warehouse: selectedWarehouse,
          pile: null  // Для "Все склады" штабель не выбирается
        });
      } else if (selectedPile) {
        // Для конкретного склада требуется выбор штабеля
        onSelectComplete({
          warehouse: selectedWarehouse,
          pile: selectedPile
        });
      }
    }
  };

  // Обработчик сброса выбора
  const handleReset = () => {
    setSelectedWarehouse(null);
    setPiles([]);
    setSelectedPile(null);
  };

  // Проверка, можно ли подтвердить выбор
  const canConfirm = () => {
    // Для "Все склады" не требуется выбор штабеля
    if (selectedWarehouse && selectedWarehouse.id === ALL_WAREHOUSES.id) {
      return true;
    }
    // Для конкретного склада требуется выбор штабеля
    return selectedWarehouse && selectedPile;
  };

  // Если произошла ошибка при загрузке данных
  if (error) {
    return (
      <div className="warehouse-selector">
        <h2 className="section-title">Выбор местоположения</h2>
        <div className="error-message">{error}</div>
        <button 
          className="action-button reset"
          onClick={fetchWarehouseData}
        >
          Повторить загрузку
        </button>
      </div>
    );
  }

  return (
    <div className="warehouse-selector">
      <h2 className="section-title">Выбор местоположения</h2>
      
      <div className="selector-container">
        <div className="selector-section">
          <h3>Склад</h3>
          {isLoading && !warehouses.length ? (
            <div className="loading-indicator">Загрузка складов...</div>
          ) : (
            <div className="items-list">
              {warehouses.map(warehouse => (
                <div 
                  key={warehouse.id}
                  className={`selector-item ${selectedWarehouse?.id === warehouse.id ? 'selected' : ''} ${warehouse.id === ALL_WAREHOUSES.id ? 'all-warehouses' : ''}`}
                  onClick={() => handleWarehouseSelect(warehouse)}
                >
                  {warehouse.name}
                </div>
              ))}
              {warehouses.length === 0 && !isLoading && (
                <div className="placeholder-message">Нет доступных складов</div>
              )}
            </div>
          )}
        </div>
        
        <div className="selector-section">
          <h3>Штабель</h3>
          {!selectedWarehouse ? (
            <div className="placeholder-message">Сначала выберите склад</div>
          ) : selectedWarehouse.id === ALL_WAREHOUSES.id ? (
            <div className="placeholder-message info">
              <div className="info-icon">ℹ️</div>
              <div>Для просмотра данных по всем складам выбор штабеля не требуется</div>
            </div>
          ) : isLoading ? (
            <div className="loading-indicator">Загрузка штабелей...</div>
          ) : (
            <div className="items-list">
              {piles.map(pile => (
                <div 
                  key={pile.id}
                  className={`selector-item ${selectedPile?.id === pile.id ? 'selected' : ''}`}
                  onClick={() => handlePileSelect(pile)}
                >
                  {pile.name}
                </div>
              ))}
              {piles.length === 0 && !isLoading && (
                <div className="placeholder-message">Нет доступных штабелей</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="selector-actions">
        <button 
          className="action-button reset"
          onClick={handleReset}
        >
          Сбросить
        </button>
        <button 
          className="action-button confirm"
          disabled={!canConfirm()}
          onClick={handleConfirm}
        >
          Применить
        </button>
      </div>
    </div>
  );
};

export default WarehouseSelector; 