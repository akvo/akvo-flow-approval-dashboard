import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { Webform } from "akvo-react-form";
import { useParams } from "react-router-dom";
import { api, store } from "../../lib";
import { Loading } from "../../components";

const DataViews = () => {
  const { data_id } = useParams();
  const { isLoggedIn } = store.useState((s) => s);
  const [forms, setForms] = useState({
    forms: {
      name: "Loading",
      question_group: [],
    },
    initial_value: [],
  });
  const [loading, setLoading] = useState(true);
  const onFinish = (data) => {
    console.info(data);
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
