import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError


class ImageDecodeError(ValueError):
    pass


def to_bgr(image: Image.Image) -> np.ndarray:
    rgb = ImageOps.exif_transpose(image).convert("RGB")
    return np.ascontiguousarray(np.asarray(rgb)[:, :, ::-1])


def decode_image(data: bytes) -> np.ndarray:
    try:
        with Image.open(io.BytesIO(data)) as image:
            return to_bgr(image)
    except (UnidentifiedImageError, OSError, ImportError) as error:
        raise ImageDecodeError("Не удалось прочитать изображение") from error


def read_image(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return to_bgr(image)
