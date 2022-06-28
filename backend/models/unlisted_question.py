from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, String
from db.connection import Base
from .form import Form


class UnlistedQuestion(Base):
    __tablename__ = "unlisted_question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey(Form.id))
    variable = Column(String, unique=True, nullable=False)

    def __init__(self, id: int, form: int, variable: str):
        self.id = id
        self.form = form
        self.variable = variable

    def __repr__(self) -> int:
        return f"<UnlistedQuestion {self.id}>"
