import React, { useEffect, useState } from "react";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import { Row, Tabs, Table, Button } from "antd";
import { AiOutlinePlus } from "react-icons/ai";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import useNotification from "../util/useNotification";
import { useCookies } from "react-cookie";
import store from "../lib/store";

const ServicesPage = () => {
  const columns = [
    {
      title: "Sort by",
      dataIndex: "name",
    },
    {
      title: "Submittant",
      dataIndex: "submitter",
    },
    {
      title: "Attachments",
      dataIndex: "attachments",
    },
    {
      title: "Submittance data",
      dataIndex: "submitted_date",
    },
    {
      title: "Action",
      dataIndex: "",
      render: () => {
        return (
          <Button className="add-btn" type="primary">
            <AiOutlinePlus />
          </Button>
        );
      },
    },
  ];

  const panes = [
    {
      title: "Pending",
      key: "1",
    },
    {
      title: "Approved",
      content: "Approved",
      key: "2",
    },
    {
      title: "Rejected",
      key: "3",
    },
  ];

  const { id } = useParams();
  const { notify } = useNotification();
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const { dashboardData } = store.currentState;
  const [data, setData] = useState(null);
  const [selectTab, setSelectTab] = useState({
    activeKey: panes[0].key,
    panes,
  });
  const [status, setStatus] = useState("pending");

  const handleTabsChange = (activeKey) => {
    const activePane = panes.find((p) => p.key === activeKey);
    setSelectTab({ activeKey });
    setStatus(activePane?.title.toLowerCase());
  };

  useEffect(() => {
    api
      .get(`/data?form_id=${id}&status=${status}&page=1&perpage=10`, {
        headers: {
          Authorization: `Bearer ${cookies?.AUTH_TOKEN}`,
        },
      })
      .then((res) => {
        const { data } = res;
        setData(data);
        api.setToken(cookies?.AUTH_TOKEN);
      })
      .catch((err) => {
        notify({
          type: "error",
          message: err,
        });
      });
  }, [id, notify, cookies?.AUTH_TOKEN, status, selectTab]);

  return (
    <div>
      <Header />
      <Main>
        <div className="service">
          <Row>
            <h2 style={{ color: "#00AAF1" }}>{dashboardData[0]?.name}</h2>
            <Row>
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab={`${status} >`} key="1" />
                <Tabs.TabPane tab={`${dashboardData[0]?.name} >`} key="2" />
              </Tabs>
            </Row>
          </Row>
        </div>
        <div className="service-overview">
          <Tabs
            defaultActiveKey="1"
            activeKey={selectTab.activeKey}
            onChange={handleTabsChange}
          >
            {panes &&
              panes.map((p) => {
                return (
                  <Tabs.TabPane tab={p.title} key={p.key}>
                    <Table columns={columns} dataSource={data?.data} />
                  </Tabs.TabPane>
                );
              })}
            <div className="total">
              Total:
              <span style={{ color: "#00AAF1" }}> {data?.total}</span>
            </div>
          </Tabs>
        </div>
      </Main>
    </div>
  );
};

export default ServicesPage;
