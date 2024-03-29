import enum
import time
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Union
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Integer, DateTime, String, Enum
from db.connection import Base
from sqlalchemy.orm import relationship
import sqlalchemy.dialects.postgresql as pg
from .user import User
from .form import Form
from .webform import WebFormBase


class DataStatus(enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'


class DataBase(BaseModel):
    id: int
    name: Optional[str] = None
    device: str
    submitter: str
    submitted_at: str
    created_at: str
    duration: int
    approved_by: Optional[str] = None


class DataValue(BaseModel):
    question: int
    repeat_index: Optional[int] = None
    value: Union[float, int, str, List[float], List[int], List[str], bool,
                 dict, None]


class DataWarning(BaseModel):
    code: int
    question: int
    message: str


class DataResponse(BaseModel):
    id: int
    form_id: int
    forms: Optional[WebFormBase] = None
    initial_value: List[DataValue]
    warning: Optional[List[DataWarning]] = None


class DataListResponse(BaseModel):
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
    submitted_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)
    approved_by = Column(Integer, ForeignKey(User.id), nullable=True)
    approved_by_user = relationship(User, foreign_keys=[approved_by])

    def __init__(self,
                 form: int,
                 device: str,
                 submitter: str,
                 submitted_at: datetime,
                 created_at: datetime,
                 status: DataStatus,
                 approved_by: int,
                 value: Optional[List[dict]] = None,
                 id: Optional[int] = None,
                 name: Optional[str] = None):
        self.id = id
        self.form = form
        self.device = device
        self.submitter = submitter
        self.created_at = created_at
        self.submitted_at = submitted_at
        self.value = value
        self.status = status
        self.approved_by = approved_by
        self.name = name

    def __repr__(self) -> int:
        return f"<Data {self.id}>"

    @property
    def serialize(self) -> DataBase:
        approved_by = self.approved_by_user.email if self.approved_by else None
        submitted_at = self.submitted_at.strftime("%Y-%m-%d %H:%M")
        created_at = self.created_at.strftime("%Y-%m-%d %H:%M")
        duration = time.mktime(self.submitted_at.timetuple()) - time.mktime(
            self.created_at.timetuple())
        return {
            "id": self.id,
            "name": self.name or "ERROR",
            "device": self.device,
            "submitter": self.submitter,
            "submitted_at": submitted_at,
            "created_at": created_at,
            "duration": duration,
            "approved_by": approved_by
        }

    @property
    def to_webform(self) -> DataResponse:
        return {
            "id": self.id,
            "form_id": self.form,
            "initial_value": self.value
        }
