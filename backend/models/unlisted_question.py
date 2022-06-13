from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, String
from db.connection import Base
from .form import Form


class UnlistedQuestion(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    variable = Column(String, unique=True, nullable=False)
    form = Column(Integer, ForeignKey(Form.id))

    def __init__(self, id: int, variable: str):
        self.id = id
        self.variable = variable

    def __repr__(self) -> int:
        return f"<Question {self.id}>"
