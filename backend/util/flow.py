import requests as r
import json
from util.auth0 import Auth0
from models.form import Form
from datetime import datetime

instance_base = 'https://api-auth0.akvo.org/flow/orgs/'
webform_api = "https://webform.akvo.org/api"
webform_strings = [{
    "name": "questionGroup",
    "to": "question_group"
}, {
    "name": "answerValue",
    "to": "options"
}, {
    "name": "altText",
    "to": "translations"
}]


def get_data(uri, auth):
    return r.get(uri, headers=auth).json()


def fetch_all(url, headers, formInstances=[]):
    data = get_data(url, headers)
    next_url = data.get('nextPageUrl')
    data = data.get('formInstances')
    for d in data:
        formInstances.append(d)
    if next_url:
        fetch_all(next_url, headers, formInstances)
    return formInstances


def data_handler(data, qType):
    if data:
        if qType in ['FREE_TEXT', 'NUMBER', 'DATE']:
            return data
        if qType == 'OPTION':
            return handle_list(data, "text")
        if qType == 'CASCADE':
            return handle_list(data, "name")
        if qType == 'PHOTO':
            return data.get('filename')
        if qType == 'GEO':
            return {'lat': data.get('lat'), 'lng': data.get('long')}
    return None


def handle_list(data, target):
    response = []
    for value in data:
        if value.get("code"):
            response.append("{}:{}".format(value.get("code"),
                                           value.get(target)))
        else:
            response.append(value.get(target))
    return response


def handle_date(ds: str):
    return datetime.strptime(ds, '%Y-%m-%dT%XZ')


def get_page(form: Form, refresh_token: str):
    instance = form.instance
    survey_id = form.survey_id
    auth0 = Auth0()
    headers = auth0.get_headers(refresh_token=refresh_token)
    instance_uri = '{}{}'.format(instance_base, instance)
    form_instance_url = '{}/form_instances?survey_id={}&form_id={}'.format(
        instance_uri, survey_id, form.id)
    collections = fetch_all(form_instance_url, headers, [])
    form_definition = get_data('{}/surveys/{}'.format(instance_uri, survey_id),
                               headers)
    form_definition = form_definition.get('forms')
    form_definition = list(
        filter(lambda x: int(x['id']) == form.id,
               form_definition))[0].get('questionGroups')
    questions = []
    for question_group in form_definition:
        questions += question_group["questions"]
    for collection in collections:
        groups = collection.get("responses")
        responses = []
        for group_id in groups:
            for repeat, group_list in enumerate(groups[group_id]):
                for question_id in group_list:
                    value = groups[group_id][repeat][question_id]
                    question = list(
                        filter(lambda x: x["id"] == question_id, questions))
                    qtype = question[0]["type"]
                    responses.append({
                        "question": question_id,
                        "repeat_index": repeat,
                        "value": data_handler(value, qtype)
                    })
        submissionDate = handle_date(collection.get("submissionDate"))
        collection.update({
            "responses": responses,
            "submissionDate": submissionDate,
            "duration": collection.get("surveyalTime")
        })
    return collections


def get_form_definition(survey_id: int, form_id: int, instance: str,
                        refresh_token: str):
    auth0 = Auth0()
    headers = auth0.get_headers(refresh_token=refresh_token)
    instance_uri = '{}{}'.format(instance_base, instance)
    form_definition = get_data('{}/surveys/{}'.format(instance_uri, survey_id),
                               headers)
    form_definition = form_definition.get('forms')
    form_definition = list(
        filter(lambda x: int(x['id']) == form_id, form_definition))[0]
    return form_definition


def react_form(form):
    webform = r.get(f"{webform_api}/form/{form.url}")
    if webform.status_code != 200:
        return False
    webform = webform.json()
    webform = json.dumps(webform)
    for strings in webform_strings:
        webform = webform.replace(strings["name"], strings["to"])
    webform = json.loads(webform)
    alias = webform["alias"]
    for ig, qg in enumerate(webform["question_group"]):
        for iq, q in enumerate(qg["question"]):
            if q.get("options"):
                if q.get("options").get("allowMultiple"):
                    q.update({"type": "multiple_option"})
            if q.get("validationRule"):
                if q.get("validationRule").get("validationType") == "numeric":
                    q.update({"type": "number"})
            if q.get("type") == "cascade":
                resource = q.get("cascadeResource")
                endpoint = f"/api/cascade/{alias}/{resource}"
                q.update({"cascadeResource": endpoint})
    return webform


def get_cascade_value(cascade_url: str, payload: str):
    cascade_url = cascade_url.replace("api/cascade/", "cascade-path/")
    cascade_query = [str(v).split(":")[0] for v in payload]
    cascade_query = [f"q={v}&" for v in cascade_query]
    cascade_query = "".join(cascade_query)
    cascade_url = f"{webform_api}/{cascade_url}?{cascade_query}"
    result = r.get(cascade_url)
    if result.status_code != 200:
        return False
    result = result.json()
    return [c["id"] for c in result]


def get_cascade(instance: str, resource: str, id: int):
    cascade = r.get(f"{webform_api}/cascade/{instance}/{resource}/{id}")
    if cascade:
        return cascade.json()
    return None
