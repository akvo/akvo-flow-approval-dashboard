import React from "react";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import { Row, Tabs, Table, Button } from "antd";
import { AiOutlinePlus } from "react-icons/ai";

const columns = [
  {
    title: "Sort by",
    dataIndex: "name",
  },
  {
    title: "Submittant",
    dataIndex: "submitted_by",
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
    title: "Location",
    dataIndex: "location",
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

const ServicesPage = () => {
  const data = {
    total: 20,
    per_page: 10,
    page: 1,
    data: [
      {
        id: 1,
        name: "Card Name",
        submitted_by: "Joy Ghosh",
        attachments: 4,
        submitted_date: "June, 23 2020",
        location: "Sri Lanka",
      },
    ],
  };

  return (
    <div>
      <Header />
      <Main>
        <div className="service">
          <Row>
            <h2 style={{ color: "#00AAF1" }}>Citizen services</h2>
            <Row>
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Pending data >" key="1" />
                <Tabs.TabPane tab="Citizen services >" key="2" />
              </Tabs>
            </Row>
          </Row>
        </div>
        <div className="service-overview">
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Pending data points" key="1">
              <Table columns={columns} dataSource={data.data} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Approved data points" key="2">
              <Table columns={columns} dataSource={data.data} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Rejected data points" key="3">
              <Table columns={columns} dataSource={data.data} />
            </Tabs.TabPane>
            <div className="total">
              Total:
              <span style={{ color: "#00AAF1" }}> 55</span>
            </div>
          </Tabs>
        </div>
      </Main>
    </div>
  );
};

export default ServicesPage;
