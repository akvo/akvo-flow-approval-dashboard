import React, { useState } from "react";
import Login from "./Login";
import { Route, Routes, useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import MainPage from "./Main";
import api from "../lib/api";
import store from "../lib/store";
import useNotification from "../util/useNotification";

const Home = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [cookies, setCookie, removeCookie] = useCookies(["AUTH_TOKEN"]);

  const handleLoginOnFinish = (values) => {
    const { email, password } = values;

    const payload = new FormData();
    payload.append("grant_type", "password");
    payload.append("username", email);
    payload.append("password", password);
    payload.append("scope", "openid email");

    api
      .post(`/login`, payload)
      .then((res) => {
        const { data } = res;
        removeCookie("AUTH_TOKEN");
        setCookie("AUTH_TOKEN", data?.id_token);
        api.setToken(cookies?.AUTH_TOKEN);
        store.update((s) => {
          s.isLoggedIn = true;
        });
        navigate("/main-page");
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
      <Route path="/main-page" element={<MainPage />} />
    </Routes>
  );
};

export default Home;
