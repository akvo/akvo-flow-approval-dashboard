from math import ceil
from fastapi import Request, APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.connection import get_session
from util.auth0 import Auth0
from util.flow import react_form
from models.data import DataStatus, DataResponse, DataListResponse
from db.crud_form import get_form_by_id
from db.crud_question import get_question_by_form
from db.crud_data import get_data, get_data_by_id

data_route = APIRouter()
security = HTTPBearer()
auth0 = Auth0()


@data_route.get('/data',
                response_model=DataListResponse,
                summary="Data List",
                tags=["Data"])
def get(req: Request,
        form_id: int,
        status: DataStatus,
        page: int = 1,
        perpage: int = 10,
        session: Session = Depends(get_session),
        token: str = Depends(security)):
    auth0.verify(token.credentials)
    data = get_data(session=session,
                    form=form_id,
                    status=status,
                    skip=(perpage * (page - 1)),
                    perpage=perpage)
    if not data["count"]:
        raise HTTPException(status_code=404, detail="Not found")
    total_page = ceil(data["count"] / 10) if data["count"] > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        'current': page,
        'data': [d.serialize for d in data["data"]],
        'total': data["count"],
        'total_page': total_page,
    }


@data_route.get('/data/{id:path}',
                response_model=DataResponse,
                summary="Webform Data By Datapoint ID",
                tags=["Data"])
def get_by_id(req: Request,
              id: int,
              session: Session = Depends(get_session),
              token: str = Depends(security)):
    auth0.verify(token.credentials)
    data = get_data_by_id(session=session, id=id)
    form = get_form_by_id(session=session, id=data.form)
    questions = get_question_by_form(session=session, form=form.id)
    question_map = {}
    for q in questions:
        question_map.update({q.id: q.prod_id})
    data = data.to_webform
    for value in data["initial_value"]:
        prod_question_id = question_map.get(value["question"])
        if (prod_question_id):
            value.update({"question": prod_question_id})
    webform = react_form(form)
    if not webform:
        raise HTTPException(status_code=404, detail="Not found")
    data.update({"forms": webform})
    return data
