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
import { Input } from "antd";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = store.useState((s) => s);
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const [loading, setLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tryNewDevice, setTryNewDevice] = useState(null);
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
      selector: "#root",
      content: () => (
        <div>
          <h2>Welcome to Approval Data Dashboard</h2>
          <p>
            <b>Next:</b> Configure your profile
          </p>
        </div>
      ),
    },
    {
      selector: `#root`,
      content: () => (
        <div>
          <h2>Profile Page</h2>
          <p>
            Now you are in the profile page.
            <br />
            <b>Next:</b> Find Device
          </p>
        </div>
      ),
    },
    {
      selector: `.device-list`,
      content: () => (
        <div>
          <h2>Profile Page | Device List</h2>
          <p>Find the devices you want to assign to you.</p>
          <b>Next:</b> Search / Add New Device
        </div>
      ),
    },
    {
      selector: `.search-device`,
      content: () => (
        <div>
          <h2>Profile Page | Search Device</h2>
          <p>
            Search the Device you want to assign.
            <br />
            <br />
            <i>
              Your device is not in the list? Type the device name in the search
              box, <b>Add New</b> button will show.
            </i>
          </p>
          <Input
            onChange={(e) => setTryNewDevice(e.target.value)}
            placeholder="Try to add new Device"
          />
          <b>Next:</b> Dashboard, Form List
        </div>
      ),
    },
    {
      selector: `#root`,
      content: () => (
        <div>
          <h2>Dashboard</h2>
          <p>Once you have setup the device, you can start approving data.</p>
        </div>
      ),
    },
    {
      selector: `.content`,
      content: () => (
        <div>
          <h2>Dashboard | Form List</h2>
          <p>
            Click View Button from one of the form card to go to the data list
          </p>
        </div>
      ),
    },
    {
      selector: `.content`,
      content: () => (
        <div>
          <h2>Form Data</h2>
          <p>
            Here you can see list of available data that has been submitted by
            enumerator
          </p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.ant-tabs-nav-list`,
      content: () => (
        <div>
          <h2>Form Data | Navigation Tab</h2>
          <p>
            This is the navigation to show the Form Data List filter by approval
            status
          </p>
        </div>
      ),
    },
    {
      selector: `.add-btn`,
      content: () => (
        <div>
          <h2>Form Data | View Detail</h2>
          <p>
            Click this button to navigate to the data details and start
            approving
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      if (!tourStep || tourStep === 4) {
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
      if (tourStep === 1) {
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
    }
  }, [isLoggedIn, tourStep, navigate]);

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
          <Route path="/profile" element={<Profile tryout={tryNewDevice} />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/dashboard/:id" element={<DataPoints />} />
          <Route
            path="/dashboard/:id/:data_id"
            element={<DataViews closeTour={() => setIsTourOpen(false)} />}
          />
        </Routes>
      </div>
      <Tour
        isOpen={isTourOpen}
        onRequestClose={closeTour}
        steps={tourConfig}
        rounded={5}
        maskClassName="mask"
        accentColor={"#5cb7b7"}
        getCurrentStep={setTourStep}
      />
    </div>
  );
};

export default App;
