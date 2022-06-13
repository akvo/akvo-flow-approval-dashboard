import React, { useEffect, useState } from "react";
import "./profile.scss";
import { api, store } from "../../lib";
import { Col, Row, Divider, Form, Checkbox, Button, message } from "antd";
import { Loading } from "../../components";
import { toTitleCase } from "../../util/helper";

const Profile = () => {
  const [form] = Form.useForm();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = store.useState((s) => s);
  const username = user && toTitleCase(user?.nickname);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get(`/device`)
        .then((res) => {
          setDevices(res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isLoggedIn]);

  const onFinish = (value) => {
    api
      .post(`/device`, value.devices)
      .then((res) => {
        message.success("Saved");
        store.update((u) => {
          u.user = { ...user, devices: res.data };
        });
      })
      .catch(() => {
        message.error("Internal Server Error");
      });
  };

  return (
    <div id="profile" className="main">
      <Loading isLoading={loading} />
      {!loading && (
        <Row className="content-container">
          <Col span={24}>
            <div className="content">
              <h1>Profile</h1>
              <p>Username: {username}</p>
              <p>Email: {user?.name}</p>
              <Divider />
              <h1>Devices</h1>
              <Form
                form={form}
                onFinish={onFinish}
                initialValues={{ devices: user?.devices || [] }}
              >
                <Form.Item name="devices">
                  <Checkbox.Group style={{ width: "100%" }}>
                    <Row align="middle">
                      {devices.map((dv, idv) => {
                        return (
                          <Col span={8} key={idv} align="left">
                            <Checkbox value={dv}>{dv}</Checkbox>
                          </Col>
                        );
                      })}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
                <Row align="middle">
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Save
                    </Button>
                  </Form.Item>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Profile;
