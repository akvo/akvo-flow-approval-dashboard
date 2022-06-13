from typing import Optional, List
from sqlalchemy.orm import Session
from models.data import Data, DataStatus
from models.form import Form, FormSummary
from sqlalchemy import and_


def get_form(session: Session,
             devices: Optional[List[str]] = None) -> List[FormSummary]:
    forms = session.query(Form).all()
    forms = [f.serialize for f in forms]
    for form in forms:
        for status in DataStatus:
            data = session.query(Data)
            if not devices:
                data = data.filter(
                    and_(Data.form == form["id"],
                         Data.status == status)).count()
            if devices:
                data = data.filter(
                    and_(Data.form == form["id"], Data.status == status,
                         Data.device.in_(devices))).count()
            if status == DataStatus.pending:
                form.update({"pending": data})
            if status == DataStatus.approved:
                form.update({"approved": data})
            if status == DataStatus.rejected:
                form.update({"rejected": data})
    return forms


def get_form_by_id(session: Session, id: int) -> Form:
    form = session.query(Form).filter(Form.id == id).first()
    return form


def add_form(session: Session, id: int, instance: str, survey_id: int,
             prod_id: int, url: str, name: str) -> Form:
    form = Form(id=id,
                instance=instance,
                survey_id=survey_id,
                prod_id=prod_id,
                url=url,
                name=name)
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form
