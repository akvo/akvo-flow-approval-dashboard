from pydantic import BaseModel


class Oauth2Base(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    scope: str
    expires_in: int
    token_type: str
