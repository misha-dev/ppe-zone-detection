from dataclasses import dataclass
from pathlib import Path

from app.types import Box


@dataclass(frozen=True)
class ModelSpec:
    name: str
    repo: str
    file: str
    arch: str
    license: str
    dataset: str

    @property
    def url(self) -> str:
        return f"https://huggingface.co/{self.repo}"

    @property
    def download_url(self) -> str:
        return f"https://huggingface.co/{self.repo}/resolve/main/{self.file}"


@dataclass(frozen=True)
class Sample:
    image: Path
    labels: dict[str, list[Box]]


@dataclass
class ClassStats:
    tp: int = 0
    fp: int = 0
    fn: int = 0

    @property
    def precision(self) -> float:
        return self.tp / (self.tp + self.fp) if self.tp + self.fp else 0.0

    @property
    def recall(self) -> float:
        return self.tp / (self.tp + self.fn) if self.tp + self.fn else 0.0

    @property
    def f1(self) -> float:
        total = self.precision + self.recall
        return 2 * self.precision * self.recall / total if total else 0.0


@dataclass
class Row:
    model: str
    arch: str
    license: str
    mapping: str
    size_mb: float
    precision: dict[str, float]
    recall: dict[str, float]
    ap50: dict[str, float]
    map50: float
    violation_precision: float
    violation_recall: float
    violation_f1: float
    ms_per_image: float
    peak_rss_mb: float
