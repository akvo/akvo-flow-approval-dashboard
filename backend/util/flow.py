import requests as r
from util.auth0 import Auth0
from models.form import Form

instance_base = 'https://api-auth0.akvo.org/flow/orgs/'


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
        if qType == ['CASCADE']:
            return handle_list(data, "name")
        if qType == ['PHOTO']:
            return data.get('filename')
        if qType == 'GEO':
            return {'lat': data.get('lat'), 'long': data.get('long')}
    return None


def handle_list(data, target):
    response = []
    for value in data:
        if value.get("code"):
            response.append("{}:{}".format(value.get("code"),
                                           value.get(target)))
        else:
            response.append(value.get(target))
    return "|".join(response)


def get_page(form: Form, refresh_token: str):
    instance = form.instance
    survey_id = form.survey_id
    auth0 = Auth0()
    headers = auth0.get_headers(refresh_token=refresh_token)
    instance_uri = '{}{}'.format(instance_base, instance)
    form_instance_url = '{}/form_instances?survey_id={}&form_id={}'.format(
        instance_uri, survey_id, form.id)
    collections = fetch_all(form_instance_url, headers)
    form_definition = get_data('{}/surveys/{}'.format(instance_uri, survey_id),
                               headers)
    form_definition = form_definition.get('forms')
    form_definition = list(
        filter(lambda x: int(x['id']) == form.id,
               form_definition))[0].get('questionGroups')
    results = []
    for col in collections:
        dt = {}
        responses = []
        for c in col:
            values = col.get(c)
            if c != 'responses':
                dt.update({c: values})
            else:
                for g in form_definition:
                    answers = values.get(g['id'])
                    for q in g['questions']:
                        qid = q["id"]
                        if answers:
                            for i, a in enumerate(answers):
                                d = data_handler(a.get(qid), q["type"])
                                responses.append({
                                    "id": qid,
                                    "repeat": i,
                                    "name": q["name"],
                                    "value": d
                                })
        dt.update({"responses": responses})
        results.append(dt)
    return results
