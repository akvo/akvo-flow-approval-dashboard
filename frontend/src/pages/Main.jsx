import React, { useState, useEffect } from "react";
import { Row } from "antd";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import ApproveData from "../Components/ApproveData/ApproveData";
import api from "../lib/api";
import useNotification from "../util/useNotification";
import { useCookies } from "react-cookie";
import store from "../lib/store";

const MainPage = () => {
  const { notify } = useNotification();
  const [cookies] = useCookies(["AUTH_TOKEN"]);

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [approvedData, setApprovedData] = useState(null);

  useEffect(() => {
    api
      .get(`/form`)
      .then((res) => {
        const { data } = res;
        setDashboardData(data);
        const pending = data.map((d) => d?.pending);
        const approved = data.map((d) => d?.approved);
        setPendingData(pending);
        setApprovedData(approved);
        store.update((s) => {
          s.dashboardData = data;
        });
        api.setToken(cookies?.AUTH_TOKEN);
      })
      .catch((err) => {
        notify({
          type: "error",
          message: err,
        });
      });
  }, [notify, cookies?.AUTH_TOKEN]);

  return (
    <div>
      <Header />
      <Main>
        <div className="main-page">
          <div className="pending-data">
            <Row>
              <h2>Pending data</h2>
              <Row>
                <div>
                  Waiting for approval:
                  <span style={{ color: "#C7302B" }}> {pendingData}</span>
                </div>
                <div>
                  Approved data:
                  <span style={{ color: "#27AE60" }}> {approvedData}</span>
                </div>
              </Row>
            </Row>
          </div>
          <div className="data">
            <ApproveData data={dashboardData} />
          </div>
        </div>
      </Main>
    </div>
  );
};

export default MainPage;
