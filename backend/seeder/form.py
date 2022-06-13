import pandas as pd
import json
import os
import sys
import requests as r
from db.connection import Base, SessionLocal, engine
from db.crud_form import get_form_by_id, add_form
from db.crud_question import get_question_by_id, add_question
from db.crud_unlisted_question import add_unlisted_question
import util.flow as flow
from util.auth0 import Auth0
from db.truncator import truncate

webform_url = "https://webform.akvo.org/api"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
required_unlisted = [
    "approval_status", "approval_comments", "instance_origin_id"
]

# MAPPING FILE
form_json = "./source/forms.json"
if not os.path.exists(form_json):
    print(f"ERROR: {form_json} is not exists")
    exit()
form_json = open(form_json, "r")
forms = json.load(form_json)
form_json.close()

if len(sys.argv) < 2:
    print("Please provide your user name and password")
    exit()

auth0 = Auth0()
refresh_token = auth0.get_refresh_token(username=sys.argv[1],
                                        password=sys.argv[2])


def get_frame(form_def, rename):
    form_name = form_def.get("name")
    questions = []
    question_groups = form_def.get("questionGroups")
    for qg in question_groups:
        questions += qg["questions"]
    res = pd.DataFrame(questions, columns=["id", "variableName", "name"])
    missing_vars = res[res['variableName'] != res['variableName']].to_dict(
        "records")
    for missing_var in missing_vars:
        text = missing_var["name"]
        print(f"- Missing Variables on {rename}: {form_name} {text}")
    rename = {
        "id": f"{rename}_id",
        "name": f"{rename}_name",
    }
    rename.update({"variableName": "variable_name"})
    res = res.rename(columns=rename)
    return res


truncate(session=session, table="question")
truncate(session=session, table="form")

for form in forms:
    instance = form["instance"]
    prod = form["prod"]
    prod_id = prod["form_id"]
    raw = form["raw"]
    raw_id = raw["form_id"]
    prod_def = flow.get_form_definition(prod["survey_id"], prod_id, instance,
                                        refresh_token)
    raw_def = flow.get_form_definition(raw["survey_id"], raw_id, instance,
                                       refresh_token)
    print(f"Instance Name: {instance}")
    print(f"Raw ID       : {raw_id}")
    print(f"Production ID: {prod_id}")
    raw_df = get_frame(raw_def, "raw")
    prod_df = get_frame(prod_def, "prod")
    merged = raw_df.merge(prod_df, on='variable_name')
    questions = merged.dropna().reset_index()
    questions = questions[["variable_name", "raw_id", "prod_id"]]
    questions = questions.rename(columns={"raw_id": "id"})
    questions = questions[["id", "prod_id"]]
    questions = questions.to_dict("records")
    form = get_form_by_id(session=session, id=raw_id)
    prod_webform = r.get(f"{webform_url}/generate/{instance}/{prod_id}")
    prod_webform = prod_webform.text
    if not form:
        form = add_form(session=session,
                        id=raw_id,
                        instance=instance,
                        survey_id=raw["survey_id"],
                        prod_id=prod_id,
                        url=prod_webform,
                        name=prod_def["name"])
    if form:
        form.instance = instance
        form.survey_id = raw["survey_id"]
        form.prod_id = prod_id
        form.url = prod_webform
        form.name = prod_def["name"]
        session.commit()
        session.flush()
        session.refresh(form)
    for var in required_unlisted:
        variable = prod_df[prod_df["variable_name"] == var]
        if not variable.shape[0]:
            print(f"ERROR: Required variable {var} is not available in PROD")
            exit()
        variable = variable.to_dict("records")[0]
        unlisted_question = add_unlisted_question(
            session=session,
            id=variable["prod_id"],
            form=form.id,
            variable=variable["variable_name"])
    for q in questions:
        question = get_question_by_id(session=session, id=q["id"])
        if not question:
            qid = q["id"]
            question = add_question(session=session,
                                    id=q["id"],
                                    prod_id=q["prod_id"],
                                    form=form.id)
    print("=======================")
