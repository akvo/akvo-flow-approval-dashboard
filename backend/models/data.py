import enum
from typing import Optional, List
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, String, Enum
from db.connection import Base
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from .user import User
from .form import Form


class DataStatus(enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    form = Column(Integer, ForeignKey(Form.id))
    name = Column(String, nullable=True)
    device = Column(String, nullable=False)
    value = Column(pg.ARRAY(pg.JSONB), nullable=True)
    status = Column(Enum(DataStatus), default=DataStatus.pending)
    approved_by = Column(Integer, ForeignKey(User.id), nullable=True)
    approved_by_user = relationship(User, foreign_keys=[approved_by])

    def __init__(self,
                 id: int,
                 form: int,
                 device: str,
                 value: List[dict],
                 status: DataStatus,
                 approved_by: int,
                 name: Optional[str] = None):
        self.id = id
        self.form = form
        self.device = device
        self.value = value
        self.status = status
        self.approved_by = approved_by
        self.namae = name

    def __repr__(self) -> int:
        return f"<Data {self.id}>"
