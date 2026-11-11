FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    YOLO_CONFIG_DIR=/tmp/ultralytics \
    YOLO_OFFLINE=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-torch.txt requirements.txt ./
RUN pip install -r requirements-torch.txt --index-url https://download.pytorch.org/whl/cpu \
    && pip install -r requirements.txt

COPY app ./app
ADD --chmod=0444 --checksum=sha256:31ef3ca04a17cf545f3fcfc64c4af8993a41d52ccc460e82aff01d5354603533 https://huggingface.co/killuminati1/construction-ppe-yolov8/resolve/main/best.pt /app/bundled-weights/killuminati1-v8.pt
RUN chmod 0755 /app/bundled-weights

VOLUME /app/weights

ENV MODEL_PATH=/app/bundled-weights/killuminati1-v8.pt \
    PERSON_MODEL_PATH=/app/weights/yolo11n.pt \
    HOME=/tmp

EXPOSE 8000
USER 10001:10001

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
