import React from "react";
import "./login.scss";
import { Image, Button, Checkbox, Row, Col, Form, Input, message } from "antd";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { api, store } from "../../lib";
import { removeCookie } from "../../util/helper";

const Login = () => {
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["AUTH_TOKEN"]);

  const onFinish = (values) => {
    const { email, password } = values;

    const payload = new FormData();
    payload.append("username", email);
    payload.append("password", password);

    api
      .post(`/login`, payload)
      .then((res) => {
        const { data } = res;
        if (cookie?.AUTH_TOKEN) {
          removeCookie("AUTH_TOKEN");
        }
        setCookie("AUTH_TOKEN", data.id_token);
        api.setToken(data?.id_token);
        store.update((s) => {
          s.isLoggedIn = true;
          s.user = data;
        });
        navigate("/dashboard", {
          state: {
            breadcrumbs: [
              {
                page: "Dashboard",
                target: "/dashboard",
              },
            ],
          },
        });
      })
      .catch((err) => {
        message.error(err);
      });
  };

  return (
    <div id="login">
      <Row
        type="flex"
        justify="center"
        align="middle"
        style={{ minHeight: "90vh" }}
      >
        <Col align="middle" justify="center">
          <Image
            src=" https://marketing-pages.anu.edu.au/_anu/4/images/logos/2x_anu_logo_small.svg"
            stye={{ maxWidth: "20px", width: "100%" }}
            preview={false}
          />
        </Col>
        <Col span={24}>
          <Form onFinish={onFinish}>
            <div className="main-header">
              <h1>Log in to Akvo flow</h1>
            </div>
            <div className="login-container">
              <Row>
                <Col span={24}>
                  <Form.Item name="email">
                    <Input size="large" placeholder="E-mail" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="password">
                    <Input.Password
                      size="large"
                      placeholder="Your password"
                      style={{ paddingLeft: "0" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="policy-checkbox">
                <Form.Item>
                  <Checkbox>
                    I accept the terms of the offer of the
                    <a href="privacy-policy"> privacy policy</a>
                  </Checkbox>
                </Form.Item>
              </Row>
              <Row>
                <Button type="primary" htmlType="submit" size="large" block>
                  Log in
                </Button>
              </Row>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
