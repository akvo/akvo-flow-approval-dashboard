from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.connection import Base
from .user_device import UserDevice


class UserBase(BaseModel):
    id: int
    nickname: Optional[str] = None
    name: str
    picture: Optional[str] = None
    updated_at: str
    email: str
    email_verified: bool
    id_token: str
    devices: List[str] = []


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    email = Column(String, unique=True)
    devices = relationship(UserDevice,
                           cascade="all, delete",
                           backref="user_device.user")

    def __init__(self, email: str):
        self.email = email

    def __repr__(self):
        return f"<User {self.email}>"
