import React from "react";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import { Row, Tabs, Table } from "antd";

const columns = [
  {
    title: "Sort by",
    dataIndex: "sort",
  },
  {
    title: "Submittant",
    dataIndex: "submittant",
  },
  {
    title: "Attachments",
    dataIndex: "attachments",
  },
  {
    title: "Submittance data",
    dataIndex: "submittance-data",
  },
  {
    title: "Location",
    dataIndex: "location",
  },
];

const ServicesPage = () => {
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
          <Row>
            <h2>Pending data points</h2>
            <div>
              Total:
              <span style={{ color: "#00AAF1" }}> 55</span>
            </div>
          </Row>
          <div>
            <Table columns={columns} />
          </div>
        </div>
      </Main>
    </div>
  );
};

export default ServicesPage;
