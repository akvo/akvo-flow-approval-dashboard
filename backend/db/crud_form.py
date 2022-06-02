from typing import List
from sqlalchemy.orm import Session
from models.form import Form, FormSummary


def get_form(session: Session) -> List[FormSummary]:
    forms = session.query(Form).all()
    forms = [f.serialize for f in forms]
    for form in forms:
        form.update({"pending": 0, "approved": 0, "rejected": 0})
    return forms


def get_form_by_id(session: Session, id: int) -> Form:
    form = session.query(Form).filter(Form.id == id).first()
    return form


def add_form(session: Session, id: int, survey_id: int, prod_id: int, url: str,
             name: str) -> Form:
    form = Form(id=id,
                survey_id=survey_id,
                prod_id=prod_id,
                url=url,
                name=name)
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form
