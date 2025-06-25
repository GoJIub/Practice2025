from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import fires, weather, warehouses, temperatures

# Создаем инстанс приложения FastAPI
app = FastAPI(
    title="Coal Storage Fire API",
    description="API для системы мониторинга и прогнозирования возгораний угольных складов",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В production лучше указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)

# Подключаем роутеры c правильными префиксами
app.include_router(fires.router, prefix="", tags=["Fires"])
app.include_router(weather.router, prefix="", tags=["Weather"])
app.include_router(warehouses.router, prefix="", tags=["Warehouses"])
app.include_router(temperatures.router, prefix="", tags=["Temperatures"])

@app.get("/")
async def root():
    return {"message": "Coal Storage Fire API is running"}

# Для запуска используйте команду:
# uvicorn main:app --reload