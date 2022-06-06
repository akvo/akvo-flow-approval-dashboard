from enum import Enum
from typing import List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, validator
from util.model import optional


class ReactFormQuestionType(Enum):
    cascade = "cascade"
    multiple_option = "multiple_option"
    number = "number"
    option = "option"
    text = "text"
    date = "date"
    photo = "photo"
    geo = "geo"


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


class Translations(TypedDict):
    language: str
    text: str = Field(..., alias="name")

    class Config:
        allow_population_by_field_name = True


@optional('maxVal', 'minVal')
class ValidationRule(BaseModel):
    maxVal: Optional[float] = Field(..., alias="max")
    minVal: Optional[float] = Field(..., alias="min")

    class Config:
        allow_population_by_field_name = True


@optional('translations')
class Tooltip(BaseModel):
    translations: Optional[List[Translations]] = None
    text: Optional[str] = ""

    @validator("text", pre=True, always=True)
    def set_text(cls, text):
        return text or ""

    @validator("translations", pre=True, always=True)
    def set_translations(cls, translations):
        if translations == [None]:
            return None
        return translations or None


@optional('translations')
class Option(BaseModel):
    translations: Optional[List[Translations]] = Field(...,
                                                       alias="translations")
    value: str
    text: str = Field(..., alias="name")

    class Config:
        allow_population_by_field_name = True

    @validator("translations", pre=True, always=True)
    def set_translations(cls, translations):
        if translations == [None]:
            return None
        return translations or None


class DependencyQuestion(BaseModel):
    question: int = Field(..., alias='id')
    answerValue: List[str] = Field(..., alias='options')

    class Config:
        allow_population_by_field_name = True

    @validator("question", pre=True, always=True)
    def set_id_value(cls, question):
        return question.replace("Q", "")


class CascadeApiResource(BaseModel):
    endpoint: str
    initial: Optional[int] = 0
    list: Optional[bool] = False


@optional('translations', 'cascadeResource', 'help', 'validationRule',
          'options', 'validationRule', 'dependency')
class WebformQuestion(BaseModel):
    id: int
    text: str = Field(..., alias="name")
    order: int
    type: ReactFormQuestionType
    mandatory: bool = Field(..., alias="required")
    original_type: WebformQuestionType = None
    options: Optional[List[Option]] = Field(..., alias="option")
    cascadeResource: Optional[CascadeApiResource] = Field(..., alias="api")
    dependency: List[DependencyQuestion]
    help: Optional[Tooltip] = Field(..., alias="tooltip")
    translations: Optional[List[Translations]] = None
    validationRule: ValidationRule = Field(..., alias="rule")
    localeNameFlag: bool = Field(..., alias="datapoint_name")

    class Config:
        allow_population_by_field_name = True

    @validator("id", pre=True, always=True)
    def set_id_value(cls, id):
        return id.replace("Q", "")

    @validator("translations", pre=True, always=True)
    def set_translations(cls, translations):
        if translations == [None]:
            return None
        return translations or None

    @validator("options", pre=True, always=True)
    def set_options(cls, options, values):
        if options:
            return options["option"]
        return None

    @validator("type", pre=True, always=True)
    def set_type(cls, value, values):
        if value == "free":
            return "text"
        return value

    @validator("original_type", always=True)
    def validate_original_type(cls, value, values):
        free_text = [
            ReactFormQuestionType.text, ReactFormQuestionType.multiple_option,
            ReactFormQuestionType.number
        ]
        if values["type"] in free_text:
            return "free"
        return values["type"]

    @validator("cascadeResource", pre=True, always=True)
    def validate_cascade_api(cls, value):
        if value:
            return {"endpoint": value}
        return None


@optional('translations')
class WebformQuestionGroup(BaseModel):
    translations: Optional[List[Translations]] = None
    heading: str = Field(..., alias="name")
    question: List[WebformQuestion]
    repeatable: bool

    class Config:
        allow_population_by_field_name = True

    @validator("translations", pre=True, always=True)
    def set_translations(cls, translations):
        return translations or None


@optional('translations')
class WebFormBase(BaseModel):
    alias: str
    translations: Optional[List[Translations]] = None
    app: str
    name: str
    question_group: List[WebformQuestionGroup]
    version: float

    @validator("translations", pre=True, always=True)
    def set_translations(cls, translations):
        if translations == [None]:
            return None
        return translations or None
