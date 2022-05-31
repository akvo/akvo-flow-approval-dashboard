from typing import List
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from models.data import Data, DataStatus, DataBase
from sqlalchemy import desc, and_


class PaginatedData(TypedDict):
    data: List[DataBase]
    count: int


def get_data(session: Session, form: int, skip: int, status: DataStatus,
             perpage: int) -> PaginatedData:
    data = session.query(Data).filter(
        and_(Data.form == form, Data.status == status))
    count = data.count()
    data = data.order_by(desc(Data.id)).offset(skip).limit(perpage).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(session: Session, id: int) -> Data:
    data = session.query(Data).filter(Data.id == id).first()
    return data
