import React, { useEffect, useState } from "react";
import "./app.scss";
import { Header } from "./components";
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useCookies } from "react-cookie";
import { message } from "antd";
import { api, store } from "./lib";
import { removeCookie } from "./util/helper";
import { Home, Login, DataPoints } from "./pages";

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
          if (location.pathname.includes("/login", "/")) {
            navigate("/dashboard", {
              state: {
                page: "Dashboard",
              },
            });
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            message.error("Your session is expired");
            removeCookie("AUTH_TOKEN");
            store.update((s) => {
              s.isLoggedIn = false;
              s.user = null;
            });
            setLoading(false);
            navigate("/login");
          }
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
          <Route path="/dashboard" element={<Home />} />
          <Route path="/dashboard/:id" element={<DataPoints />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
