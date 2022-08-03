import os
import sys
import json
import time
import logging
from datetime import datetime
from db.connection import Base, SessionLocal, engine
from models.form import Form
from db.crud_data import add_data, get_data_by_id, count_data
import util.flow as flow
from util.auth0 import Auth0
from db.truncator import truncate

if "--info" in sys.argv:
    logging.getLogger().setLevel(logging.INFO)

FLOW_USERNAME = os.environ.get('FLOW_USERNAME')
FLOW_PASSWORD = os.environ.get('FLOW_PASSWORD')

if not FLOW_USERNAME or not FLOW_PASSWORD:
    logging.error("FLOW_USERNAME and FLOW_PASSWORD not found")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

debug_records = True
approver_email = "support@akvo.org"
total = 10

auth0 = Auth0()
refresh_token = auth0.get_refresh_token(username=FLOW_USERNAME,
                                        password=FLOW_PASSWORD)

if "--truncate" in sys.argv:
    truncate(session=session, table="data")

forms = session.query(Form).all()
for form in forms:
    logging.info(f"SYNCING: {form.id} {form.name}")
    results = flow.get_page(refresh_token=refresh_token, form=form)
    new_records = 0
    for result in results:
        id = int(result["id"])
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
            logging.info("- NEW SUBMISSION: {} - {}".format(
                result["deviceIdentifier"].upper(), result["id"]))
        if debug_records:
            try:
                submission_date = result["submissionDate"].strftime(
                    "%Y-%m-%dT%XZ")
                result.update({"submissionDate": submission_date})
            except Exception as e:
                submissionDate = result["submissionDate"]
                print(f"{e}: {submissionDate}")
    total_data = count_data(session=session, form=form.id)
    logging.info(f"NEW RECORDS: {new_records}")
    logging.info(f"TOTAL RECORDS: {total_data}\n")
    if debug_records:
        with open(f'./tmp/debug-flow-data{form.id}.json',
                  'w',
                  encoding='utf-8') as f:
            json.dump(results, f, indent=4)
