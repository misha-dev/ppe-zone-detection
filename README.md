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

Веса выбранной модели `killuminati1-v8` скачиваются при сборке ML-образа. Docker проверяет SHA-256 файла. Веса не хранятся в Git.

### Быстрый старт через Docker

Нужен запущенный Docker Desktop или Docker Engine с Compose v2 и BuildKit. Для первой сборки нужен интернет. Все три сервиса работают на CPU.

После клонирования откройте корень репозитория и выполните:

```bash
docker compose up --build
```

Откройте [веб-интерфейс](http://localhost:8080), выберите фото и нажмите «Проверить». [Swagger бэкенда](http://localhost:3000/api/docs) и [состояние ML-сервиса](http://localhost:8000/health) доступны отдельно. Остановить запуск можно сочетанием `Ctrl+C`. Чтобы удалить контейнеры проекта, выполните `docker compose down`.

Для настроек можно скопировать `.env.example` в `.env`. При использовании другой модели укажите `ML_MODEL` и положите файл `<имя>.pt` в `code/ml/weights`. Для `PERSON_SOURCE=coco` в этой же папке нужен `yolo11n.pt`. Скачать дополнительные веса можно командой `python -m compare.download --no-dataset --models hansung-v8n` из `code/ml` с установленными зависимостями сравнения.

### Демо на тестовых фото

В тестовом сплите [VincentGOURBIN/ppe-detection](https://huggingface.co/datasets/VincentGOURBIN/ppe-detection/tree/main/test/images) найдите JPEG-файлы с указанными префиксами. Загрузите их в интерфейс одним пакетом и нажмите «Проверить».

| Префикс файла | Что увидеть в интерфейсе |
|---|---|
| `ppe_0160` | Один человек в каске и жилете, нарушений нет |
| `ppe_0210` | Один человек в каске без жилета, есть нарушение |

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
