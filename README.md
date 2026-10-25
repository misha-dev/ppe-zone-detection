# Распознавание СИЗ и опасных зон (ТЗ 5)

Веб-сервис: пользователь загружает фото на фронтенд, бэкенд передаёт его нейросетям, которые находят людей без каски или жилета. Опасной зоной считается всё фото. Результат - фото с рамками и вердиктом.

## Команда

| Участник | Роль |
|---|---|
| Кичаев Юрий | Капитан, разработка |
| Шабатин Михаил | Разработка |
| Налесник Татьяна | Аналитик, данные |

## Стек

- Фронтенд: React, TypeScript, Zustand, TanStack Query
- Бэкенд: NestJS, TypeScript
- Нейросети: Python, FastAPI, ultralytics (YOLO)
- Запуск: Docker

## Структура

```
tasks/           - ТЗ и шаблоны КТ
completedTasks/  - заполненные КТ
code/front/      - фронтенд
code/back/       - бэкенд
code/ml/         - нейросети
```

## Запуск

Три сервиса: фронтенд, бэкенд и нейросети (`code/ml`). Бэкенд отправляет фото в `ml` (`POST http://ml:8000/detect`). Нейросети используют готовую модель [killuminati1/construction-ppe-yolov8](https://huggingface.co/killuminati1/construction-ppe-yolov8) (YOLOv8s, Apache-2.0). Почему выбрана она, описано в разделе «Сравнение моделей» в [code/ml/README.md](code/ml/README.md).

Веса моделей (`.pt`) в git не хранятся: их нужно один раз скачать в папку `code/ml/weights`. Docker подключает эту папку в контейнер `ml`.

### Быстрый старт через Docker

Нужны:
- git;
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), запущенный;
- Python 3.10+ для скачивания весов (если Python нет, см. шаг 2, способ Б).

**1. Склонировать репозиторий**

```bash
git clone https://github.com/misha-dev/ppe-zone-detection.git
cd ppe-zone-detection
```

**2. Скачать веса (один раз, около 27 МБ)**

Способ А — скриптом (macOS / Linux):

```bash
cd code/ml
python3 -m venv .venv
.venv/bin/pip install huggingface_hub pydantic
.venv/bin/python -m compare.download --no-dataset --models killuminati1-v8
cd ../..
```

На Windows (PowerShell) то же самое:

```powershell
cd code/ml
python -m venv .venv
.venv\Scripts\pip install huggingface_hub pydantic
.venv\Scripts\python -m compare.download --no-dataset --models killuminati1-v8
cd ../..
```

Способ Б — без Python, через curl (из корня проекта):

```bash
mkdir -p code/ml/weights
curl -L -o code/ml/weights/killuminati1-v8.pt https://huggingface.co/killuminati1/construction-ppe-yolov8/resolve/main/best.pt
curl -L -o code/ml/weights/yolo11n.pt https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt
```

Проверить, что всё скачалось:

```bash
ls -lh code/ml/weights
```

Должны быть файлы `killuminati1-v8.pt` (около 22 МБ) и `yolo11n.pt` (около 5 МБ). Если файла модели нет, контейнер `ml` упадёт при старте, и `docker compose` не запустит бэкенд (ошибка `dependency failed to start`).

**3. Собрать и запустить**

Из корня проекта:

```bash
docker compose up --build
```

Первая сборка занимает несколько минут: в образ `ml` ставятся torch (CPU) и ultralytics, скачивается около 500 МБ, готовый образ весит около 2,2 ГБ. Если загрузка оборвалась, повторите команду: готовые шаги Docker берёт из кэша. Сервис готов, когда в логах появится `Uvicorn running on http://0.0.0.0:8000` и запустится бэкенд.

**4. Открыть**

- Приложение: http://localhost:8080
- Swagger бэкенда: http://localhost:3000/api/docs
- Сервис нейросетей: http://localhost:8000/health (должен вернуть `"status": "ok"`)

Остановить: `Ctrl+C`, затем `docker compose down`.

**Дополнительно**

- Другая модель из сравнения. Сначала скачать её веса (`--models hansung-v8n` в шаге 2), затем запустить `ML_MODEL=hansung-v8n PERSON_SOURCE=coco docker compose up --build`.
- Без нейросетей, с тестовым ответом бэкенда (веса не нужны): `ML_MOCK=true docker compose up --build --no-deps front back`.

### Запуск без Docker

Нужны Node.js 20.19+ (проверено на 24) и Python 3.10+ (проверено на 3.14). Открыть три терминала в корне проекта.

Терминал 1 — нейросети. Первый раз нужно поставить зависимости и скачать веса (torch и ultralytics занимают несколько сотен МБ):

```bash
cd code/ml
python3 -m venv .venv
.venv/bin/pip install -r requirements-compare.txt
.venv/bin/python -m compare.download --no-dataset --models killuminati1-v8
```

Дальше для запуска достаточно одной команды:

```bash
cd code/ml
MODEL_PATH=weights/killuminati1-v8.pt .venv/bin/uvicorn app.main:app --port 8000
```

Терминал 2 — бэкенд:

```bash
cd code/back
npm install
npm run start:dev
```

Без нейросетей: `ML_MOCK=true npm run start:dev`.

Терминал 3 — фронтенд:

```bash
cd code/front
npm install
npm run dev
```

- Приложение: http://localhost:5173
- Swagger: http://localhost:3000/api/docs

Фронтенд перенаправляет запросы `/api` на `http://localhost:3000`. Другой адрес бэкенда задаётся через `VITE_PROXY_TARGET`.

### Как пользоваться

1. Загрузить фото (JPEG, PNG или WebP, до 10 МБ).
2. Нажать «Проверить».
3. На результате: рамки людей (красная — нарушение, зелёная — в порядке), вердикт и таблица с касками и жилетами.

### Проверка API без фронтенда

```bash
curl -F image=@photo.jpg http://localhost:3000/api/detect
```

### Сравнение моделей

Четыре готовых набора весов YOLO для СИЗ сравниваются без обучения на тестовом сплите открытого датасета. Как запустить сравнение и полные результаты — в [code/ml/README.md](code/ml/README.md), таблицы — в [code/ml/compare/results/](code/ml/compare/results/comparison.md).

## Этапы

- КТ 1 - старт и бизнес-процессы
- КТ 2 - анализ и данные
- КТ 3 - эксперименты
- КТ 4 - прототип
- КТ 5 - приёмка и защита
