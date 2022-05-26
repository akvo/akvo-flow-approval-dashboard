from fastapi import APIRouter, Request, Depends, Form
from util.auth0 import Auth0
from fastapi.security import HTTPBearer
from models.auth import Oauth2Base
from models.user import UserBase
from pydantic import SecretStr

auth_route = APIRouter()
security = HTTPBearer()


@auth_route.post('/login',
                 response_model=UserBase,
                 summary="Login",
                 tags=["Auth"])
def login(
    req: Request, username: str = Form(...), password: SecretStr = Form(...)
) -> Oauth2Base:
    auth0 = Auth0()
    token = auth0.get_token(username=username, password=password)
    id_token = token.get("id_token")
    data = auth0.verify(id_token)
    data.update({"id_token": id_token, "is_admin": True})
    return data


@auth_route.get('/profile',
                response_model=UserBase,
                summary="Check Profile",
                tags=["Auth"])
def profile(token: str = Depends(security)):
    auth0 = Auth0()
    data = auth0.verify(token.credentials)
    data.update({"id_token": token.credentials, "is_admin": True})
    return data
