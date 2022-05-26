from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    nickname: Optional[str] = None
    name: str
    picture: Optional[str] = None
    updated_at: str
    email: str
    email_verified: bool
    is_admin: bool
    id_token: str
