from typing import List
from fastapi.security import HTTPBearer
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.connection import get_session
from util.auth0 import Auth0
from models.form import FormSummary
from db.crud_form import get_form

form_route = APIRouter()
security = HTTPBearer()
auth0 = Auth0()


@form_route.get('/form',
                response_model=List[FormSummary],
                summary="Form List",
                tags=["Form"])
def get(session: Session = Depends(get_session),
        token: str = Depends(security)):
    auth0.verify(token.credentials)
    form = get_form(session=session)
    return form
