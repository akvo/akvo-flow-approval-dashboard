from sqlalchemy.orm import Session
from models.unlisted_question import UnlistedQuestion


def get_by_variable(session: Session, variable: str) -> UnlistedQuestion:
    return session.query(UnlistedQuestion).filter(
        UnlistedQuestion.variable == variable).first()


def add_unlisted_question(session: Session, id: int, variable: str) -> None:
    unlisted_question = UnlistedQuestion(id=id, variable=variable)
    session.add(unlisted_question)
    session.commit()
    session.flush()
    session.refresh(unlisted_question)
    return unlisted_question
