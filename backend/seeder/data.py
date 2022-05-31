import os
import sys
import random
from db.connection import Base, SessionLocal, engine
from models.form import Form
from models.data import DataStatus
from db.crud_data import add_data
from db.crud_user import add_user, get_user_by_email
from db.truncator import truncate
from faker import Faker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

fake = Faker()
approver_email = "support@akvo.org"
total = 10
if len(sys.argv) > 1:
    total = int(sys.argv[1])

forms = session.query(Form).all()
truncate(session=session, table="data")
for form in forms:
    for _ in range(total):
        status = random.choice(list(DataStatus))
        profile = fake.simple_profile()
        approved_by = None
        if status in [DataStatus.approved, DataStatus.rejected]:
            approved_by = get_user_by_email(session=session,
                                            email=approver_email)
            if not approved_by:
                approved_by = add_user(session=session, email=approver_email)
            approved_by = approved_by.id
        data = add_data(session=session,
                        name=fake.catch_phrase(),
                        approved_by=approved_by,
                        form=form.id,
                        submitter=profile["name"],
                        status=status,
                        device="Android Smartphone")
    print(f"Form: {form.name}, Data: {total}")
