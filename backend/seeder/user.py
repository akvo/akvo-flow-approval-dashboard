import os
import sys
from db.crud_user import get_user, add_user
from db.connection import Base, SessionLocal, engine

if len(sys.argv) < 2:
    print("You must provide user email")
    exit()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

email = sys.argv[1]
user = get_user(session=session, email=email)
if not user:
    user = add_user(session=session, email=email)
    print(f"Added new user: {user.email}")
else:
    print(f"{email} has already been added")
