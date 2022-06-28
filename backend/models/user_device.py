from sqlalchemy import Column, Integer, String, ForeignKey
from db.connection import Base


class UserDevice(Base):
    __tablename__ = "user_device"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    user = Column(Integer, ForeignKey('user.id'))
    device = Column(String, nullable=False)

    def __init__(self, user: int, device: str):
        self.user = user
        self.device = device

    def __repr__(self):
        return f"<UserDevice {self.id}>"

    @property
    def lowercase(self):
        return self.device.lower()
