import pytest
import sys
from sqlalchemy.orm import Session
from fastapi import FastAPI
from db.crud_user import get_user_by_email, add_user

sys.path.append("..")


class TestCrudUser():
    @pytest.mark.asyncio
    async def test_crud_user(self, app: FastAPI, session: Session) -> None:
        email = "support@akvo.org"
        user = get_user_by_email(session=session, email=email)
        assert user is None
        user = add_user(session=session, email=email)
        assert user is not None
        assert user.id == 1
        assert user.email == email
