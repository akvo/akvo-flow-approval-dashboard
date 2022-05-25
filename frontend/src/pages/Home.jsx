import React from "react";
import Login from "./Login";
import { Route, Routes } from "react-router";
import MainPage from "./Main";

const Home = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/main-page" element={<MainPage />} />
    </Routes>
  );
};

export default Home;
