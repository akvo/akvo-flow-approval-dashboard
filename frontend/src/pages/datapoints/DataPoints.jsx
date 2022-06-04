import React, { useEffect, useState, useMemo } from "react";
import "./datapoints.scss";
import { Row, Col, Tabs, Table, Button } from "antd";
import { AiOutlinePlus } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { api, store } from "../../lib";

const columns = [
  {
    title: () => <span className="normalize">Sort By</span>,
    dataIndex: "name",
    width: "40%",
    ellipsis: true,
    className: "datapoint-name",
  },
  {
    title: () => <span className="normalize">Submittant</span>,
    dataIndex: "submitter",
    ellipsis: true,
    className: "submitter",
  },
  {
    title: "Submitted Date",
    dataIndex: "submitted_at",
    ellipsis: true,
  },
  {
    title: "",
    dataIndex: "",
    width: "75px",
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

const DataPoints = () => {
  const { id } = useParams();
  const { isLoggedIn } = store.useState((s) => s);
  const [data, setData] = useState({ data: [], total: 0 });
  const [selectedTab, setSelectedTab] = useState(panes[0].key);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabsChange = (activeKey) => {
    setLoading(true);
    const activePane = panes.find((p) => p.key === activeKey);
    setSelectedTab(activeKey);
    setStatus(activePane?.title.toLowerCase());
  };

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get(
          `/data?form_id=${id}&status=${status}&page=${currentPage}&perpage=10`
        )
        .then((res) => {
          const { data } = res;
          setData(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setData({ data: [], total: 0 });
        });
    }
  }, [id, status, selectedTab, currentPage, isLoggedIn]);

  const handlePaginationChange = (e) => {
    setLoading(true);
    setCurrentPage(e.current);
  };

  const TabExtraContent = useMemo(
    () => (
      <h3 className="total">
        Total:
        <small> {data?.total}</small>
      </h3>
    ),
    [data]
  );

  return (
    <div id="datapoints" className="main">
      <Row className="content-container">
        <Col span={24}>
          <div className="content">
            <Tabs
              defaultActiveKey="1"
              activeKey={selectedTab.activeKey}
              onChange={handleTabsChange}
              tabBarExtraContent={TabExtraContent}
            >
              {panes.map((p) => (
                <Tabs.TabPane tab={p.title} key={p.key} />
              ))}
            </Tabs>
            <Table
              columns={columns}
              dataSource={data?.data}
              onChange={handlePaginationChange}
              pagination={{
                current: currentPage,
                total: data?.total,
                pageSize: 10,
                showSizeChanger: false,
              }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? "row-light" : "row-dark"
              }
              loading={loading}
              rowKey="id"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DataPoints;
