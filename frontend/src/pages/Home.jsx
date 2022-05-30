import React, { useEffect } from "react";
import Login from "./Login";
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useCookies } from "react-cookie";
import MainPage from "./Main";
import api from "../lib/api";
import store from "../lib/store";
import useNotification from "../util/useNotification";
import ServicesPage from "./ServicesPage";

const Home = () => {
  const location = useLocation();
  const { pathname } = location;

  const navigate = useNavigate();
  const { notify } = useNotification();
  const [cookies, setCookie, removeCookie] = useCookies(["AUTH_TOKEN"]);

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
        navigate("/main-dashboard");
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
        .get(`/profile`)
        .then(() => {
          notify({
            type: "success",
            message: "You are already logged in",
          });
        })
        .catch((err) => {
          notify({
            type: "error",
            message: err,
          });
        });
    } else {
      navigate("/login");
    }
  }, [cookies?.AUTH_TOKEN, navigate, notify, pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login onFinish={handleLoginOnFinish} />} />
      <Route path="/main-dashboard" element={<MainPage />} />
      <Route path="/main-dashboard/:id" element={<ServicesPage />} />
    </Routes>
  );
};

export default Home;
