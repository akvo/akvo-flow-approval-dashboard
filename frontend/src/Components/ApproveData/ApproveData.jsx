import React from "react";
import { Button, Col } from "antd";

const ApproveData = () => {
  return (
    <Col>
      <div className="data-container">
        <h1>Citizen services</h1>
        <p>
          Waiting for approval:
          <span style={{ color: "#C7302B" }}> 55</span>
        </p>
        <p>
          Approved data:
          <span style={{ color: "#27AE60" }}> 23</span>
        </p>
        <div className="button">
          <Button type="primary">Button</Button>
        </div>
      </div>
    </Col>
  );
};

export default ApproveData;
