from math import ceil
from fastapi import Request, APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.connection import get_session
from util.auth0 import Auth0
from models.data import DataStatus, DataResponse
from db.crud_data import get_data

data_route = APIRouter()
security = HTTPBearer()
auth0 = Auth0()


@data_route.get('/data',
                response_model=DataResponse,
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
