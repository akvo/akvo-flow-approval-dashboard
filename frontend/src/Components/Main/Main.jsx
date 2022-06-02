import React from "react";
import "./main.scss";

const Main = ({ children, isLoginPage }) => {
  return (
    <div
      className="main"
      style={
        isLoginPage && {
          padding: "156px 20px",
          width: "100%",
        }
      }
    >
      {children}
    </div>
  );
};

export default Main;
