import React from "react";
import { Spin } from "antd";

const Loading = ({ isLoading }) => {
  if (!isLoading) {
    return "";
  }
  return (
    <div className="loading-container">
      <Spin />
    </div>
  );
};

export default Loading;
