from models.user import User
from sqlalchemy.orm import Session


def get_user(session: Session, email: str) -> User:
    user = session.query(User).filter(User.email == email).first()
    return user


def add_user(session: Session, email: str) -> User:
    user = User(email=email)
    session.add(user)
    session.commit()
    session.flush()
    session.refresh(user)
    return user
