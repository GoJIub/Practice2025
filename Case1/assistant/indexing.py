"""
Модуль для анализа текстовых файлов
"""

from glob import glob
from pathlib import Path
from dotenv import load_dotenv
from assistant import sdk
import pandas as pd
from yandex_cloud_ml_sdk.search_indexes import (
    StaticIndexChunkingStrategy,
    HybridSearchIndexType,
    ReciprocalRankFusionIndexCombinationStrategy,
)
import os
from dotenv import set_key
from yandex_cloud_ml_sdk import YCloudML

# Инициализация SDK для токенизации
model = sdk.models.completions("yandexgpt", model_version="rc")

# Оптимальный размер чанка (1000 токенов)
CHUNK_SIZE = 1000 * 2  # 1000 токенов * 2 символа/токен


def get_token_count(filename):
    """Подсчёт количества токенов в файле"""
    with open(filename, "r", encoding="utf8") as f:
        content = f.read()
        tokens = len(model.tokenize(content))
        chars = len(content)
        ratio = chars / tokens
        print(f"{os.path.basename(filename)}: {tokens} токенов, {ratio:.2f} chars/token")
        return tokens


def get_file_len(filename):
    """Подсчёт количества символов в файле"""
    with open(filename, encoding="utf-8") as f:
        l = len(f.read())
    return l


def chunk_and_upload_file(filename):
    """Разбиение файла на чанки и загрузка в облако"""
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()

    # Определяем тип файла по пути
    if "facts" in filename:
        return chunk_and_upload_facts(content)
    elif "docs" in filename:
        return chunk_and_upload_docs(content)
    else:
        return chunk_and_upload_chats(content)


def chunk_and_upload_facts(content):
    """Разбиение файла с фактами на чанки и загрузка в облако"""
    chunks = []

    # Пропускаем заголовок
    lines = content.split("\n")
    if lines[0].startswith("#"):
        lines = lines[1:]

    # Пропускаем заголовок таблицы и разделитель
    if lines[0].startswith("|"):
        lines = lines[2:]

    # Обрабатываем каждую строку таблицы
    for line in lines:
        if not line.strip() or not line.startswith("|"):
            continue

        # Разделяем строку на ячейки
        cells = [cell.strip() for cell in line.split("|")[1:-1]]

        # Создаем чанк для каждой непустой ячейки
        for i, cell in enumerate(cells):
            if not cell:
                continue

            # Определяем категорию по позиции
            categories = ["Учебный процесс", "Инфраструктура", "Студенческая жизнь",
                          "История и уникальность", "Международные возможности"]
            category = categories[i] if i < len(categories) else "Другое"

            # Форматируем факт
            fact = f"""Категория: {category}
Факт: {cell}"""

            # Загружаем чанк
            chunk_id = sdk.files.upload_bytes(
                fact.encode(),
                ttl_days=1,
                expiration_policy="static",
                mime_type="text/markdown"
            )
            chunks.append(chunk_id)

    return chunks


def chunk_and_upload_docs(content):
    """Разбиение файла с документами на чанки и загрузка в облако"""
    chunks = []

    # Пропускаем заголовок
    lines = content.split("\n")
    if lines[0].startswith("#"):
        lines = lines[1:]

    # Пропускаем заголовок таблицы и разделитель
    if lines[0].startswith("|"):
        lines = lines[2:]

    # Обрабатываем каждую строку таблицы
    for line in lines:
        if not line.strip() or not line.startswith("|"):
            continue

        # Разделяем строку на ячейки
        cells = [cell.strip() for cell in line.split("|")[1:-1]]
        if len(cells) >= 3:
            keywords = cells[0].strip()
            question = cells[1].strip()
            answer = cells[2].strip()

            # Форматируем документ
            doc = f"""Ключевые слова: {keywords}
Вопрос: {question}
Ответ: {answer}"""

            # Загружаем чанк
            chunk_id = sdk.files.upload_bytes(
                doc.encode(),
                ttl_days=1,
                expiration_policy="static",
                mime_type="text/markdown"
            )
            chunks.append(chunk_id)

    return chunks


def chunk_and_upload_chats(content):
    """Разбиение файла с чатами на чанки и загрузка в облако"""
    # Пропускаем заголовок и начало таблицы
    lines = content.split("\n")
    if lines[0].startswith("#"):
        year = lines[0].strip("#").strip()
        lines = lines[1:]
    else:
        year = "unknown"

    if lines[0].startswith("| Вопросы | Ответы |"):
        lines = lines[2:]  # Пропускаем заголовок таблицы и разделитель

    # Разбиваем на диалоги
    chunks = []

    for line in lines:
        if not line.strip():  # Пропускаем пустые строки
            continue

        # Разделяем строку на вопрос и ответ
        parts = line.split("|")
        if len(parts) < 4:  # Пропускаем некорректные строки
            continue

        # Извлекаем ID и дату из вопроса
        question_parts = parts[1].strip().split("<br>")
        if len(question_parts) > 1:
            metadata = question_parts[0].strip()
            question = question_parts[1].strip()
        else:
            metadata = ""
            question = parts[1].strip()

        # Извлекаем ID и дату из ответа
        answer_parts = parts[2].strip().split("<br>")
        if len(answer_parts) > 1:
            answer_metadata = answer_parts[0].strip()
            answer = answer_parts[1].strip()
        else:
            answer_metadata = ""
            answer = parts[2].strip()

        # Форматируем диалог с метаданными
        dialog = f"""Год: {year}
Вопрос ({metadata}):
{question}

Ответ ({answer_metadata}):
{answer}"""

        # Загружаем каждый диалог как отдельный чанк
        chunk_id = sdk.files.upload_bytes(
            dialog.encode(),
            ttl_days=1,
            expiration_policy="static",
            mime_type="text/markdown"
        )
        chunks.append(chunk_id)

    return chunks


def create_and_populate_search_index(chunks, index_name, batch_size=100):
    """Создание поискового индекса и добавление чанков пакетами"""
    if not chunks:
        raise ValueError("No chunks provided for indexing")

    print(f"\nСоздание поискового индекса...")

    # Создаем индекс с первым пакетом чанков (до batch_size)
    initial_batch = chunks[:batch_size]
    op = sdk.search_indexes.create_deferred(
        initial_batch,
        index_type=HybridSearchIndexType(
            chunking_strategy=StaticIndexChunkingStrategy(
                max_chunk_size_tokens=1000,
                chunk_overlap_tokens=100
            ),
            combination_strategy=ReciprocalRankFusionIndexCombinationStrategy(),
        ),
    )
    index = op.wait()
    print(f"Индекс {index_name} создан с первым пакетом ({len(initial_batch)} чанков)!")

    # Добавляем оставшиеся чанки пакетами
    for i in range(batch_size, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"Добавление пакета {(i // batch_size) + 1} ({len(batch)} чанков)...")
        op = index.add_files_deferred(batch)
        op.wait()
        print(f"Пакет {(i // batch_size) + 1} добавлен!")

    print(f"Индекс {index_name} полностью заполнен!")
    return index


def get_files():
    """Получение списка всех файлов для анализа"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(project_root, "data")

    files = []
    # Добавляем файлы из директории chats
    for fn in glob(os.path.join(data_dir, "chats", "*.md")):
        if os.path.isfile(fn):
            files.append(fn)
    # Добавляем файлы из директории facts
    for fn in glob(os.path.join(data_dir, "facts", "*.md")):
        if os.path.isfile(fn):
            files.append(fn)
    # Добавляем файлы из директории docs
    for fn in glob(os.path.join(data_dir, "docs", "*.md")):
        if os.path.isfile(fn):
            files.append(fn)
    return sorted(files)


def analyze_files():
    """Анализ всех .md файлов в директориях data/chats и data/facts"""
    # Получаем путь к корню проекта
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(project_root, "2025-mai-yandexcloud-kant_shar", "knowledge_base", "data")

    print("\nАнализ соотношения токенов и символов:")
    d = [
        {
            "File": fn,
            "Tokens": get_token_count(fn),
            "Chars": get_file_len(fn),
            "Category": os.path.basename(os.path.dirname(fn)),
        }
        for fn in glob(os.path.join(data_dir, "*", "*.md"))
        if os.path.isfile(fn)
    ]
    return pd.DataFrame(d)


def save_search_index_id(index_id: str):
    """Сохранение ID индекса в конфигурации"""
    env_path = Path(".env")

    # Читаем существующий файл
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    else:
        lines = []

    # Ищем строку с SEARCH_INDEX_ID
    found = False
    for i, line in enumerate(lines):
        if line.startswith("SEARCH_INDEX_ID="):
            lines[i] = f"SEARCH_INDEX_ID={index_id}\n"
            found = True
            break

    # Если строка не найдена, добавляем новую
    if not found:
        lines.append(f"SEARCH_INDEX_ID={index_id}\n")

    # Записываем обновленный файл
    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(lines)


def initialize_sdk():
    """Инициализация SDK Yandex Cloud"""
    load_dotenv()

    folder_id = os.environ.get("folder_id")
    api_key = os.environ.get("api_key")

    if not folder_id or not api_key:
        raise ValueError("Не найдены необходимые переменные окружения")

    return YCloudML(folder_id=folder_id, auth=api_key)


if __name__ == "__main__":
    # Вывод списка файлов
    print("\nСписок файлов для обработки:")
    for file in get_files():
        print(f"- {file}")

    # Анализ файлов
    df = analyze_files()
    if df.empty:
        print("\nФайлы не найдены. Проверьте пути к директориям data/chats и data/facts.")
    else:
        print("\nРезультаты анализа файлов:")
        print(df)
        print(df.groupby("Category").agg({"Tokens": ("min", "mean", "max")}))

        # Загрузка файлов в облако с чанкованием
        print("\nЗагрузка файлов в облако с чанкованием...")
        df["Uploaded"] = df["File"].apply(chunk_and_upload_file)
        print("\nЗагруженные чанки:")
        for _, row in df.iterrows():
            print(f"- {row['File']} -> {len(row['Uploaded'])} чанков")
        print("Файлы загружены!")

        # Создание и заполнение индекса
        all_chunks = df["Uploaded"].explode().tolist()
        index = create_and_populate_search_index(all_chunks, f"index_1")

        # Сохранение ID индекса в .env
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        set_key(env_file, "SEARCH_INDEX_ID", index.id)
        print("\nID индекса сохранён в .env")