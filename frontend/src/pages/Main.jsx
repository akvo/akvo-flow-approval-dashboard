import React, { useState, useEffect } from "react";
import { Row } from "antd";
import Header from "../Components/Header/Header";
import Main from "../Components/Main/Main";
import ApproveData from "../Components/ApproveData/ApproveData";
import store from "../lib/store";
import api from "../lib/api";
import useNotification from "../util/useNotification";
import { useCookies } from "react-cookie";

const MainPage = () => {
  const { notify } = useNotification();
  const [cookies] = useCookies(["AUTH_TOKEN"]);

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [approvedData, setApprovedData] = useState(null);
  const [formId, setFormId] = useState(null);

  useEffect(() => {
    api
      .get(`/form`, {
        headers: {
          Authorization: `Bearer ${cookies?.AUTH_TOKEN}`,
        },
      })
      .then((res) => {
        const { data } = res;
        setDashboardData(data);
        const id = data.map((d) => d?.id);
        const pending = data.map((d) => d?.pending);
        const approved = data.map((d) => d?.approved);
        store.update((s) => {
          s.formId = id[0];
        });
        setPendingData(pending);
        setApprovedData(approved);
        setFormId(id);
        api.setToken(cookies?.AUTH_TOKEN);
      })
      .catch((err) => {
        notify({
          type: "error",
          message: err,
        });
      });
  }, [formId, notify, cookies?.AUTH_TOKEN]);

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
