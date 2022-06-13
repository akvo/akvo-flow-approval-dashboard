from typing import List
from models.data import Data
from models.user_device import UserDevice
from sqlalchemy.orm import Session


def get_device(session: Session) -> List[str]:
    data_devices = session.query(Data.device).distinct().all()
    data_devices = [d.device for d in data_devices]
    user_devices = session.query(UserDevice.device).filter(
        UserDevice.device.not_in(data_devices)).distinct().all()
    user_devices = [d.device for d in user_devices]
    return data_devices + user_devices


def get_device_by_user(session: Session, user: int) -> List[str]:
    user_devices = session.query(UserDevice).filter(
        UserDevice.user == user).all()
    return [ud.lowercase for ud in user_devices]


def add_devices(session: Session, user: int, devices: List[str]) -> None:
    assigned_devices = session.query(UserDevice).filter(
        UserDevice.user == user).all()
    new_devices = []
    for device in devices:
        if device.lower() not in [ad.lowercase for ad in assigned_devices]:
            new_devices.append(UserDevice(user=user, device=device))
    for assigned in assigned_devices:
        if assigned.lowercase not in [d.lower() for d in devices]:
            session.delete(assigned)
            session.commit()
    session.add_all(new_devices)
    session.commit()
    session.flush()
