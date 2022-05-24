import requests as r
from fastapi import APIRouter, HTTPException, Request, Form
from models.auth import Oauth2Base
from pydantic import SecretStr

auth_route = APIRouter()
auth_domain = "https://akvofoundation.eu.auth0.com/oauth/token"


def get_token(username: str, password: SecretStr) -> Oauth2Base:
    data = {
        "client_id": "S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS",
        "username": username,
        "password": password.get_secret_value(),
        "grant_type": "password",
        "scope": "offline_access"
    }
    req = r.post(auth_domain, data=data)
    if req.status_code != 200:
        raise HTTPException(
                status_code=401,
                detail="")
    return req.json()


@auth_route.post('/login',
                 response_model=Oauth2Base,
                 summary="Login",
                 tags=["Auth"])
def login(
    req: Request, username: str = Form(...), password: SecretStr = Form(...)
) -> Oauth2Base:
    return get_token(username=username, password=password)
