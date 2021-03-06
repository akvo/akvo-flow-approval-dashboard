from typing import List
from sqlalchemy.orm import Session
from models.question import Question


def get_question_by_id(session: Session, id: int) -> Question:
    question = session.query(Question).filter(Question.id == id).first()
    return question


def get_question_by_form(session: Session, form: int) -> List[Question]:
    questions = session.query(Question).filter(Question.form == form).all()
    return questions


def add_question(session: Session, id: int, prod_id: int,
                 form: int) -> Question:
    question = Question(id=id, prod_id=prod_id, form=form)
    session.add(question)
    session.commit()
    session.flush()
    session.refresh(question)
    return question
