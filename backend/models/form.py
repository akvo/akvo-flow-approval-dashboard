from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from db.connection import Base
from .webform import WebFormBase


class FormBase(BaseModel):
    id: int
    name: str


class FormSummary(FormBase):
    pending: int
    approved: int
    rejected: int


class FormDetail(BaseModel):
    id: int
    instance: str
    prod_id: int
    name: str
    url: str
    webform: WebFormBase


class Form(Base):
    __tablename__ = "form"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    instance = Column(String, nullable=False)
    survey_id = Column(Integer, nullable=False)
    prod_id = Column(Integer, unique=True, nullable=False)
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)

    def __init__(self, id: int, instance: str, survey_id: int, prod_id: int,
                 url: str, name: str):
        self.id = id
        self.instance = instance
        self.survey_id = survey_id
        self.prod_id = prod_id
        self.url = url
        self.name = name

    def __repr__(self) -> int:
        return f"<Form {self.id}>"

    @property
    def serialize(self) -> FormBase:
        return {"id": self.id, "name": self.name}
