import requests as r
from pydantic import BaseModel
from typing import List, TypeVar
from typing_extensions import TypedDict
from util.flow import webform_api


class CascadeBase(BaseModel):
    id: int
    api: str


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
        answer = {
            "questionId": self.questionId,
            "iteration": self.iteration,
            "answerType": self.answerType,
            "value": self.value
        }
        if (self.answerType == "cascade"):
            new_value = []
            for v in self.value:
                api = v.api.replace("/api/", "")
                req = r.get(f"{webform_api}/{api}")
                dt = list(filter(lambda x: x["id"] == v.id, req.json()))[0]
                new_value.append({"id": v.id, "name": dt["name"]})
            answer.update({"value": new_value})
        return answer


class SubmissionBase(BaseModel):
    instance: str
    version: int
    answers: List[AnswerBase]
