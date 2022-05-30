from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from db.connection import Base
from .webform import WebFormBase


class FormBase(BaseModel):
    id: int
    name: str
    pending: int
    approved: int
    rejected: int


class FormDetail(BaseModel):
    id: int
    prod_id: int
    name: str
    url: str
    webform: WebFormBase


class Form(Base):
    __tablename__ = "form"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    prod_id = Column(Integer, unique=True)
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)

    def __init__(self, id: int, prod_id: int, url: str, name: str):
        self.id = id
        self.prod_id = prod_id
        self.url = url
        self.name = name

    def __repr__(self) -> int:
        return f"<Form {self.id}>"
