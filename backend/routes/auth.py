from fastapi import APIRouter, Request, Depends, Form
from util.auth0 import Auth0
from fastapi.security import HTTPBearer
from db.connection import get_session
from sqlalchemy.orm import Session
from models.user import UserBase
from pydantic import SecretStr

auth_route = APIRouter()
security = HTTPBearer()
auth0 = Auth0()


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
    token = auth0.get_token(username=username, password=password)
    id_token = token.get("id_token")
    user = auth0.verify(session=session, token=id_token)
    return user


@auth_route.get('/profile',
                response_model=UserBase,
                summary="Check Profile",
                tags=["Auth"])
def profile(req: Request,
            session: Session = Depends(get_session),
            token: str = Depends(security)):
    user = auth0.verify(session=session, token=token.credentials)
    return user
