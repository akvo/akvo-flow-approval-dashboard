import React, { useState } from "react";
import { Button, Col, Row, Tabs, Avatar, Image, Menu, Dropdown } from "antd";
import { PlusOutlined, MenuOutlined, DownOutlined } from "@ant-design/icons";
import store from "../../lib/store";
import { useNavigate, Link } from "react-router-dom";
import { useCookies } from "react-cookie";

const Header = () => {
  const { isLoggedIn, user } = store.useState((state) => state);
  const userName = user?.nickname[0].toUpperCase() + user?.nickname.slice(1);
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const [selectTab, setSelectTab] = useState("1");

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
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">My Profile</Link>
      </Menu.Item>
      <Menu.Item key="handleLogOut" danger>
        <a onClick={handleLogOut}>Sign out</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="header">
      <div className="header-container">
        <Row>
          <div className="header-menu">
            <Col>
              {!isLoggedIn ? (
                <Link to="/dashboard">Home</Link>
              ) : (
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
              )}
            </Col>
          </div>
          <Col>
            <Row>
              {isLoggedIn && (
                <div className="user">
                  <span>{userName}</span>
                  <Avatar
                    src={
                      <Image
                        src={user.picture}
                        style={{ width: "32px", height: "32px" }}
                      />
                    }
                  />
                  <Dropdown overlay={userMenu}>
                    <a
                      className="ant-dropdown-link"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <DownOutlined />
                    </a>
                  </Dropdown>
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
    </div>
  );
};

export default Header;
