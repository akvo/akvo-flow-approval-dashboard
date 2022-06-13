from typing import List
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.connection import get_session
from db.crud_device import get_device, add_devices
from util.auth0 import Auth0

device_route = APIRouter()
security = HTTPBearer()
auth0 = Auth0()


@device_route.get('/device',
                  response_model=List[str],
                  summary="Device List",
                  tags=["Device"])
def get(req: Request,
        session: Session = Depends(get_session),
        token: str = Depends(security)):
    auth0.verify(session=session, token=token.credentials)
    return get_device(session=session)


@device_route.post('/device',
                   response_model=List[str],
                   summary="Device List",
                   tags=["Device"])
def post(req: Request,
         devices: List[str],
         session: Session = Depends(get_session),
         token: str = Depends(security)):
    user = auth0.verify(session=session, token=token.credentials)
    add_devices(session=session, user=user.get("id"), devices=devices)
    return devices
