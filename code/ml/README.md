# Нейросети (ML)

Сервис получает фото, находит людей, каски и жилеты и проверяет нарушения. Опасной зоной считается всё фото, поэтому нарушение — человек без каски или без жилета.

Свои модели не обучаем: берём готовые открытые веса YOLO и сравниваем их на одном тестовом наборе.

## Стек

| Что | Чем |
|---|---|
| Язык | Python 3.12 (Docker), локально проверено на 3.14 |
| API | FastAPI + uvicorn |
| Детекция | ultralytics 8.4 (YOLO), инференс на CPU |
| Работа с фото | Pillow |
| Запуск | Docker |

## Как работает

1. **Детекция.** Модель СИЗ находит людей, каски и жилеты. Классы модели сопоставляются с нашими по названию (`Hard_hat`, `Hardhat` → каска; `Vest`, `Safety Vest` → жилет; `Worker`, `Person`, `human` → человек). Если в модели нет класса «человек» или задано `PERSON_SOURCE=coco`, людей ищет стандартная `yolo11n.pt` (класс `person` из COCO).
2. **СИЗ надет.** Каска надета, если не меньше половины её рамки лежит внутри рамки человека и её центр находится в верхней части рамки человека: от 15% высоты над рамкой до 35% высоты внутри. Жилет надет, если не меньше половины его рамки лежит внутри рамки человека. Если рамка СИЗ подходит нескольким людям, она достаётся тому, с кем пересекается больше.
3. **Нарушение.** `violation` человека = `!(helmet && vest)`. `violation` ответа — есть хотя бы один нарушитель.

Пороги лежат в [app/constants.py](app/constants.py).

## API

`POST /detect`, multipart, поле `image` (JPEG, PNG, WebP). Координаты — в пикселях исходного фото с учётом поворота из EXIF.

```json
{
  "violation": true,
  "people": [
    { "box": [x1, y1, x2, y2], "helmet": false, "vest": true, "violation": true }
  ]
}
```

`GET /health` — статус, файл модели и сопоставление классов. Если файл не читается как изображение, сервис отвечает 400.

Переменные окружения:

| Переменная | По умолчанию | Что задаёт |
|---|---|---|
| `MODEL_PATH` | `weights/model.pt` | веса модели СИЗ |
| `PERSON_MODEL_PATH` | `weights/yolo11n.pt` | веса модели людей (COCO) |
| `PERSON_SOURCE` | `model` | `coco` — брать людей из `yolo11n`, а не из модели СИЗ |
| `CONF_THRESHOLD` | `0.35` | порог уверенности |
| `IOU_THRESHOLD` | `0.5` | порог NMS |
| `IMG_SIZE` | `640` | размер входа модели |
| `DEVICE` | `cpu` | `cpu`, `mps` или `0` (GPU) |

## Откуда веса

Все веса — открытые, формат ultralytics `.pt`, с Hugging Face. Перед использованием проверено, что файлы скачиваются, загружаются и не содержат в pickle ничего, кроме классов torch и ultralytics.

| Имя | Веса | Архитектура | Лицензия | Обучена на | Классы → наши |
|---|---|---|---|---|---|
| hexmon-v8m | [Hexmon/vyra-yolo-ppe-detection](https://huggingface.co/Hexmon/vyra-yolo-ppe-detection) | YOLOv8m | CC BY 4.0 | Roboflow PPE Combined Model v4 | `Person`, `Hardhat`, `Safety Vest` |
| killuminati1-v8 | [killuminati1/construction-ppe-yolov8](https://huggingface.co/killuminati1/construction-ppe-yolov8) | YOLOv8s | Apache-2.0 | смесь Roboflow + GitHub, ~13k фото | `Worker`, `Hard_hat`, `Vest` |
| melihuzunoglu-v11 | [melihuzunoglu/ppe-detection](https://huggingface.co/melihuzunoglu/ppe-detection) | YOLO11n | AGPL-3.0 | собственный набор автора | `human`, `helmet`, `vest` |
| hansung-v8n | [Hansung-Cho/yolov8-ppe-detection](https://huggingface.co/Hansung-Cho/yolov8-ppe-detection) | YOLOv8n | MIT | открытые наборы PPE | `Person`, `Hardhat`, `Safety Vest` |
| yolo11n | [ultralytics/assets v8.3.0](https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt) | YOLO11n | AGPL-3.0 | COCO | `person` |

Список моделей — в [compare/constants.py](compare/constants.py). Веса в git не хранятся (`weights/` в `.gitignore`).

## Сравнение моделей

Каждую модель прогоняем на одном тестовом наборе двумя способами: со своим классом «человек» и с людьми из `yolo11n`.

**Тестовый набор:** [VincentGOURBIN/ppe-detection](https://huggingface.co/datasets/VincentGOURBIN/ppe-detection), сплит `test`. Это 101 фото и 233 человека, лицензия CC BY 4.0, источник — [Roboflow Universe](https://universe.roboflow.com/vincentspace/ppe-detection-1-cniwr/dataset/2), разметка в формате YOLO. Ни одна из моделей на нём не обучалась.

**Метрики:**
- Precision, Recall — по людям, каскам и жилетам, совпадение с разметкой при IoU ≥ 0,5, порог уверенности 0,35.
- mAP50 — среднее AP50 по трём классам.
- P/R нарушений: нарушитель найден верно, если его рамка совпала с рамкой человека из разметки (IoU ≥ 0,5) и по разметке он тоже нарушитель. По разметке нарушитель определяется тем же правилом «СИЗ надет».
- Время на фото — детекция и проверка СИЗ, без чтения файла.
- Память — пиковый RSS процесса; каждая модель идёт в отдельном процессе.

Результаты: Apple M4, 10 CPU, 24 ГБ RAM, инференс на CPU. Полные таблицы — в [compare/results/comparison.md](compare/results/comparison.md) и [comparison.csv](compare/results/comparison.csv).

| Модель | mAP50 | Precision | Recall | P нарушений | R нарушений | F1 нарушений | мс/фото | Пик RAM, МБ |
|---|---|---|---|---|---|---|---|---|
| hansung-v8n + yolo11n | 0.849 | 0.822 | 0.874 | 0.733 | 0.812 | 0.771 | 146 | 618 |
| hexmon-v8m + yolo11n | 0.832 | 0.849 | 0.742 | 0.581 | 0.893 | 0.704 | 490 | 906 |
| **killuminati1-v8** | 0.824 | 0.788 | 0.859 | **0.756** | 0.832 | **0.792** | 161 | 728 |
| hansung-v8n | 0.820 | 0.765 | 0.841 | 0.607 | 0.745 | 0.669 | 69 | 598 |
| killuminati1-v8 + yolo11n | 0.813 | 0.778 | 0.839 | 0.733 | 0.792 | 0.761 | 279 | 742 |
| melihuzunoglu-v11 | 0.756 | 0.800 | 0.725 | 0.669 | 0.745 | 0.705 | 73 | 599 |
| melihuzunoglu-v11 + yolo11n | 0.755 | 0.787 | 0.757 | 0.611 | 0.792 | 0.690 | 158 | 620 |
| hexmon-v8m | 0.544 | 0.855 | 0.338 | 1.000 | 0.020 | 0.039 | 428 | 896 |

**Выводы:**
- В сервис взята **killuminati1-v8**: у неё лучший F1 нарушений, лучший поиск людей (AP50 0,94, Recall 0,96), она работает одной моделью без `yolo11n`, и у неё свободная лицензия Apache-2.0.
- hansung-v8n + yolo11n лучше по mAP50 (0,849), но хуже находит нарушителей и требует две модели. Это запасной вариант: `ML_MODEL=hansung-v8n PERSON_SOURCE=coco`.
- У hexmon-v8m почти не работает класс «человек» (Recall 0,01), поэтому одна она нарушителей не находит. С `yolo11n` у неё лучший Recall нарушений (0,89), но много ложных тревог и самая медленная скорость.
- Порог ТЗ 10 FPS (до 100 мс на кадр) на CPU проходят только hansung-v8n и melihuzunoglu-v11 без `yolo11n` (69–73 мс). Выбранная killuminati1-v8 даёт около 6 FPS. Для одиночных фото этого хватает, для видео нужна GPU.

**Ограничения:**
- 101 фото — немного. Фото сжаты до 640×640 с белыми полями, часть повёрнута (аугментация Roboflow).
- На части фото люди в касках не размечены как «человек» (например, `ppe_0105`: 10 касок и 4 человека). Модели получают за них ложные срабатывания, и Precision занижен.
- Время замерено на Mac M4. В Docker и на другом железе оно будет другим.

### Как запустить сравнение

```bash
cd code/ml
python3 -m venv .venv
.venv/bin/pip install -r requirements-compare.txt
.venv/bin/python -m compare.download
.venv/bin/python -m compare.compare
```

`compare.download` скачивает веса в `weights/` и тестовый набор в `data/`; уже скачанные файлы пропускает. `compare.compare` пишет таблицы в `compare/results/`. Полезные флаги: `--models killuminati1-v8 hansung-v8n`, `--limit 10`, `--conf 0.25`, `--no-coco-person`.

## Запуск сервиса

### Docker

Веса не входят в образ, а монтируются томом из `code/ml/weights`. Поэтому сначала их нужно скачать. Пошаговая инструкция после `git clone`, в том числе скачивание через curl без Python, — в разделе «Быстрый старт через Docker» в [корневом README](../../README.md). Затем из корня проекта:

```bash
docker compose up --build
```

Модель выбирается переменными `ML_MODEL` (имя файла в `weights/` без `.pt`, по умолчанию `killuminati1-v8`) и `PERSON_SOURCE`:

```bash
ML_MODEL=hansung-v8n PERSON_SOURCE=coco docker compose up --build
```

### Локально

```bash
cd code/ml
.venv/bin/python -m compare.download --no-dataset --models killuminati1-v8
MODEL_PATH=weights/killuminati1-v8.pt .venv/bin/uvicorn app.main:app --port 8000
```

Проверка:

```bash
curl -F image=@photo.jpg http://localhost:8000/detect
```

## Структура

```
app/                 - сервис FastAPI
  main.py            - эндпоинты /detect и /health
  detector.py        - загрузка YOLO, маппинг классов, люди из yolo11n
  ppe.py             - проверка «СИЗ надет» и нарушения
compare/             - сравнение моделей
  constants.py       - список моделей и тестовый набор
  download.py        - скачивание весов и набора
  compare.py         - прогон и таблицы
  metrics.py         - P/R, AP50, нарушения
  results/           - comparison.md, comparison.csv
Dockerfile
requirements.txt          - сервис
requirements-torch.txt    - torch (в Docker ставится CPU-сборка)
requirements-compare.txt  - всё для сравнения
```
