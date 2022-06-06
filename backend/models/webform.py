from enum import Enum
from typing import List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, validator
from util.model import optional


class WebformQuestionType(Enum):
    cascade = "cascade"
    caddisfly = "caddisfly"
    option = "option"
    free = "free"
    date = "date"
    photo = "photo"
    geo = "geo"


class ValidationType(Enum):
    numeric = "numeric"


class AltText(TypedDict):
    language: str
    text: str
    type: str


class Level(TypedDict):
    text: str


class Levels(TypedDict):
    level: List[Level]


@optional('maxVal', 'minVal')
class ValidationRule(BaseModel):
    allowDecimal: bool
    signed: bool
    maxVal: Optional[float] = None
    minVal: Optional[float] = None
    validationType: ValidationType


@optional('altText')
class Help(BaseModel):
    altText: Optional[List[AltText]] = []
    text: Optional[str] = ""

    @validator("text", pre=True, always=True)
    def set_text(cls, text):
        return text or ""

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []


@optional('altText')
class Option(BaseModel):
    altText: Optional[List[AltText]] = Field(..., alias="translations")
    value: str
    text: str = Field(..., alias="name")

    class Config:
        allow_population_by_field_name = True

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []


class DependencyQuestion(BaseModel):
    question: int = Field(..., alias='id')
    answerValue: List[str] = Field(..., alias='options')

    class Config:
        allow_population_by_field_name = True

    @validator("question", pre=True, always=True)
    def set_id_value(cls, question):
        return question.replace("Q", "")


@optional('altText', 'cascadeResource', 'help', 'levels', 'validationRule',
          'requireDoubleEntry', 'options', 'dependency')
class WebformQuestion(BaseModel):
    localeNameFlag: bool
    altText: Optional[List[AltText]] = []
    help: Optional[Help]
    cascadeResource: str
    id: int
    levels: Optional[Levels]
    mandatory: bool = Field(..., alias="required")
    order: int
    text: str = Field(..., alias="name")
    type: WebformQuestionType
    dependency: List[DependencyQuestion]
    options: Optional[List[Option]] = None
    validationRule: Optional[ValidationRule]
    requireDoubleEntry: Optional[bool] = None

    class Config:
        allow_population_by_field_name = True

    @validator("id", pre=True, always=True)
    def set_id_value(cls, id):
        return id.replace("Q", "")

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []

    @validator("options", pre=True, always=True)
    def set_options(cls, options):
        if options:
            return options["option"]
        return None


@optional('altText')
class WebformQuestionGroup(BaseModel):
    altText: Optional[List[AltText]] = []
    heading: str
    question: List[WebformQuestion]
    repeatable: bool

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        return altText or []


@optional('altText')
class WebFormBase(BaseModel):
    alias: str
    altText: Optional[List[AltText]] = []
    app: str
    defaultLanguageCode: str
    name: str
    questionGroup: List[WebformQuestionGroup]
    surveyGroupId: int
    surveyGroupName: str
    surveyId: int
    version: float

    @validator("altText", pre=True, always=True)
    def set_alt_text(cls, altText):
        if altText == [None]:
            return []
        return altText or []
