import argparse
import csv
import multiprocessing
import platform
import resource
import subprocess
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from dataclasses import asdict, replace
from datetime import date
from pathlib import Path

import psutil
from PIL import Image

from app.constants import CONF_THRESHOLD, PERSON
from app.detector import Detector
from app.image import read_image
from app.ppe import build_people
from app.types import Box, Detection

from .constants import (
    DATASET_CLASSES,
    DATASET_LICENSE,
    DATASET_REPO,
    DATASET_URL,
    LABELS,
    MAP_CONF,
    MODELS,
    RESULTS_DIR,
    WARMUP_IMAGES,
)
from .download import download_dataset, download_model, download_person_model
from .metrics import average_precision, count, count_violations, scored_hits
from .types import ClassStats, ModelSpec, Row, Sample

ALL = "all"


def read_labels(label_path: Path, width: int, height: int) -> dict[str, list[Box]]:
    labels: dict[str, list[Box]] = {label: [] for label in LABELS}
    if not label_path.exists():
        return labels
    for line in label_path.read_text().splitlines():
        parts = line.split()
        if len(parts) != 5 or int(parts[0]) not in DATASET_CLASSES:
            continue
        cx, cy, w, h = (float(value) for value in parts[1:])
        box = ((cx - w / 2) * width, (cy - h / 2) * height, (cx + w / 2) * width, (cy + h / 2) * height)
        labels[DATASET_CLASSES[int(parts[0])]].append(box)
    return labels


def load_samples(split_dir: Path, limit: int | None) -> list[Sample]:
    images = sorted(path for path in (split_dir / "images").iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    samples: list[Sample] = []
    for image in images[:limit]:
        with Image.open(image) as opened:
            width, height = opened.size
        samples.append(Sample(image, read_labels(split_dir / "labels" / f"{image.stem}.txt", width, height)))
    return samples


def truth_detections(sample: Sample) -> list[Detection]:
    return [Detection(label, box, 1.0) for label, boxes in sample.labels.items() for box in boxes]


def peak_rss_mb() -> float:
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return peak / 1024 / 1024 if sys.platform == "darwin" else peak / 1024


def mapping_text(detector: Detector) -> str:
    return "; ".join(f"{label}: {', '.join(names)}" for label, names in sorted(detector.classes.items()))


def evaluate(spec: ModelSpec, weights: str, person_weights: str, samples: list[Sample], conf: float, coco_person: bool) -> Row:
    detector = Detector(weights, person_weights, force_coco_person=coco_person)
    images = [read_image(sample.image) for sample in samples]
    for image in images[:WARMUP_IMAGES]:
        detector.detect(image, conf)

    stats = {label: ClassStats() for label in LABELS}
    violations = ClassStats()
    elapsed = 0.0
    for sample, image in zip(samples, images):
        started = time.perf_counter()
        detections = detector.detect(image, conf)
        people = build_people(detections)
        elapsed += time.perf_counter() - started
        for label in LABELS:
            count([d for d in detections if d.label == label], sample.labels[label], stats[label])
        count_violations(people, build_people(truth_detections(sample)), violations)
    peak = peak_rss_mb()

    hits: dict[str, list[tuple[float, bool]]] = {label: [] for label in LABELS}
    for sample, image in zip(samples, images):
        detections = detector.detect(image, MAP_CONF)
        for label in LABELS:
            hits[label] += scored_hits([d for d in detections if d.label == label], sample.labels[label])

    total = ClassStats(*(sum(getattr(s, field) for s in stats.values()) for field in ("tp", "fp", "fn")))
    ap50 = {label: average_precision(hits[label], sum(len(s.labels[label]) for s in samples)) for label in LABELS}
    size = Path(weights).stat().st_size + (Path(person_weights).stat().st_size if detector.person_model else 0)
    return Row(
        model=spec.name + (" + yolo11n" if detector.person_model else ""),
        arch=spec.arch,
        license=spec.license,
        mapping=mapping_text(detector),
        size_mb=size / 1024 / 1024,
        precision={ALL: total.precision} | {label: s.precision for label, s in stats.items()},
        recall={ALL: total.recall} | {label: s.recall for label, s in stats.items()},
        ap50=ap50,
        map50=sum(ap50.values()) / len(ap50),
        violation_precision=violations.precision,
        violation_recall=violations.recall,
        violation_f1=violations.f1,
        ms_per_image=elapsed / len(samples) * 1000,
        peak_rss_mb=peak,
    )


def fmt(value: float) -> str:
    return f"{value:.3f}"


def write_csv(rows: list[Row], path: Path) -> None:
    with path.open("w", newline="") as file:
        writer = csv.writer(file, lineterminator="\n")
        writer.writerow([
            "model", "arch", "license", "map50", "precision", "recall",
            *[f"{metric}_{label}" for label in LABELS for metric in ("ap50", "precision", "recall")],
            "violation_precision", "violation_recall", "violation_f1", "ms_per_image", "peak_rss_mb", "size_mb", "mapping",
        ])
        for row in rows:
            writer.writerow([
                row.model, row.arch, row.license, fmt(row.map50), fmt(row.precision[ALL]), fmt(row.recall[ALL]),
                *[fmt(value) for label in LABELS for value in (row.ap50[label], row.precision[label], row.recall[label])],
                fmt(row.violation_precision), fmt(row.violation_recall), fmt(row.violation_f1),
                f"{row.ms_per_image:.1f}", f"{row.peak_rss_mb:.0f}", f"{row.size_mb:.1f}", row.mapping,
            ])


def cpu_name() -> str:
    if sys.platform == "darwin":
        result = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True)
        return result.stdout.strip() or platform.machine()
    return platform.processor() or platform.machine()


def hardware() -> str:
    memory = psutil.virtual_memory().total / 1024**3
    return f"{platform.platform()}, {cpu_name()}, {psutil.cpu_count()} CPU, {memory:.0f} ГБ RAM, инференс на CPU"


def write_markdown(rows: list[Row], specs: dict[str, ModelSpec], samples: int, conf: float, path: Path) -> None:
    lines = [
        "# Сравнение готовых моделей СИЗ",
        "",
        f"Дата: {date.today().isoformat()}. Тестовый набор: [{DATASET_REPO}](https://huggingface.co/datasets/{DATASET_REPO}) "
        f"(сплит test, {samples} фото, {DATASET_LICENSE}, источник: [Roboflow Universe]({DATASET_URL})).",
        f"Железо: {hardware()}.",
        f"Порог уверенности для P/R и нарушений: {conf}; mAP50 считается по всем предсказаниям (conf ≥ {MAP_CONF}). "
        "Совпадение с разметкой: IoU ≥ 0,5.",
        "",
        "## Итог",
        "",
        "| Модель | Архитектура | mAP50 | Precision | Recall | P нарушений | R нарушений | F1 нарушений | мс/фото | Пик RAM, МБ | Веса, МБ |",
        "|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| {row.model} | {row.arch} | {fmt(row.map50)} | {fmt(row.precision[ALL])} | {fmt(row.recall[ALL])} | "
            f"{fmt(row.violation_precision)} | {fmt(row.violation_recall)} | {fmt(row.violation_f1)} | "
            f"{row.ms_per_image:.1f} | {row.peak_rss_mb:.0f} | {row.size_mb:.1f} |"
        )
    lines += [
        "",
        "## По классам (AP50 / Precision / Recall)",
        "",
        "| Модель | " + " | ".join(LABELS) + " |",
        "|---|" + "---|" * len(LABELS),
    ]
    for row in rows:
        cells = [f"{fmt(row.ap50[label])} / {fmt(row.precision[label])} / {fmt(row.recall[label])}" for label in LABELS]
        lines.append(f"| {row.model} | " + " | ".join(cells) + " |")
    lines += [
        "",
        "## Источники и маппинг классов",
        "",
        "| Модель | Веса | Лицензия | Обучена на | Классы модели → наши |",
        "|---|---|---|---|---|",
    ]
    for row in rows:
        spec = specs[row.model.split(" + ")[0]]
        lines.append(f"| {row.model} | [{spec.repo}]({spec.url}) | {spec.license} | {spec.dataset} | {row.mapping} |")
    best_map = max(rows, key=lambda row: row.map50)
    best_violations = max(rows, key=lambda row: row.violation_f1)
    lines += ["", f"Лучшая по mAP50: **{best_map.model}**. Лучшая по F1 нарушений: **{best_violations.model}**.", ""]
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Сравнение готовых весов YOLO для СИЗ")
    parser.add_argument("--models", nargs="*", default=[spec.name for spec in MODELS])
    parser.add_argument("--conf", type=float, default=CONF_THRESHOLD)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--no-coco-person", action="store_true", help="не прогонять вариант с людьми из yolo11n")
    parser.add_argument("--out", type=Path, default=RESULTS_DIR)
    args = parser.parse_args()

    specs = {spec.name: spec for spec in MODELS if spec.name in args.models}
    samples = load_samples(download_dataset(), args.limit)
    person_weights = str(download_person_model())
    print(f"Тестовых фото: {len(samples)}; людей: {sum(len(s.labels[PERSON]) for s in samples)}")

    rows: list[Row] = []
    context = multiprocessing.get_context("spawn")
    for spec in specs.values():
        weights = str(download_model(spec))
        for coco_person in (False,) if args.no_coco_person else (False, True):
            with ProcessPoolExecutor(max_workers=1, mp_context=context) as pool:
                row = pool.submit(evaluate, spec, weights, person_weights, samples, args.conf, coco_person).result()
            if any(existing.model == row.model for existing in rows):
                continue
            rows.append(row)
            print(f"{row.model}: mAP50={fmt(row.map50)} P={fmt(row.precision[ALL])} R={fmt(row.recall[ALL])} "
                  f"viol P/R={fmt(row.violation_precision)}/{fmt(row.violation_recall)} {row.ms_per_image:.1f} мс {row.peak_rss_mb:.0f} МБ")

    rows.sort(key=lambda row: -row.map50)
    args.out.mkdir(parents=True, exist_ok=True)
    write_csv(rows, args.out / "comparison.csv")
    write_markdown(rows, specs, len(samples), args.conf, args.out / "comparison.md")
    print(f"Готово: {args.out / 'comparison.md'}")


if __name__ == "__main__":
    main()
