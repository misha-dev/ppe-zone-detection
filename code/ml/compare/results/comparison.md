# Сравнение готовых моделей СИЗ

Дата: 2026-10-24. Тестовый набор: [VincentGOURBIN/ppe-detection](https://huggingface.co/datasets/VincentGOURBIN/ppe-detection) (сплит test, 101 фото, CC BY 4.0, источник: [Roboflow Universe](https://universe.roboflow.com/vincentspace/ppe-detection-1-cniwr/dataset/2)).
Железо: macOS-26.6-arm64-arm-64bit-Mach-O, Apple M4, 10 CPU, 24 ГБ RAM, инференс на CPU.
Порог уверенности для P/R и нарушений: 0.35; mAP50 считается по всем предсказаниям (conf ≥ 0.001). Совпадение с разметкой: IoU ≥ 0,5.

## Итог

| Модель | Архитектура | mAP50 | Precision | Recall | P нарушений | R нарушений | F1 нарушений | мс/фото | Пик RAM, МБ | Веса, МБ |
|---|---|---|---|---|---|---|---|---|---|---|
| hansung-v8n + yolo11n | YOLOv8n | 0.849 | 0.822 | 0.874 | 0.733 | 0.812 | 0.771 | 146.1 | 618 | 11.3 |
| hexmon-v8m + yolo11n | YOLOv8m | 0.832 | 0.849 | 0.742 | 0.581 | 0.893 | 0.704 | 489.5 | 906 | 55.0 |
| killuminati1-v8 | YOLOv8s | 0.824 | 0.788 | 0.859 | 0.756 | 0.832 | 0.792 | 161.4 | 728 | 21.5 |
| hansung-v8n | YOLOv8n | 0.820 | 0.765 | 0.841 | 0.607 | 0.745 | 0.669 | 68.8 | 598 | 6.0 |
| killuminati1-v8 + yolo11n | YOLOv8s | 0.813 | 0.778 | 0.839 | 0.733 | 0.792 | 0.761 | 279.2 | 742 | 26.8 |
| melihuzunoglu-v11 | YOLO11n | 0.756 | 0.800 | 0.725 | 0.669 | 0.745 | 0.705 | 73.2 | 599 | 5.2 |
| melihuzunoglu-v11 + yolo11n | YOLO11n | 0.755 | 0.787 | 0.757 | 0.611 | 0.792 | 0.690 | 158.3 | 620 | 10.6 |
| hexmon-v8m | YOLOv8m | 0.544 | 0.855 | 0.338 | 1.000 | 0.020 | 0.039 | 428.0 | 896 | 49.6 |

## По классам (AP50 / Precision / Recall)

| Модель | person | helmet | vest |
|---|---|---|---|
| hansung-v8n + yolo11n | 0.905 / 0.846 / 0.918 | 0.839 / 0.845 / 0.845 | 0.804 / 0.718 / 0.822 |
| hexmon-v8m + yolo11n | 0.905 / 0.846 / 0.918 | 0.789 / 0.840 / 0.685 | 0.800 / 0.902 / 0.411 |
| killuminati1-v8 | 0.940 / 0.865 / 0.961 | 0.731 / 0.728 / 0.735 | 0.801 / 0.716 / 0.867 |
| hansung-v8n | 0.817 / 0.724 / 0.845 | 0.839 / 0.845 / 0.845 | 0.804 / 0.718 / 0.822 |
| killuminati1-v8 + yolo11n | 0.905 / 0.846 / 0.918 | 0.731 / 0.728 / 0.735 | 0.801 / 0.716 / 0.867 |
| melihuzunoglu-v11 | 0.909 / 0.879 / 0.845 | 0.734 / 0.789 / 0.655 | 0.625 / 0.607 / 0.567 |
| melihuzunoglu-v11 + yolo11n | 0.905 / 0.846 / 0.918 | 0.734 / 0.789 / 0.655 | 0.625 / 0.607 / 0.567 |
| hexmon-v8m | 0.042 / 1.000 / 0.013 | 0.789 / 0.840 / 0.685 | 0.800 / 0.902 / 0.411 |

## Источники и маппинг классов

| Модель | Веса | Лицензия | Обучена на | Классы модели → наши |
|---|---|---|---|---|
| hansung-v8n + yolo11n | [Hansung-Cho/yolov8-ppe-detection](https://huggingface.co/Hansung-Cho/yolov8-ppe-detection) | MIT | открытые наборы PPE (Kaggle и др.) | helmet: Hardhat; person: yolo11n.pt:person; vest: Safety Vest |
| hexmon-v8m + yolo11n | [Hexmon/vyra-yolo-ppe-detection](https://huggingface.co/Hexmon/vyra-yolo-ppe-detection) | CC BY 4.0 | Roboflow PPE Combined Model v4 | helmet: Hardhat; person: yolo11n.pt:person; vest: Safety Vest |
| killuminati1-v8 | [killuminati1/construction-ppe-yolov8](https://huggingface.co/killuminati1/construction-ppe-yolov8) | Apache-2.0 | смесь Roboflow + GitHub, ~13k фото | helmet: Hard_hat; person: Worker; vest: Vest |
| hansung-v8n | [Hansung-Cho/yolov8-ppe-detection](https://huggingface.co/Hansung-Cho/yolov8-ppe-detection) | MIT | открытые наборы PPE (Kaggle и др.) | helmet: Hardhat; person: Person; vest: Safety Vest |
| killuminati1-v8 + yolo11n | [killuminati1/construction-ppe-yolov8](https://huggingface.co/killuminati1/construction-ppe-yolov8) | Apache-2.0 | смесь Roboflow + GitHub, ~13k фото | helmet: Hard_hat; person: yolo11n.pt:person; vest: Vest |
| melihuzunoglu-v11 | [melihuzunoglu/ppe-detection](https://huggingface.co/melihuzunoglu/ppe-detection) | AGPL-3.0 | собственный набор автора | helmet: helmet; person: human; vest: vest |
| melihuzunoglu-v11 + yolo11n | [melihuzunoglu/ppe-detection](https://huggingface.co/melihuzunoglu/ppe-detection) | AGPL-3.0 | собственный набор автора | helmet: helmet; person: yolo11n.pt:person; vest: vest |
| hexmon-v8m | [Hexmon/vyra-yolo-ppe-detection](https://huggingface.co/Hexmon/vyra-yolo-ppe-detection) | CC BY 4.0 | Roboflow PPE Combined Model v4 | helmet: Hardhat; person: Person; vest: Safety Vest |

Лучшая по mAP50: **hansung-v8n + yolo11n**. Лучшая по F1 нарушений: **killuminati1-v8**.
