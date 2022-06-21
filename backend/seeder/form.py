import json
import re
import os
import sys
import requests as r
import pandas as pd
import logging
from db.connection import Base, SessionLocal, engine
from db.crud_form import get_form_by_id, add_form
from db.crud_question import get_question_by_id, add_question
from db.crud_unlisted_question import get_unlisted_by_id, add_unlisted_question
import util.flow as flow
from util.auth0 import Auth0
from db.truncator import truncate

if "--info" in sys.argv:
    logging.getLogger().setLevel(logging.INFO)

FLOW_USERNAME = os.environ.get('FLOW_USERNAME')
FLOW_PASSWORD = os.environ.get('FLOW_PASSWORD')

webform_url = "https://webform.akvo.org/api"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()
required_unlisted = [
    "approval_status", "approval_comments", "instance_origin_id"
]

if not FLOW_USERNAME or not FLOW_PASSWORD:
    logging.error("FLOW_USERNAME and FLOW_PASSWORD not found")

auth0 = Auth0()
refresh_token = auth0.get_refresh_token(username=FLOW_USERNAME,
                                        password=FLOW_PASSWORD)


def get_flow_json(url):
    url = r.get(f"{webform_url}/form/{url}")
    return url.json()


def get_form_url(instance: str, form_id: int):
    url = r.get(f"{webform_url}/generate/{instance}/{form_id}")
    return url.text


# MAPPING FILE
form_json = "./source/forms.json"
if not os.path.exists(form_json):
    logging.error(f"{form_json} is not exists")
    exit()
form_file = open(form_json, "r")
forms = json.load(form_file)
form_file.close()
for form in forms:
    instance = form.get("instance")
    for s in ["raw", "prod"]:
        form_id = form[s].get("form_id")
        required = [form[s].get(rq) for rq in ["name", "url", "survey_id"]]
        if None in required:
            url = get_form_url(instance, form_id)
            form[s].update({"url": url})
            flow_json = get_flow_json(url)
            form[s].update({"survey_id": flow_json.get("surveyGroupId")})
            form_name = [flow_json.get(n) for n in ["surveyGroupName", "name"]]
            form_name = " - ".join(form_name).replace("Approver", "").strip()
            form[s].update({"name": form_name})
form_file = open(form_json, "w")
form_file.write(json.dumps(forms, indent=2))
form_file.close()

if "--truncate" in sys.argv:
    truncate(session=session, table="question")
    truncate(session=session, table="form")
    truncate(session=session, table="unlisted_question")
    logging.info("TRUNCATING question, unlisted_question and form table")


def get_frame(form_def, form_name, rename):
    questions = []
    question_groups = form_def.get("questionGroups")
    for qg in question_groups:
        questions += qg["questions"]
    res = pd.DataFrame(questions, columns=["id", "variableName", "name"])
    missing_vars = res[res['variableName'] != res['variableName']].to_dict(
        "records")
    for missing_var in missing_vars:
        text = missing_var["name"]
        logging.critical(f"Missing Variables on {rename}: {form_name} {text}")
    rename = {
        "id": f"{rename}_id",
        "name": f"{rename}_name",
    }
    rename.update({"variableName": "variable_name"})
    res = res.rename(columns=rename)
    return res


for form in forms:
    instance = form["instance"]
    prod = form["prod"]
    form_name = prod.get("name").title().strip()
    form_name = re.sub(' +', ' ', form_name)
    prod_id = prod["form_id"]
    raw = form["raw"]
    raw_id = raw["form_id"]
    prod_def = flow.get_form_definition(prod["survey_id"], prod_id, instance,
                                        refresh_token)
    raw_def = flow.get_form_definition(raw["survey_id"], raw_id, instance,
                                       refresh_token)
    logging.info(f"Instance Name: {instance}")
    logging.info(f"Form Name    : {form_name}")
    logging.info(f"Raw ID       : {raw_id}")
    logging.info(f"Production ID: {prod_id}")
    raw_df = get_frame(raw_def, form_name, "raw")
    prod_df = get_frame(prod_def, form_name, "prod")
    merged = raw_df.merge(prod_df, on='variable_name')
    questions = merged.dropna().reset_index()
    questions = questions[["variable_name", "raw_id", "prod_id"]]
    questions = questions.rename(columns={"raw_id": "id"})
    questions = questions[["id", "prod_id"]]
    questions = questions.to_dict("records")
    form = get_form_by_id(session=session, id=raw_id)
    prod_webform = prod["url"]
    if form:
        form.instance = instance
        form.survey_id = raw["survey_id"]
        form.prod_id = prod_id
        form.url = prod_webform
        form.name = form_name
        session.commit()
        session.flush()
        session.refresh(form)
    if not form:
        form = add_form(session=session,
                        id=raw_id,
                        instance=instance,
                        survey_id=raw["survey_id"],
                        prod_id=prod_id,
                        url=prod_webform,
                        name=form_name)
    for var in required_unlisted:
        variable = prod_df[prod_df["variable_name"] == var]
        if not variable.shape[0]:
            logging.critical(
                f"Required variable {var} is not available in PROD")
            exit()
        variable = variable.to_dict("records")[0]
        unlisted_question = get_unlisted_by_id(session=session,
                                               id=variable["prod_id"])
        if not unlisted_question:
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
