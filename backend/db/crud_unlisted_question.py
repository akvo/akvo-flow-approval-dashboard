from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.unlisted_question import UnlistedQuestion


def get_unlisted_by_id(session: Session, id: int) -> UnlistedQuestion:
    return session.query(UnlistedQuestion).filter(
        UnlistedQuestion.id == id).first()


def get_unlisted_by_variable(session: Session, form: int,
                             variable: str) -> UnlistedQuestion:
    return session.query(UnlistedQuestion).filter(
        and_(UnlistedQuestion.form == form,
             UnlistedQuestion.variable == variable)).first()


def add_unlisted_question(session: Session, id: int, form: int,
                          variable: str) -> None:
    unlisted_question = UnlistedQuestion(id=id, form=form, variable=variable)
    session.add(unlisted_question)
    session.commit()
    session.flush()
    session.refresh(unlisted_question)
    return unlisted_question
