import os

MODEL_PATH = os.getenv("MODEL_PATH", "weights/model.pt")
PERSON_MODEL_PATH = os.getenv("PERSON_MODEL_PATH", "weights/yolo11n.pt")
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.35"))
IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", "0.5"))
IMG_SIZE = int(os.getenv("IMG_SIZE", "640"))
DEVICE = os.getenv("DEVICE", "cpu")
PERSON_SOURCE = os.getenv("PERSON_SOURCE", "model")

PERSON_SOURCE_COCO = "coco"

PERSON = "person"
HELMET = "helmet"
VEST = "vest"

CLASS_ALIASES: dict[str, set[str]] = {
    PERSON: {"person", "worker", "human", "people"},
    HELMET: {"helmet", "hardhat", "hard_hat", "hard-hat", "hard hat", "safety helmet", "safety-helmet"},
    VEST: {"vest", "safety vest", "safety-vest", "safety_vest", "reflective vest", "hi-vis vest"},
}

COCO_PERSON_CLASS = 0

HELMET_MIN_OVERLAP = 0.5
HELMET_TOP_SHARE = 0.35
HELMET_ABOVE_SHARE = 0.15
VEST_MIN_OVERLAP = 0.5
