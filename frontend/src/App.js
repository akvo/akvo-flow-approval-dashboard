import React, { useEffect } from "react";
import "./app.scss";
import Login from "./pages/Login";
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useCookies } from "react-cookie";
import Dashboard from "./pages/Dashboard";
import api from "./lib/api";
import store from "./lib/store";
import useNotification from "./util/useNotification";
import ServicesPage from "./pages/ServicesPage";

const App = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [cookies, setCookie, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const location = useLocation();
  const { pathname } = location;

  const handleLoginOnFinish = (values) => {
    const { email, password } = values;

    const payload = new FormData();
    payload.append("username", email);
    payload.append("password", password);

    api
      .post(`/login`, payload)
      .then((res) => {
        const { data } = res;
        removeCookie("AUTH_TOKEN");
        setCookie("AUTH_TOKEN", data?.id_token);
        api.setToken(data?.id_token);
        store.update((s) => {
          s.isLoggedIn = true;
          s.user = data;
        });
        navigate("/dashboard");
      })
      .catch((err) => {
        notify({
          type: "error",
          message: err,
        });
      });
  };

  useEffect(() => {
    if (cookies?.AUTH_TOKEN && pathname !== "/login") {
      api
        .get(`/profile`, {
          headers: {
            Authorization: `Bearer ${cookies?.AUTH_TOKEN}`,
          },
        })
        .then(() => {
          if (pathname === "/") {
            navigate("/dashboard");
          }
          api.setToken(cookies?.AUTH_TOKEN);
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [cookies?.AUTH_TOKEN, pathname, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login onFinish={handleLoginOnFinish} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/:id" element={<ServicesPage />} />
    </Routes>
  );
};

export default App;
