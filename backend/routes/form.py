from typing import List
from fastapi.security import HTTPBearer
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from db.connection import get_session
from util.auth0 import Auth0
from util.flow import get_cascade
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
    auth0.verify(session=session, token=token.credentials)
    form = get_form(session=session)
    return form


@form_route.get("/cascade/{instance:path}/{resource:path}/{id:path}",
                summary="Cascade Reqeuest",
                tags=["Form"])
def get_cascade_resource(req: Request, instance: str, resource: str, id: int):
    cascade = get_cascade(instance=instance, resource=resource, id=id)
    if not cascade:
        return []
    return cascade
