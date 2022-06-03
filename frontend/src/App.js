import React, { useEffect, useState } from "react";
import "./app.scss";
import Login from "./pages/Login";
import { Route, Routes, useNavigate, useLocation } from "react-router";
import { useCookies } from "react-cookie";
import Dashboard from "./pages/Dashboard";
import api from "./lib/api";
import store from "./lib/store";
import useNotification from "./util/useNotification";
import ServicesPage from "./pages/ServicesPage";

const App = () => {
  const { isLoggedIn, user: authUser } = store.useState((s) => s);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const location = useLocation();
  const { pathname } = location;
  const [cookies, setCookie, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [approvedData, setApprovedData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLoginOnFinish = (values) => {
    const { email, password } = values;

    const payload = new FormData();
    payload.append("username", email);
    payload.append("password", password);

    api
      .post(`/login`, payload)
      .then((res) => {
        const { data } = res;
        removeCookie("AUTH_TOKEN");
        setCookie("AUTH_TOKEN", data?.id_token);
        api.setToken(data?.id_token);
        store.update((s) => {
          s.isLoggedIn = true;
          s.user = data;
        });
        navigate("/dashboard");
      })
      .catch((err) => {
        notify({
          type: "error",
          message: err,
        });
      });
  };
  useEffect(() => {
    if (pathname !== "/login") {
      if (!authUser && !!cookies?.AUTH_TOKEN) {
        api
          .get(`/profile`, {
            headers: { Authorization: `Bearer ${cookies?.AUTH_TOKEN}` },
          })
          .then((res) => {
            if (pathname === "/") {
              navigate("/dashboard");
            }
            store.update((s) => {
              s.isLoggedIn = true;
              s.user = res?.data;
            });
            api.setToken(cookies.AUTH_TOKEN);
            setLoading(false);
          })
          .catch((err) => {
            if (err.response.status === 401) {
              notify({
                type: "error",
                message: "Your session has expired",
              });
              removeCookie("AUTH_TOKEN");
              store.update((s) => {
                s.isLoggedIn = false;
                s.user = null;
              });
            }
            setLoading(false);
          });
      } else if (!cookies?.AUTH_TOKEN) {
        setLoading(false);
      }
    } else {
      setLoading(false);
      navigate("/login");
    }
  }, [
    authUser,
    loading,
    cookies?.AUTH_TOKEN,
    pathname,
    notify,
    isLoggedIn,
    removeCookie,
    navigate,
  ]);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get(`/form`, {
          headers: { Authorization: `Bearer ${cookies?.AUTH_TOKEN}` },
        })
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
    } else {
      navigate("/login");
    }
  }, [cookies?.AUTH_TOKEN, isLoggedIn, navigate, notify]);

  return (
    <Routes>
      <Route path="/login" element={<Login onFinish={handleLoginOnFinish} />} />
      <Route
        path="/dashboard"
        element={
          <Dashboard
            pending={pendingData}
            approved={approvedData}
            dashboardData={dashboardData}
          />
        }
      />
      <Route path="/dashboard/:id" element={<ServicesPage />} />
    </Routes>
  );
};

export default App;
