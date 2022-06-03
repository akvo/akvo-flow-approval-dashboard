import React from "react";
import { Row } from "antd";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import ApproveData from "../Components/ApproveData/ApproveData";

const Dashboard = ({ pending, approved, dashboardData }) => {
  return (
    <div>
      <Header />
      <Main>
        <div className="main-page">
          <div className="pending-data">
            <Row>
              <h2>Pending data</h2>
              <Row>
                <div>
                  Waiting for approval:
                  <span style={{ color: "#C7302B" }}> {pending}</span>
                </div>
                <div>
                  Approved data:
                  <span style={{ color: "#27AE60" }}> {approved}</span>
                </div>
              </Row>
            </Row>
          </div>
          <div className="data">
            <ApproveData data={dashboardData} />
          </div>
        </div>
      </Main>
    </div>
  );
};

export default Dashboard;
