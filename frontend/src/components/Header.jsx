import React from "react";
import {
  Button,
  Menu,
  Breadcrumb,
  Col,
  Row,
  Avatar,
  Image,
  Dropdown,
} from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { store } from "../lib";
import { Link } from "react-router-dom";
import { removeCookie } from "../util/helper";

const Header = () => {
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
  const { isLoggedIn, user } = store.useState((state) => state);
  const userName = user?.nickname[0].toUpperCase() + user?.nickname.slice(1);

  const handleLogOut = () => {
    removeCookie("AUTH_TOKEN");
    store.update((s) => {
      s.isLoggedIn = false;
      s.user = null;
    });
    navigate("/login");
  };

  if (!isLoggedIn) {
    return "";
  }

  return (
    <div className="header">
      <div className="header-container">
        <Row align="middle">
          <Col className="header-menu" span={12} align="left">
            <Breadcrumb>
              {routeState?.page && (
                <Breadcrumb.Item>
                  <Link
                    to={routeState?.page?.toLowerCase()}
                    state={{ page: "Dashboard" }}
                  >
                    {routeState?.page}
                  </Link>
                </Breadcrumb.Item>
              )}
              {routeState?.name && (
                <Breadcrumb.Item>{routeState?.name}</Breadcrumb.Item>
              )}
            </Breadcrumb>
          </Col>
          <Col className="user" span={12} align="right">
            <Dropdown
              overlay={() => (
                <Menu>
                  <Menu.Item key="profile">
                    <Link to="/profile">My Profile</Link>
                  </Menu.Item>
                  <Menu.Item key="handleLogOut" danger>
                    <a onClick={handleLogOut}>Sign out</a>
                  </Menu.Item>
                </Menu>
              )}
              placement="bottomRight"
              arrow
            >
              <div>
                <span>{userName}</span>
                <Avatar
                  src={
                    <Image
                      src={user.picture}
                      style={{ width: "32px", height: "32px" }}
                      preview={false}
                    />
                  }
                />
              </div>
            </Dropdown>
          </Col>
          <Col className="header-menu-btn">
            <Button type="primary" ghost align="end">
              <MenuOutlined />
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Header;
