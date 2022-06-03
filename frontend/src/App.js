import React from "react";
import "./app.scss";
import Login from "./pages/Login";
import { Route, Routes, useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import Dashboard from "./pages/Dashboard";
import api from "./lib/api";
import store from "./lib/store";
import useNotification from "./util/useNotification";
import ServicesPage from "./pages/ServicesPage";

const App = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [setCookie, removeCookie] = useCookies(["AUTH_TOKEN"]);

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

  return (
    <Routes>
      <Route path="/login" element={<Login onFinish={handleLoginOnFinish} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/:id" element={<ServicesPage />} />
    </Routes>
  );
};

export default App;
