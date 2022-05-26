import React from "react";
import "./main.scss";

const Main = ({ children, isLoginPage }) => {
  return (
    <div
      className="main"
      style={{ padding: isLoginPage ? "156px 0" : "20px", height: "92vh" }}
    >
      {children}
    </div>
  );
};

export default Main;
