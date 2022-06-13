import os
import sys
import json
import time
from datetime import datetime
from db.connection import Base, SessionLocal, engine
from models.form import Form
from db.crud_data import add_data, get_data_by_id, count_data
from faker import Faker
import util.flow as flow
from util.auth0 import Auth0
from db.truncator import truncate

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()


debug_records = True
fake = Faker()
approver_email = "support@akvo.org"
total = 10
if len(sys.argv) < 2:
    print("Please provide your user name and password")
    exit()

auth0 = Auth0()
refresh_token = auth0.get_refresh_token(username=sys.argv[1],
                                        password=sys.argv[2])

if "--truncate" in sys.argv:
    truncate(session=session, table="data")

forms = session.query(Form).all()
for form in forms:
    print(f"- SYNCING: {form.id} {form.name}")
    results = flow.get_page(refresh_token=refresh_token, form=form)
    new_records = 0
    for result in results:
        id = int(result["dataPointId"])
        stored_data = get_data_by_id(session=session, id=id)
        if not stored_data:
            new_records += 1
            created_at = result["submissionDate"]
            duration = result.get("duration")
            if duration:
                created_at = time.mktime(created_at.timetuple()) - duration
                created_at = datetime.fromtimestamp(created_at)
            add_data(session=session,
                     id=result["id"],
                     name=result["displayName"],
                     form=form.id,
                     submitter=result["submitter"],
                     submitted_at=result["submissionDate"],
                     created_at=created_at,
                     device=result["deviceIdentifier"],
                     value=result["responses"])
            print("  NEW SUBMISSION: {} - {}".format(
                result["deviceIdentifier"].upper(), result["dataPointId"]))
        if debug_records:
            submission_date = result["submissionDate"].strftime("%Y-%m-%dT%XZ")
            result.update({"submissionDate": submission_date})
    total_data = count_data(session=session, form=form.id)
    print(f"NEW RECORDS: {new_records}")
    print(f"TOTAL RECORDS: {total_data}\n")
    if debug_records:
        with open(f'./tmp/debug-flow-data{form.id}.json',
                  'w',
                  encoding='utf-8') as f:
            json.dump(results, f, indent=4)
