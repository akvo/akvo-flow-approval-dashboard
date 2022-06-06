import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { Webform } from "akvo-react-form";
import { useParams } from "react-router-dom";
import { api, store } from "../../lib";
import { Loading } from "../../components";

const initForms = {
  forms: {
    name: "Loading",
    question_group: [],
  },
  initial_value: [],
};

const DataViews = () => {
  const { data_id } = useParams();
  const { isLoggedIn } = store.useState((s) => s);
  const [forms, setForms] = useState(initForms);
  const [loading, setLoading] = useState(true);

  const questions = forms.forms.question_group
    .map((q) => q.question)
    .flatMap((q) => q);

  const onFinish = (data) => {
    const instance = forms.forms.app;
    const payload = Object.keys(data).map((k) => {
      const q = k.split("-");
      let value = data[k];
      const question = questions.find(
        (qs) => parseInt(qs["id"]) === parseInt(q[0])
      );
      return {
        questionId: parseInt(q[0]),
        iteration: q.length === 2 ? parseInt(q[1]) : 0,
        value: value,
        answerType: question.original_type,
      };
    });
    api
      .post(`/data/${data_id}?app=${instance}`, payload, {
        "content-type": "application/json",
      })
      .then((res) => {
        console.info(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      api.get(`/data/${data_id}`).then((res) => {
        setLoading(false);
        setForms(res.data);
      });
    }
  }, [data_id, isLoggedIn]);

  return (
    <div id="dataview" className="main">
      <Loading isLoading={loading} />
      {!loading && (
        <Row className="content-container">
          <Col span={24}>
            <div className="content">
              <Webform
                onFinish={onFinish}
                forms={forms.forms}
                initialValue={forms.initial_value}
                sidebar={true}
              />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DataViews;
