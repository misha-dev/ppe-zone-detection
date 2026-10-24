from collections.abc import Sequence

import numpy as np

from app.ppe import iou
from app.types import Box, Detection, Person

from .constants import MATCH_IOU
from .types import ClassStats


def match(predictions: Sequence[Detection], truths: Sequence[Box]) -> list[bool]:
    used: set[int] = set()
    hits: list[bool] = []
    for prediction in sorted(predictions, key=lambda detection: -detection.score):
        scores = [(iou(prediction.box, truth), index) for index, truth in enumerate(truths) if index not in used]
        best = max(scores, default=(0.0, -1))
        hit = best[0] >= MATCH_IOU
        if hit:
            used.add(best[1])
        hits.append(hit)
    return hits


def count(predictions: Sequence[Detection], truths: Sequence[Box], stats: ClassStats) -> None:
    hits = match(predictions, truths)
    stats.tp += sum(hits)
    stats.fp += len(hits) - sum(hits)
    stats.fn += len(truths) - sum(hits)


def average_precision(scored_hits: list[tuple[float, bool]], total_truths: int) -> float:
    if total_truths == 0 or not scored_hits:
        return 0.0
    ordered = sorted(scored_hits, key=lambda item: -item[0])
    hits = np.array([hit for _, hit in ordered], dtype=float)
    tp = np.cumsum(hits)
    fp = np.cumsum(1 - hits)
    recall = np.concatenate(([0.0], tp / total_truths, [1.0]))
    precision = np.concatenate(([1.0], tp / (tp + fp), [0.0]))
    precision = np.flip(np.maximum.accumulate(np.flip(precision)))
    steps = np.where(recall[1:] != recall[:-1])[0]
    return float(np.sum((recall[steps + 1] - recall[steps]) * precision[steps + 1]))


def scored_hits(predictions: Sequence[Detection], truths: Sequence[Box]) -> list[tuple[float, bool]]:
    ordered = sorted(predictions, key=lambda detection: -detection.score)
    return list(zip((detection.score for detection in ordered), match(ordered, truths)))


def match_people(predicted: Sequence[Person], truths: Sequence[Person]) -> dict[int, int]:
    pairs = sorted(
        ((iou(tuple(p.box), tuple(t.box)), pi, ti) for pi, p in enumerate(predicted) for ti, t in enumerate(truths)),
        reverse=True,
    )
    matched: dict[int, int] = {}
    used: set[int] = set()
    for value, pi, ti in pairs:
        if value < MATCH_IOU:
            break
        if pi not in matched and ti not in used:
            matched[pi] = ti
            used.add(ti)
    return matched


def count_violations(predicted: Sequence[Person], truths: Sequence[Person], stats: ClassStats) -> None:
    matched = match_people(predicted, truths)
    caught: set[int] = set()
    for pi, person in enumerate(predicted):
        if not person.violation:
            continue
        ti = matched.get(pi)
        if ti is not None and truths[ti].violation:
            stats.tp += 1
            caught.add(ti)
        else:
            stats.fp += 1
    stats.fn += sum(1 for ti, truth in enumerate(truths) if truth.violation and ti not in caught)
