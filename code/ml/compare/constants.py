from pathlib import Path

from app.constants import HELMET, PERSON, VEST

from .types import ModelSpec

ROOT = Path(__file__).resolve().parent.parent
WEIGHTS_DIR = ROOT / "weights"
DATA_DIR = ROOT / "data"
RESULTS_DIR = Path(__file__).resolve().parent / "results"

PERSON_MODEL_URL = "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt"
PERSON_MODEL_FILE = "yolo11n.pt"

DATASET_REPO = "VincentGOURBIN/ppe-detection"
DATASET_URL = "https://universe.roboflow.com/vincentspace/ppe-detection-1-cniwr/dataset/2"
DATASET_LICENSE = "CC BY 4.0"
DATASET_SPLIT = "test"
DATASET_CLASSES = {0: HELMET, 3: PERSON, 4: VEST}

LABELS = (PERSON, HELMET, VEST)
MATCH_IOU = 0.5
MAP_CONF = 0.001
WARMUP_IMAGES = 3

MODELS = (
    ModelSpec("hexmon-v8m", "Hexmon/vyra-yolo-ppe-detection", "best.pt", "YOLOv8m", "CC BY 4.0", "Roboflow PPE Combined Model v4"),
    ModelSpec("killuminati1-v8", "killuminati1/construction-ppe-yolov8", "best.pt", "YOLOv8s", "Apache-2.0", "смесь Roboflow + GitHub, ~13k фото"),
    ModelSpec("melihuzunoglu-v11", "melihuzunoglu/ppe-detection", "best.pt", "YOLO11n", "AGPL-3.0", "собственный набор автора"),
    ModelSpec("hansung-v8n", "Hansung-Cho/yolov8-ppe-detection", "best.pt", "YOLOv8n", "MIT", "открытые наборы PPE (Kaggle и др.)"),
)
