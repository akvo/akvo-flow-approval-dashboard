from pydantic import BaseModel
from typing import List, TypeVar
from typing_extensions import TypedDict


class CascadeBase(BaseModel):
    id: int
    name: str


class Geolocation(TypedDict):
    lat: float
    lng: float


ValueVar = TypeVar('ValueVal', int, str, List[str], List[int], Geolocation,
                   List[CascadeBase])


class AnswerBase(BaseModel):
    questionId: str
    iteration: int
    answerType: str
    value: ValueVar

    @property
    def serialize(self):
        return {
            "questionId": self.questionId,
            "iteration": self.iteration,
            "answerType": self.answerType,
            "value": self.value
        }
