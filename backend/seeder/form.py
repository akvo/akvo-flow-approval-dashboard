import pandas as pd
import json
import os
import requests as r
from db.connection import Base, SessionLocal, engine
from db.crud_form import get_form_by_id, add_form
from db.crud_question import get_question_by_id, add_question

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

webform_url = "https://webform.akvo.org/api"
forms = [{
    "raw_id": 611800981,
    "prod_id": 628680982,
    "instance": "seap"
}, {
    "raw_id": 630280917,
    "prod_id": 656830977,
    "instance": "seap"
}]


def get_frame(file_id, rename):
    file_json = f"./source/mapping/editor_{file_id}.json"
    if not os.path.exists(file_json):
        print(f"ERROR: {file_json} is not exists")
        exit()
    file_json = open(file_json, "r")
    res = json.load(file_json)
    file_json.close()
    res = pd.DataFrame(res["questions"],
                       columns=["keyId", "variableName", "text", "path"])
    res["path"] = res["path"].apply(lambda x: x.split("/")[-1])
    missing_vars = res[res['variableName'] != res['variableName']].to_dict(
        "records")
    for missing_var in missing_vars:
        text = missing_var["text"]
        print(f"- Missing Variables on {rename}: {file_id} {text}")
    rename = {
        "keyId": f"{rename}_id",
        "text": f"{rename}_text",
        "path": f"{rename}_group"
    }
    rename.update({"variableName": "variable_name"})
    res = res.rename(columns=rename)
    return res


for form in forms:
    instance = form["instance"]
    prod_id = form["prod_id"]
    raw_id = form["raw_id"]
    print(f"Instance Name: {instance}")
    print(f"Raw ID       : {raw_id}")
    print(f"Production ID: {prod_id}")
    raw = get_frame(raw_id, "raw")
    prod = get_frame(prod_id, "prod")
    merged = raw.merge(prod, on='variable_name')
    webform = r.get(f"{webform_url}/generate/{instance}/{prod_id}")
    webform_id = webform.text
    webform = r.get(f"{webform_url}/form/{webform_id}")
    webform = webform.json()
    questions = merged.dropna().reset_index()
    questions = questions[["variable_name", "raw_id", "prod_id"]]
    questions = questions.rename(columns={"raw_id": "id"})
    questions = questions[["id", "prod_id"]]
    questions = questions.to_dict("records")
    form = get_form_by_id(session=session, id=raw_id)
    if not form:
        form = add_form(session=session,
                        id=raw_id,
                        prod_id=prod_id,
                        url=webform_id,
                        name=webform["name"])
    for q in questions:
        question = get_question_by_id(session=session, id=q["id"])
        if not question:
            question = add_question(session=session,
                                    id=q["id"],
                                    prod_id=q["prod_id"],
                                    form=form.id)
    print("=======================")
