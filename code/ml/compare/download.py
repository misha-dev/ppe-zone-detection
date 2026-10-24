import argparse
import shutil
import urllib.request
from pathlib import Path

from huggingface_hub import hf_hub_download, snapshot_download

from .constants import DATA_DIR, DATASET_REPO, DATASET_SPLIT, MODELS, PERSON_MODEL_FILE, PERSON_MODEL_URL, WEIGHTS_DIR
from .types import ModelSpec


def weights_path(spec: ModelSpec) -> Path:
    return WEIGHTS_DIR / f"{spec.name}.pt"


def download_model(spec: ModelSpec) -> Path:
    target = weights_path(spec)
    if not target.exists():
        WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(hf_hub_download(spec.repo, spec.file), target)
    return target


def download_person_model() -> Path:
    target = WEIGHTS_DIR / PERSON_MODEL_FILE
    if not target.exists():
        WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(PERSON_MODEL_URL, target)
    return target


def dataset_dir() -> Path:
    return DATA_DIR / DATASET_REPO.replace("/", "__")


def download_dataset() -> Path:
    target = dataset_dir()
    if any((target / DATASET_SPLIT / "images").glob("*")):
        return target / DATASET_SPLIT
    snapshot_download(DATASET_REPO, repo_type="dataset", local_dir=target, allow_patterns=[f"{DATASET_SPLIT}/*", "data.yaml", "README*"])
    return target / DATASET_SPLIT


def main() -> None:
    parser = argparse.ArgumentParser(description="Скачать веса моделей и тестовый набор")
    parser.add_argument("--models", nargs="*", default=[spec.name for spec in MODELS])
    parser.add_argument("--no-dataset", action="store_true")
    args = parser.parse_args()
    for spec in MODELS:
        if spec.name in args.models:
            print(f"{spec.name}: {download_model(spec)}")
    print(f"person: {download_person_model()}")
    if not args.no_dataset:
        print(f"dataset: {download_dataset()}")


if __name__ == "__main__":
    main()
