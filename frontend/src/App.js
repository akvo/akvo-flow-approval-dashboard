import React, { useEffect, useState } from "react";
import "./app.scss";
import { Header } from "./components";
import { Route, Routes, useNavigate, useLocation } from "react-router";
import Tour from "reactour";
import { useCookies } from "react-cookie";
import { message } from "antd";
import { api, store } from "./lib";
import { removeCookie } from "./util/helper";
import { Home, Login, DataPoints, DataViews, Profile } from "./pages";
import { Link } from "react-router-dom";
import { Image } from "antd";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const [loading, setLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);

  useEffect(() => {
    if (loading && cookies?.AUTH_TOKEN) {
      api
        .get(`/profile`, {
          headers: { Authorization: `Bearer ${cookies.AUTH_TOKEN}` },
        })
        .then((res) => {
          store.update((s) => {
            s.isLoggedIn = true;
            s.user = res.data;
          });
          api.setToken(res.data.id_token);
          setLoading(false);
          if (
            ["/login", "/dashboard"].includes(location.pathname) ||
            location.pathname === "/"
          ) {
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
          }
          if (location.pathname === "/profile") {
            navigate("/profile", {
              state: {
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
              },
            });
          }
        })
        .catch(() => {
          message.error("Your session is expired");
          removeCookie("AUTH_TOKEN");
          store.update((s) => {
            s.isLoggedIn = false;
            s.user = null;
          });
          setLoading(false);
          navigate("/login");
        });
    }
    if (loading && !cookies?.AUTH_TOKEN) {
      setLoading(false);
      navigate("/login");
    }
  }, [cookies, navigate, location, loading]);

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const toggleShowMore = () => {
    setIsShowingMore(!isShowingMore);
  };

  const tourConfig = [
    {
      selector: `[data-tour="my-first-step"]`,
      content: `You will see the profile page first`,
      action: () => {
        <Link to={"/profile"} />;
      },
    },
    {
      selector: `#profile`,
      content: `You are in the profile page now. Take a tour to see`,
    },
    {
      selector: ".search_device",
      content: `Type a value`,
      action: (node) => {
        node.focus();
        node.querySelector(".ant-input").value = "Device";
      },
    },
    {
      selector: ".ant-checkbox-input",
      content: `Check a device`,
      action: (node) => {
        node.checked = true;
      },
    },
    {
      selector: ".save-btn",
      content: `Check a device`,
      action: () => {
        <Link to={"/dashboard"} />;
      },
    },
    {
      selector: `#home`,
      content: `This is the dashboard page.`,
    },
    {
      selector: `.view-btn`,
      content: `Click here to see the list of pending, approved and rejected data`,
      action: () => {
        <Link to={"/profile"} />;
      },
    },
    {
      selector: `#datapoints`,
      content: `This is a page where you can see the data.`,
    },
    {
      selector: `.add-btn`,
      content: `Click the button to see the page where you can edit data, either approve or reject data.`,
      action: () => {
        <Link to={"dashboard/611800981/650010916"} />;
      },
    },
    {
      selector: `#dataview`,
      content: () => (
        <div>
          <p>You can edit data, either approve or reject data.</p>
          <Image src="./viewData.png" />
        </div>
      ),
    },
  ];

  return (
    <div className="root-container">
      <Header
        openTour={() => setIsTourOpen(true)}
        isShowingMore={isShowingMore}
        toggleShowMore={toggleShowMore}
      />
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/dashboard/:id" element={<DataPoints />} />
          <Route path="/dashboard/:id/:data_id" element={<DataViews />} />
        </Routes>
      </div>
      <Tour
        isOpen={isTourOpen}
        onRequestClose={closeTour}
        steps={tourConfig}
        rounded={5}
        maskClassName="mask"
        accentColor={"#5cb7b7"}
      />
    </div>
  );
};

export default App;
