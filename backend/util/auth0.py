import jwt
from pydantic import BaseModel
from jwt import PyJWKClient
import requests as r
from pydantic import SecretStr
from fastapi import HTTPException


class Oauth2Base(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    scope: str
    expires_in: int
    token_type: str


class Auth0():
    def __init__(self):
        self.domain = "https://akvofoundation.eu.auth0.com"
        self.auth_domain = f"{self.domain}/oauth/token"
        self.auth_jwks = f"{self.domain}/.well-known/jwks.json"
        self.client_id = "S6Pm0WF4LHONRPRKjepPXZoX1muXm1JS"

    def get_headers(self, refresh_token: str) -> dict:
        login = {
            'client_id': self.client_id,
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'scope': 'openid email'
        }
        req = r.post(self.auth_domain, data=login)
        if req.status_code != 200:
            return False
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.akvo.flow.v2+json',
            'Authorization': 'Bearer {}'.format(req.json().get('id_token'))
        }

    def get_token(self, username: str, password: SecretStr) -> Oauth2Base:
        data = {
            "client_id": self.client_id,
            "username": username,
            "password": password.get_secret_value(),
            "grant_type": "password",
            "scope": "offline_access"
        }
        req = r.post(self.auth_domain, data=data)
        if req.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Credentials")
        return req.json()

    def get_refresh_token(self, username: str, password: str) -> str:
        data = {
            "client_id": self.client_id,
            "username": username,
            "password": password,
            "grant_type": "password",
            "scope": "offline_access"
        }
        req = r.post(self.auth_domain, data=data)
        if req.status_code != 200:
            print("Invalid Credentials")
            exit()
        res = req.json()
        return res.get("refresh_token")

    def verify(self, token: str):
        jwks_client = PyJWKClient(self.auth_jwks)
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=self.client_id,
            )
        except jwt.exceptions.DecodeError:
            raise HTTPException(status_code=401, detail="Invalid Credentials")
