import React, { useEffect, useState, useMemo } from "react";
import "./datapoints.scss";
import { Row, Col, Tabs, Table, Button } from "antd";
import { AiOutlinePlus } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { api } from "../../lib";

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
    title: "Submitted Date",
    dataIndex: "submitted_at",
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

const DataPoints = () => {
  const { id } = useParams();
  const [data, setData] = useState({ data: [], total: 0 });
  const [selectedTab, setSelectedTab] = useState(panes[0].key);
  const [status, setStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabsChange = (activeKey) => {
    const activePane = panes.find((p) => p.key === activeKey);
    setSelectedTab(activeKey);
    setStatus(activePane?.title.toLowerCase());
  };

  useEffect(() => {
    api
      .get(
        `/data?form_id=${id}&status=${status}&page=${currentPage}&perpage=10`
      )
      .then((res) => {
        const { data } = res;
        setData(data);
      })
      .catch(() => {
        setData({ data: [], total: 0 });
      });
  }, [id, status, selectedTab, currentPage]);

  const handlePaginationChange = (e) => {
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
              rowKey="id"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DataPoints;
