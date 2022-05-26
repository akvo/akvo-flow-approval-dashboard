import React from "react";
import { Button, Col, Row } from "antd";
import { PlusOutlined, MenuOutlined } from "@ant-design/icons";
import "./header.scss";

const Header = () => {
  return (
    <div className="header">
      <Row>
        <Col>
          <Button type="primary" ghost icon={<PlusOutlined />}>
            Synchronize
          </Button>
        </Col>
        <Col>
          <Button type="primary" ghost align="end">
            <MenuOutlined />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Header;
