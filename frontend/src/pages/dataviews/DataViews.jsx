import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { Webform } from "akvo-react-form";
import { useParams } from "react-router-dom";
import { api } from "../../lib";
import { Loading } from "../../components";

const DataViews = () => {
  const { id } = useParams();
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
    api.get(`/data/${id}`).then((res) => {
      setLoading(false);
      setForms(res.data);
    });
  }, [id]);
  return (
    <div id="dataview" className="main">
      <Row className="content-container">
        <Col span={24}>
          <div className="content">
            <Loading isLoading={loading} />
            <Webform
              onFinish={onFinish}
              forms={forms.forms}
              initialValue={forms.initial_value}
              sidebar={false}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DataViews;
