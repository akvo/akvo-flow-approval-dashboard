from fastapi import APIRouter, Request, Depends, Form
from util.auth0 import Auth0
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from db.crud_user import get_user_by_email
from db.connection import get_session
from sqlalchemy.orm import Session
from models.user import UserBase
from pydantic import SecretStr

auth_route = APIRouter()
security = HTTPBearer()


@auth_route.post('/login',
                 response_model=UserBase,
                 summary="Login",
                 tags=["Auth"])
def login(
        req: Request,
        username: str = Form(...),
        password: SecretStr = Form(...),
        session: Session = Depends(get_session),
):
    auth0 = Auth0()
    token = auth0.get_token(username=username, password=password)
    id_token = token.get("id_token")
    data = auth0.verify(id_token)
    user = get_user_by_email(session=session, email=data["email"])
    if not user:
        raise HTTPException(status_code=401, detail="Not Authorized")
    data.update({
        "id_token": token.credentials,
        "is_admin": True,
        "devices": [ud.device for ud in user.devices]
    })
    return data


@auth_route.get('/profile',
                response_model=UserBase,
                summary="Check Profile",
                tags=["Auth"])
def profile(req: Request,
            session: Session = Depends(get_session),
            token: str = Depends(security)):
    auth0 = Auth0()
    data = auth0.verify(token.credentials)
    user = get_user_by_email(session=session, email=data["email"])
    if not user:
        raise HTTPException(status_code=401, detail="Not Authorized")
    data.update({
        "id_token": token.credentials,
        "is_admin": True,
        "devices": [ud.device for ud in user.devices]
    })
    return data
