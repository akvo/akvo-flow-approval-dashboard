import os
import sys
# import json
from db.connection import Base, SessionLocal, engine
from models.form import Form
from db.crud_data import add_data, get_data_by_id
from faker import Faker
import util.flow as flow
from util.auth0 import Auth0
from db.truncator import truncate

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

truncate(session=session, table="data")
forms = session.query(Form).all()
for form in forms:
    print(f"SYNC: {form.id} {form.name}")
    results = flow.get_page(refresh_token=refresh_token, form=form)
    for result in results:
        data = get_data_by_id(session=session, id=int(result["dataPointId"]))
        if not data:
            data = add_data(session=session,
                            id=result["dataPointId"],
                            name=result["displayName"],
                            form=form.id,
                            submitter=result["submitter"],
                            submitted_at=result["submissionDate"],
                            device=result["deviceIdentifier"],
                            value=result["responses"])
            print("NEW SUBMISSION: {} - {}".format(
                result["deviceIdentifier"].upper(), result["displayName"]))
    # with open(f'./tmp/debug-{form.id}.json', 'w', encoding='utf-8') as f:
    #     json.dump(results, f, indent=4)
