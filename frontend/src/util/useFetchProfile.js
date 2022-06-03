import { useRef } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router";

export const useFetchProfile = () => {
  const navigate = useNavigate();
  const loading = useRef(false);
  const [cookies] = useCookies(["AUTH_TOKEN"]);
  const location = useLocation();
  const { pathname } = location;

  const fetchProfile = async () => {
    if (cookies?.AUTH_TOKEN && pathname !== "/login") {
      await api
        .get(`/profile`, {
          headers: {
            Authorization: `Bearer ${cookies?.AUTH_TOKEN}`,
          },
        })
        .then(() => {
          if (pathname === "/") {
            navigate("/dashboard");
          }
          api.setToken(cookies?.AUTH_TOKEN);
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
    return Promise.resolve();
  };

  return { fetchProfile, loading };
};
