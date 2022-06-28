import os
import sys
import logging
from db.connection import Base, SessionLocal, engine
from db.crud_user import get_user_by_email, add_user

logging.getLogger().setLevel(logging.INFO)

if len(sys.argv) < 2:
    logging.error("You must provide user email")
    exit()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

email = sys.argv[1]
user = get_user_by_email(session=session, email=email)
if not user:
    user = add_user(session=session, email=email)
    logging.info(f"Added new user: {user.email}")
else:
    logging.warning(f"{email} has already been added")
