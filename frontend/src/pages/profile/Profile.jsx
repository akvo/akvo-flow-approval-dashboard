import React, { useEffect, useState, useMemo } from "react";
import "./profile.scss";
import { api, store } from "../../lib";
import {
  Col,
  Row,
  Divider,
  Form,
  Checkbox,
  Input,
  Button,
  message,
} from "antd";
import { Loading } from "../../components";
import { toTitleCase } from "../../util/helper";
import { SearchOutlined } from "@ant-design/icons";

const Profile = () => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDevice, setNewDevice] = useState(null);
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

  const displayDevices = useMemo(() => {
    if (search) {
      const result = devices.map((d) => {
        if (d.toLowerCase().includes(search.toLowerCase())) {
          return { show: true, value: d };
        }
        return { show: false, value: d };
      });
      return result;
    }
    return devices.map((x) => ({ show: true, value: x }));
  }, [devices, search]);

  useEffect(() => {
    if (search?.length) {
      const hasSearchResult = displayDevices.filter((d) => d.show);
      if (!hasSearchResult.length) {
        setNewDevice(search);
      } else {
        setNewDevice(null);
      }
    } else {
      setNewDevice(null);
    }
  }, [search, displayDevices]);

  const addNewDevice = () => {
    const currentValue = form.getFieldValue(["devices"]);
    setDevices([newDevice, ...devices]);
    setNewDevice(null);
    setSearch(null);
    form.setFieldsValue({ devices: [newDevice, ...currentValue] });
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
              <Input
                onChange={({ target }) => {
                  if (target.value.length) {
                    setSearch(target.value);
                  } else {
                    setSearch(null);
                  }
                }}
                value={search}
                size="large"
                placeholder="Search Device"
                prefix={<SearchOutlined />}
                suffix={
                  newDevice ? (
                    <Button onClick={addNewDevice}>Add to Device List</Button>
                  ) : null
                }
              />
              <Form
                form={form}
                onFinish={onFinish}
                initialValues={{ devices: user?.devices || [] }}
                className="device-list"
              >
                <Form.Item name="devices">
                  <Checkbox.Group>
                    <Row align="middle">
                      {displayDevices.map((dv, idv) => {
                        return (
                          <Col
                            xs={24}
                            sm={12}
                            md={6}
                            key={idv}
                            align="left"
                            style={{ display: dv.show ? "block" : "none" }}
                          >
                            <Checkbox value={dv.value}>{dv.value}</Checkbox>
                          </Col>
                        );
                      })}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
                <Row align="end">
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
