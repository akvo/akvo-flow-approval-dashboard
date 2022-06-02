import React from "react";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import { Button, Checkbox, Row, Form, Input } from "antd";

const Login = ({ onFinish }) => {
  return (
    <div>
      <Header />
      <Main isLoginPage={true}>
        <div className="main_container">
          <Form onFinish={onFinish}>
            <div className="main_header">
              <h1>Log in to Akvo flow</h1>
            </div>
            <div className="login_input">
              <Row>
                <Form.Item name="email">
                  <Input size="large" placeholder="E-mail" />
                </Form.Item>
              </Row>
              <Row>
                <Form.Item name="password">
                  <Input.Password
                    placeholder="Your password"
                    style={{ paddingLeft: "0" }}
                  />
                </Form.Item>
              </Row>
              <Row>
                <Form.Item>
                  <Checkbox>
                    I accept the terms of the offer of the
                    <a href="privacy-policy"> privacy policy</a>
                  </Checkbox>
                </Form.Item>
              </Row>
              <Row>
                <Button type="primary" htmlType="submit" block>
                  Log in
                </Button>
              </Row>
            </div>
          </Form>
        </div>
      </Main>
    </div>
  );
};

export default Login;
