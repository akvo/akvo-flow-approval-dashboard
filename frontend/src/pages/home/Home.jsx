import React, { useState, useEffect, useMemo } from "react";
import "./home.scss";
import { Row, Col, message, Button } from "antd";
import { api, store } from "../../lib";
import { sumBy } from "lodash";
import { Link } from "react-router-dom";

const dataStatus = [
  {
    keyName: "pending",
    text: "Waiting for Approval",
  },
  {
    keyName: "approved",
    text: "Approved Data",
  },
  {
    keyName: "rejected",
    text: "Rejected Data",
  },
];

const Surveys = ({ data }) => {
  return (
    <Col sm={24} md={12}>
      <div className="content">
        <h1>{data.name}</h1>
        <p>
          <span className="status-title">Approved data</span>:
          <span className="status-count approved"> {data.approved}</span>
          <br />
          <span className="status-title">Pending Data</span>:
          <span className="status-count pending"> {data.pending}</span>
        </p>
        <Row justify="end">
          <Button type="primary">
            <Link
              to={`/dashboard/${data.id}`}
              state={{
                back: "dashboard",
                page: "Dashboard",
                id: data.id,
                name: data.name,
              }}
            >
              View
            </Link>
          </Button>
        </Row>
      </div>
    </Col>
  );
};

const Home = () => {
  const [surveyList, setSurveyList] = useState([]);
  const { isLoggedIn } = store.useState((s) => s);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get(`/form`)
        .then((res) => {
          const { data } = res;
          setSurveyList(data);
          store.update((s) => {
            s.surveyList = data;
          });
        })
        .catch(() => {
          message.error("Internal Server Error");
        });
    }
  }, [isLoggedIn]);

  const dataSummary = useMemo(
    () =>
      dataStatus.map((d) => {
        return { ...d, value: sumBy(surveyList, d.keyName) };
      }),
    [surveyList]
  );

  return (
    <div id="home" className="main">
      <div className="intro-container">
        <Row justify="end">
          <Col span={16}>
            <Row justify="end" gutter={[10, 10]}>
              {dataSummary.map((s, si) => (
                <Col key={si} className="approval-summary">
                  <h3>
                    {s.text}: <small className={s.keyName}>{s.value}</small>
                  </h3>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>
      <Row className="content-container" gutter={[16, 16]} justify="center">
        {surveyList.map((d, ix) => (
          <Surveys key={`data-${ix}`} data={d} />
        ))}
      </Row>
    </div>
  );
};

export default Home;
