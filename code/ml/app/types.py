from dataclasses import dataclass

from pydantic import BaseModel

Box = tuple[float, float, float, float]


@dataclass(frozen=True)
class Detection:
    label: str
    box: Box
    score: float


class Person(BaseModel):
    box: tuple[int, int, int, int]
    helmet: bool
    vest: bool
    violation: bool


class DetectResult(BaseModel):
    violation: bool
    people: list[Person]


class Health(BaseModel):
    status: str
    model: str
    classes: dict[str, list[str]]
    person_model: str | None
