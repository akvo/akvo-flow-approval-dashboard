from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from models.data import Data, DataStatus, DataBase
from sqlalchemy import desc, and_


class PaginatedData(TypedDict):
    data: List[DataBase]
    count: int


def get_data(session: Session,
             form: int,
             skip: int,
             status: DataStatus,
             perpage: int,
             device: Optional[List[str]] = None) -> PaginatedData:
    data = session.query(Data)
    if not device:
        data = data.filter(and_(Data.form == form, Data.status == status))
    if device:
        data = data.filter(
            and_(Data.form == form, Data.status == status,
                 Data.device.in_(device)))
    count = data.count()
    data = data.order_by(desc(
        Data.submitted_at)).offset(skip).limit(perpage).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(session: Session, id: int) -> DataBase:
    return session.query(Data).filter(Data.id == id).first()


def count_data(session: Session, form: Optional[int] = None) -> int:
    if form:
        return session.query(Data).filter(Data.form == form).count()
    return session.query(Data).count()


def add_data(session: Session,
             form: int,
             device: str,
             name: str,
             submitter: str,
             submitted_at: datetime,
             created_at: datetime,
             status: Optional[DataStatus] = DataStatus.pending,
             approved_by: Optional[int] = None,
             value: Optional[List[dict]] = None,
             id: Optional[int] = None) -> DataBase:
    data = Data(id=id,
                form=form,
                device=device,
                status=status,
                value=value,
                name=name,
                submitter=submitter,
                submitted_at=submitted_at,
                created_at=created_at,
                approved_by=approved_by)
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def update_data_status(session: Session, id: int, status: DataStatus,
                       approved_by: int) -> None:
    data = session.query(Data).filter(Data.id == id).first()
    data.status = status
    data.approved_by = approved_by
    session.commit()
    session.flush()
    session.refresh(data)
    return data
