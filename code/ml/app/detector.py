from pathlib import Path

import numpy as np
from ultralytics import YOLO

from .constants import CLASS_ALIASES, COCO_PERSON_CLASS, CONF_THRESHOLD, DEVICE, IMG_SIZE, IOU_THRESHOLD, PERSON
from .types import Detection


def normalize(name: str) -> str:
    return " ".join(name.lower().replace("_", " ").replace("-", " ").split())


def build_class_map(names: dict[int, str]) -> dict[int, str]:
    aliases = {normalize(alias): label for label, values in CLASS_ALIASES.items() for alias in values}
    return {index: aliases[normalize(name)] for index, name in names.items() if normalize(name) in aliases}


def run(model: YOLO, image: np.ndarray, classes: list[int], conf: float) -> list[tuple[int, tuple[float, float, float, float], float]]:
    result = model.predict(image, imgsz=IMG_SIZE, conf=conf, iou=IOU_THRESHOLD, classes=classes, device=DEVICE, verbose=False)[0]
    boxes = result.boxes
    return [
        (int(cls), (float(x1), float(y1), float(x2), float(y2)), float(score))
        for (x1, y1, x2, y2), cls, score in zip(boxes.xyxy.tolist(), boxes.cls.tolist(), boxes.conf.tolist())
    ]


class Detector:
    def __init__(self, model_path: str, person_model_path: str, force_coco_person: bool = False) -> None:
        self.model_path = model_path
        self.model = YOLO(model_path)
        self.class_map = build_class_map(self.model.names)
        if force_coco_person:
            self.class_map = {index: label for index, label in self.class_map.items() if label != PERSON}
        self.person_model: YOLO | None = None
        self.person_model_path: str | None = None
        if PERSON not in self.class_map.values():
            self.person_model_path = person_model_path
            self.person_model = YOLO(person_model_path)

    @property
    def classes(self) -> dict[str, list[str]]:
        mapping: dict[str, list[str]] = {}
        for index, label in self.class_map.items():
            mapping.setdefault(label, []).append(self.model.names[index])
        if self.person_model is not None:
            mapping[PERSON] = [f"{Path(self.person_model_path or '').name}:{self.person_model.names[COCO_PERSON_CLASS]}"]
        return mapping

    def detect(self, image: np.ndarray, conf: float = CONF_THRESHOLD) -> list[Detection]:
        detections = [
            Detection(self.class_map[cls], box, score)
            for cls, box, score in run(self.model, image, list(self.class_map), conf)
        ]
        if self.person_model is not None:
            detections += [Detection(PERSON, box, score) for _, box, score in run(self.person_model, image, [COCO_PERSON_CLASS], conf)]
        return detections
