from collections.abc import Callable, Sequence

from .constants import (
    HELMET,
    HELMET_ABOVE_SHARE,
    HELMET_MIN_OVERLAP,
    HELMET_TOP_SHARE,
    PERSON,
    VEST,
    VEST_MIN_OVERLAP,
)
from .types import Box, Detection, DetectResult, Person


def area(box: Box) -> float:
    return max(0.0, box[2] - box[0]) * max(0.0, box[3] - box[1])


def intersection(a: Box, b: Box) -> float:
    return area((max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])))


def iou(a: Box, b: Box) -> float:
    inter = intersection(a, b)
    union = area(a) + area(b) - inter
    return inter / union if union > 0 else 0.0


def overlap_share(item: Box, person: Box) -> float:
    item_area = area(item)
    return intersection(item, person) / item_area if item_area > 0 else 0.0


def helmet_fits(person: Box, helmet: Box) -> bool:
    height = person[3] - person[1]
    center_y = (helmet[1] + helmet[3]) / 2
    in_top = person[1] - HELMET_ABOVE_SHARE * height <= center_y <= person[1] + HELMET_TOP_SHARE * height
    return in_top and overlap_share(helmet, person) >= HELMET_MIN_OVERLAP


def vest_fits(person: Box, vest: Box) -> bool:
    return overlap_share(vest, person) >= VEST_MIN_OVERLAP


def assign(persons: Sequence[Box], items: Sequence[Box], fits: Callable[[Box, Box], bool]) -> set[int]:
    owners: set[int] = set()
    for item in items:
        candidates = [index for index, person in enumerate(persons) if fits(person, item)]
        if candidates:
            owners.add(max(candidates, key=lambda index: (overlap_share(item, persons[index]), -area(persons[index]))))
    return owners


def boxes_of(detections: Sequence[Detection], label: str) -> list[Box]:
    return [detection.box for detection in detections if detection.label == label]


def to_int_box(box: Box) -> tuple[int, int, int, int]:
    return (round(box[0]), round(box[1]), round(box[2]), round(box[3]))


def build_people(detections: Sequence[Detection]) -> list[Person]:
    persons = boxes_of(detections, PERSON)
    with_helmet = assign(persons, boxes_of(detections, HELMET), helmet_fits)
    with_vest = assign(persons, boxes_of(detections, VEST), vest_fits)
    people: list[Person] = []
    for index, box in enumerate(persons):
        helmet = index in with_helmet
        vest = index in with_vest
        people.append(Person(box=to_int_box(box), helmet=helmet, vest=vest, violation=not (helmet and vest)))
    return people


def build_result(detections: Sequence[Detection]) -> DetectResult:
    people = build_people(detections)
    return DetectResult(violation=any(person.violation for person in people), people=people)
