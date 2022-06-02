import React, { useState } from "react";
import { Button, Col, Row, Tabs, Avatar, Image } from "antd";
import { PlusOutlined, MenuOutlined, DownOutlined } from "@ant-design/icons";
import "./header.scss";
import store from "../../lib/store";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const Header = () => {
  const { isLoggedIn, user } = store.useState((state) => state);
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const [selectTab, setSelectTab] = useState("1");
  const [showSelect, setShowSelect] = useState(false);

  const panes = [
    {
      title: "Home",
      key: "1",
    },
    {
      title: "Service",
      key: "2",
    },
  ];

  const handleTabsChange = (activeKey) => {
    setSelectTab(activeKey);
  };

  const handleLogOut = async () => {
    store.update((s) => {
      if (cookies["AUTH_TOKEN"]) {
        removeCookie("AUTH_TOKEN", "");
      }
      s.isLoggedIn = false;
      s.user = null;
    });
    setShowSelect(false);
    navigate("/login");
  };

  return (
    <div className="header">
      <Row>
        <div className="header-menu">
          <Col>
            <Row>
              <Tabs
                defaultActiveKey="1"
                onChange={handleTabsChange}
                activeKey={selectTab}
              >
                {panes.map((p) => (
                  <Tabs.TabPane tab={p.title} key={p.key} />
                ))}
              </Tabs>
            </Row>
          </Col>
        </div>
        <Col>
          <Row>
            {isLoggedIn && (
              <div className="user">
                <span>Account</span>
                <Avatar
                  src={
                    <Image
                      src={user.picture}
                      style={{ width: "32px", height: "32px" }}
                    />
                  }
                />
                <Button onClick={() => setShowSelect(!showSelect)}>
                  <DownOutlined />
                </Button>
                {showSelect && (
                  <div className="user-option">
                    <Row>
                      <Button onClick={handleLogOut}>Log out</Button>
                    </Row>
                    <Row>
                      <Button>Log out</Button>
                    </Row>
                    <Row>
                      <Button>Log out</Button>
                    </Row>
                  </div>
                )}
              </div>
            )}
            <Button type="primary" ghost icon={<PlusOutlined />}>
              Synchronize
            </Button>
          </Row>
        </Col>
        <div className="header-menu-btn">
          <Col>
            <Button type="primary" ghost align="end">
              <MenuOutlined />
            </Button>
          </Col>
        </div>
      </Row>
    </div>
  );
};

export default Header;
