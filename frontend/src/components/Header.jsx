import React from "react";
import {
  Menu,
  Breadcrumb,
  Col,
  Row,
  Avatar,
  Image,
  Dropdown,
  Button,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { store } from "../lib";
import { Link } from "react-router-dom";
import { removeCookie } from "../util/helper";
import { take } from "lodash";

const Header = ({ openTour }) => {
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

  return [
    <div className="header" key="header">
      <div className="header-container">
        <Row align="middle" className="header-wrapper">
          <Col className="header-menu" span={16} align="left">
            <Link
              to="/dashboard"
              className="header-logo"
              state={{
                breadcrumbs: [
                  {
                    page: "Dashboard",
                    target: "/dashboard",
                  },
                ],
              }}
            >
              <Image src="/logo.svg" preview={false} />
            </Link>
          </Col>
          <Col className="user" span={8} align="right">
            <div className="user-info">
              <Dropdown
                overlay={() => (
                  <Menu
                    items={[
                      {
                        key: "profile",
                        label: (
                          <Link
                            to="/profile"
                            state={{
                              breadcrumbs: [
                                {
                                  page: "Dashboard",
                                  target: "/dashboard",
                                },
                                {
                                  page: "Profile",
                                  target: "/profile",
                                },
                              ],
                            }}
                          >
                            My Profile
                          </Link>
                        ),
                      },
                      {
                        key: "logout",
                        danger: true,
                        label: <a onClick={handleLogOut}>Sign out</a>,
                      },
                    ]}
                  />
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
                  <DownOutlined />
                </div>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </div>
    </div>,
    <div className="breadcrumb-links" key="breadcrumb-links">
      <Row justify="space-between" align="middle">
        {routeState?.breadcrumbs && (
          <Breadcrumb>
            {routeState.breadcrumbs.map((x, xi) => (
              <Breadcrumb.Item key={xi}>
                <Link
                  to={x.target}
                  state={{
                    breadcrumbs: take(routeState.breadcrumbs, xi + 1),
                  }}
                >
                  {x.page}
                </Link>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
        <Col>
          <Button onClick={openTour}>Page Tour</Button>
        </Col>
      </Row>
    </div>,
  ];
};

export default Header;
