import React from "react";
import "./profile.scss";
import store from "../../lib/store";
import { Col, Row, Checkbox } from "antd";
import { toTitleCase } from "../../util/helper";

const Profile = () => {
  const { user } = store.useState((s) => s);
  const username = user && toTitleCase(user?.nickname);

  const options = [
    {
      label: "Apple",
      value: "Apple",
    },
    {
      label: "Sumsong",
      value: "Sumsongr",
    },
    {
      label: "C",
      value: "C",
    },
    {
      label: "D",
      value: "D",
    },
    {
      label: "E",
      value: "E",
    },
    {
      label: "F",
      value: "F",
    },
    {
      label: "G",
      value: "G",
    },
    {
      label: "H",
      value: "H",
    },
    {
      label: "I",
      value: "I",
    },
    {
      label: "J",
      value: "J",
    },
    {
      label: "K",
      value: "K",
    },
    {
      label: "L",
      value: "L",
    },
    {
      label: "M",
      value: "M",
    },
    {
      label: "N",
      value: "N",
    },
    {
      label: "O",
      value: "O",
    },
  ];

  return (
    <div id="profile">
      <Col>
        <Row>
          Username: <span> {username}</span>
        </Row>
        <Row>
          Email address: <span> {user?.name}</span>
        </Row>
      </Col>
      <Col className="devices">
        <h2>Select devices</h2>
        <Row align="middle">
          <Col span={10}>
            <Checkbox.Group options={options} default={["Apple"]} />
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default Profile;
