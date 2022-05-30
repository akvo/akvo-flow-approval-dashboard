from pydantic import BaseModel
from typing import Optional
from sqlalchemy import Column, Integer, String
from db.connection import Base


class UserBase(BaseModel):
    nickname: Optional[str] = None
    name: str
    picture: Optional[str] = None
    updated_at: str
    email: str
    email_verified: bool
    is_admin: bool
    id_token: str


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    email = Column(String, unique=True)

    def __init__(self, email: str):
        self.email = email

    def __repr__(self) -> int:
        return f"<User {self.email}>"
