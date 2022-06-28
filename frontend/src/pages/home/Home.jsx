import React, { useState, useEffect, useMemo } from "react";
import "./home.scss";
import { Row, Col, message, Button, Divider } from "antd";
import { sumBy } from "lodash";
import { Link } from "react-router-dom";
import { api, store } from "../../lib";
import { Loading } from "../../components";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();
  const routeState = {
    state: {
      breadcrumbs: [
        {
          page: "Dashboard",
          target: "/dashboard",
        },
        {
          page: data.name,
          target: `/dashboard/${data.id}`,
        },
      ],
    },
  };

  return (
    <Col
      sm={24}
      md={12}
      onClick={() => navigate(`/dashboard/${data.id}`, routeState)}
      style={{ width: "100%" }}
    >
      <div className="content">
        <h1>{data.name}</h1>
        <p>
          <span className="status-title">Approved Data</span>:
          <span className="status-count approved"> {data.approved}</span>
          <br />
          <span className="status-title">Pending Data</span>:
          <span className="status-count pending"> {data.pending}</span>
        </p>
        <Row justify="end">
          <Button type="primary" size="large" className="view-btn">
            <Link to={`/dashboard/${data.id}`} state={routeState.state}>
              View
            </Link>
          </Button>
        </Row>
      </div>
      <Divider />
    </Col>
  );
};

const Home = () => {
  const [surveyList, setSurveyList] = useState([]);
  const [loading, setLoading] = useState([]);
  const { isLoggedIn } = store.useState((s) => s);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      api
        .get(`/form`)
        .then((res) => {
          const { data } = res;
          setSurveyList(data);
        })
        .catch(() => {
          message.error("Internal Server Error");
        })
        .finally(() => {
          setLoading(false);
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
      <Loading isLoading={loading} />
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
        <Divider />
      </div>
      <Row className="content-container" gutter={[16, 16]} justify="left">
        {surveyList.map((d, ix) => (
          <Surveys key={`data-${ix}`} data={d} />
        ))}
      </Row>
    </div>
  );
};

export default Home;
