import os
import sys
import json
from db.connection import Base, SessionLocal, engine
from models.form import Form
# from db.truncator import truncate
from faker import Faker
import util.flow as flow
from util.auth0 import Auth0

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

fake = Faker()
approver_email = "support@akvo.org"
total = 10
if len(sys.argv) < 2:
    print("Please provide your token")
    exit()

auth0 = Auth0()
refresh_token = auth0.get_refresh_token(username=sys.argv[1],
                                        password=sys.argv[2])

forms = session.query(Form).all()
# truncate(session=session, table="data")
for form in forms:
    data = flow.get_page(refresh_token=refresh_token, form=form)
    with open(f'./tmp/debug-{form.id}.json', 'w') as f:
        json.dump(data, f)
