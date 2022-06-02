import React from "react";
import "./main.scss";

const Main = ({ children, isLoginPage }) => {
  return (
    <div
      className="main"
      style={{ padding: isLoginPage ? "156px 20px" : "20px" }}
    >
      {children}
    </div>
  );
};

export default Main;
