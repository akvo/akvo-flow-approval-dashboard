from sqlalchemy.orm import Session
from models.form import Form


def get_form_by_id(session: Session, id: int) -> Form:
    form = session.query(Form).filter(Form.id == id).first()
    return form


def add_form(session: Session, id: int, prod_id: int, url: str,
             name: str) -> Form:
    form = Form(id=id, prod_id=prod_id, url=url, name=name)
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form
