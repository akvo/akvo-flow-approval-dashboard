import time
from math import ceil
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from fastapi import Request, Response
from starlette.status import HTTP_204_NO_CONTENT
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.connection import get_session
from util.auth0 import Auth0
from util.flow import react_form, webform_api
from models.data import DataStatus, DataResponse, DataListResponse
from models.submission import SubmissionBase
from db.crud_form import get_form_by_id
from db.crud_question import get_question_by_form
from db.crud_data import get_data, get_data_by_id, update_data_status
from db.crud_unlisted_question import get_unlisted_by_variable
import requests as r

data_route = APIRouter()
security = HTTPBearer()
auth0 = Auth0()


def transform_to_id_prod(data, questions):
    question_map = {}
    for q in questions:
        question_map.update({q.id: q.prod_id})
    data = data.to_webform
    for value in data["initial_value"]:
        prod_question_id = question_map.get(int(value["question"]))
        if prod_question_id:
            value.update({"question": prod_question_id})
    return data


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
    user = auth0.verify(session=session, token=token.credentials)
    data = get_data(session=session,
                    form=form_id,
                    status=status,
                    skip=(perpage * (page - 1)),
                    perpage=perpage,
                    device=user.get("devices"))
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
                response_model_exclude_none=True,
                summary="Webform Data By Datapoint ID",
                tags=["Data"])
def get_by_id(req: Request,
              id: int,
              token: str = Depends(security),
              session: Session = Depends(get_session)):
    auth0.verify(session=session, token=token.credentials)
    data = get_data_by_id(session=session, id=id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    form = get_form_by_id(session=session, id=data.form)
    questions = get_question_by_form(session=session, form=form.id)
    data = transform_to_id_prod(data, questions)
    webform = react_form(form)
    if not webform:
        raise HTTPException(status_code=404, detail="Not found")
    qtype = {}
    for question_group in webform.get("question_group"):
        for question in question_group.get("question"):
            qid = question["id"].replace("Q", "")
            qtype.update({int(qid): question["type"]})
    for val in data["initial_value"]:
        val.update({"question": int(val["question"])})
        if qtype.get(val["question"]) == "option":
            val.update({"value": val["value"][0]})
        if qtype.get(val["question"]) == "cascade":
            val.update(
                {"value": [int(str(v).split(":")[0]) for v in val["value"]]})
    data.update({"forms": webform})
    return data


@data_route.post('/data/{id:path}',
                 summary="Approve Datapoint ID",
                 status_code=HTTP_204_NO_CONTENT,
                 tags=["Data"])
def update_data(req: Request,
                payload: SubmissionBase,
                id: int,
                token: str = Depends(security),
                session: Session = Depends(get_session)):
    user = auth0.verify(session=session, token=token.credentials)
    data = get_data_by_id(session=session, id=id)
    form = get_form_by_id(session=session, id=data.form)
    datapoint_id = "-".join(str(uuid4()).split("-")[1:4])
    duration = time.mktime(data.submitted_at.timetuple()) - time.mktime(
        data.created_at.timetuple())
    status_question = get_unlisted_by_variable(session=session,
                                               form=form.id,
                                               variable="approval_status")
    instance_question = get_unlisted_by_variable(session=session,
                                                 form=form.id,
                                                 variable="instance_origin_id")
    responses = [p.serialize for p in payload.answers]
    status = list(
        filter(lambda x: int(x["questionId"]) == status_question.id,
               responses))
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    status = getattr(DataStatus, status[0]["value"].lower())
    responses += [{
        "questionId": instance_question.id,
        "iteration": 0,
        "answerType": "FREE_TEXT",
        "value": id
    }]
    payload_request = {
        "responses": responses,
        "dataPointId": datapoint_id,
        "deviceId": data.device,
        "dataPointName": f"{data.id} - {data.name}",
        "formId": form.prod_id,
        "formVersion": payload.version,
        "submissionStart": int(data.created_at.timestamp() * 1000),
        "submissionStop": int(data.submitted_at.timestamp() * 1000),
        "duration": duration,
        "submissionDate": data.submitted_at.strftime("%Y-%m-%dT%XZ"),
        "username": data.submitter,
        "uuid": str(uuid4()),
        "instance": payload.instance
    }
    result = r.post(f"{webform_api}/submit-form", json=payload_request)
    if result.status_code != 200:
        raise HTTPException(status_code=404, detail="Not found")
    update_data_status(session=session,
                       id=data.id,
                       status=status,
                       approved_by=user.get("id"))
    return Response(status_code=HTTP_204_NO_CONTENT)
