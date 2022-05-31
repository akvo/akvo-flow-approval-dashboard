import enum
from pydantic import BaseModel
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


class DataBase(BaseModel):
    id: int
    name: str
    device: str
    submitter: str
    approved_by: Optional[str] = None


class DataResponse(BaseModel):
    current: int
    data: List[DataBase]
    total: int
    total_page: int


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey(Form.id))
    name = Column(String, nullable=True)
    device = Column(String, nullable=False)
    value = Column(pg.ARRAY(pg.JSONB), nullable=True)
    status = Column(Enum(DataStatus), default=DataStatus.pending)
    submitter = Column(String, nullable=False)
    approved_by = Column(Integer, ForeignKey(User.id), nullable=True)
    approved_by_user = relationship(User, foreign_keys=[approved_by])

    def __init__(self,
                 form: int,
                 device: str,
                 submitter: str,
                 status: DataStatus,
                 approved_by: int,
                 value: Optional[List[dict]] = None,
                 id: Optional[int] = None,
                 name: Optional[str] = None):
        self.id = id
        self.form = form
        self.device = device
        self.submitter = submitter
        self.value = value
        self.status = status
        self.approved_by = approved_by
        self.name = name

    def __repr__(self) -> int:
        return f"<Data {self.id}>"

    @property
    def serialize(self) -> DataBase:
        approved_by = self.approved_by_user.email if self.approved_by else None
        return {
            "id": self.id,
            "name": self.name,
            "device": self.device,
            "submitter": self.submitter,
            "approved_by": approved_by
        }
