import React, { useEffect, useState } from "react";
import "./app.scss";
import { Header } from "./components";
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useCookies } from "react-cookie";
import { message } from "antd";
import { api, store } from "./lib";
import { removeCookie } from "./util/helper";
import { Home, Login, DataPoints, DataViews, Profile } from "./pages";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const [loading, setLoading] = useState(true);

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
            location.pathname.includes(["/login", "/dashboard"]) ||
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

  return (
    <div>
      <Header />
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
    </div>
  );
};

export default App;
