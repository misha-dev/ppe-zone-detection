from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, File, HTTPException, UploadFile

from .constants import MODEL_PATH, PERSON_MODEL_PATH, PERSON_SOURCE, PERSON_SOURCE_COCO
from .detector import Detector
from .image import ImageDecodeError, decode_image
from .ppe import build_result
from .types import DetectResult, Health

state: dict[str, Detector] = {}
lock = Lock()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    state["detector"] = Detector(MODEL_PATH, PERSON_MODEL_PATH, force_coco_person=PERSON_SOURCE == PERSON_SOURCE_COCO)
    yield
    state.clear()


app = FastAPI(title="PPE detection", lifespan=lifespan)


@app.get("/health")
def health() -> Health:
    detector = state["detector"]
    return Health(
        status="ok",
        model=Path(detector.model_path).name,
        classes=detector.classes,
        person_model=Path(detector.person_model_path).name if detector.person_model_path else None,
    )


@app.post("/detect")
def detect(image: UploadFile = File(...)) -> DetectResult:
    try:
        frame = decode_image(image.file.read())
    except ImageDecodeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    with lock:
        detections = state["detector"].detect(frame)
    return build_result(detections)
