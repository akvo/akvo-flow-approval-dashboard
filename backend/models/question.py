from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer
from db.connection import Base
from .form import Form


class QuestionBase(BaseModel):
    id: int
    form: str
    prod_id: int


class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    prod_id = Column(Integer, unique=True)
    form = Column(Integer, ForeignKey(Form.id))

    def __init__(self, id: int, prod_id: int, form: int):
        self.id = id
        self.form = form
        self.prod_id = prod_id

    def __repr__(self) -> int:
        return f"<Question {self.id}>"
