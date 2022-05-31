import React, { Fragment } from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

const ApproveData = () => {
  const data = [
    {
      id: 1,
      name: "Citizen service",
      approved: 23,
      pending: 55,
    },
    {
      id: 2,
      name: "Citizen service",
      approved: 23,
      pending: 55,
    },
    {
      id: 3,
      name: "Citizen service",
      approved: 23,
      pending: 55,
    },
  ];

  return (
    <Fragment>
      {data.map((d) => {
        return (
          <div className="data-container" key={d?.id}>
            <h1>{d.name}</h1>
            <p>
              Waiting for approval:
              <span style={{ color: "#C7302B" }}> {d.approved}</span>
            </p>
            <p>
              Approved data:
              <span style={{ color: "#27AE60" }}> {d.pending}</span>
            </p>
            <div className="button">
              <Button type="primary">
                <Link to={`/dashboard/${d.id}`}>View</Link>
              </Button>
            </div>
          </div>
        );
      })}
    </Fragment>
  );
};

export default ApproveData;
