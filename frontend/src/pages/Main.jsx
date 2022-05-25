import React from "react";
import { Row } from "antd";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import ApproveData from "../Components/ApproveData/ApproveData";

const MainPage = () => {
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
                  <span style={{ color: "#C7302B" }}> 225</span>
                </div>
                <div>
                  Approved data:
                  <span style={{ color: "#27AE60" }}> 55</span>
                </div>
              </Row>
            </Row>
          </div>
          <div className="data">
            <ApproveData />
            <ApproveData />
            <ApproveData />
            <ApproveData />
          </div>
        </div>
      </Main>
    </div>
  );
};

export default MainPage;
