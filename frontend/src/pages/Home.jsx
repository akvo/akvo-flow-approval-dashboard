import React from "react";
import Login from "./Login";
import { Route, Routes, useNavigate } from "react-router";
import MainPage from "./Main";
import api from "../utils/api";
import ServicesPage from "./ServicesPage";

const Home = () => {
  const navigate = useNavigate();

  const handleOnFinish = (values) => {
    const { email, password } = values;
    if (email && password) {
      api
        .post("api/login/")
        .then(() => {
          navigate("/main-page");
        })
        .catch((err) => {
          console.info(err);
        });
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onFinish={handleOnFinish} />} />
      <Route path="/main-page" element={<MainPage />} />
      <Route path="/service-overview" element={<ServicesPage />} />
    </Routes>
  );
};

export default Home;
