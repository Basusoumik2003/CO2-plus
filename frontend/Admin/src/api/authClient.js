import axios from "axios";
import { AUTH_SERVICE } from "../config/services";

let isRedirecting = false;

const authClient = axios.create({
  baseURL: AUTH_SERVICE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// cookie helper
const getCookie = (name) =>
  document.cookie.split("; ").find((row) => row.startsWith(name + "="))?.split("=")[1];

// attach token
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken") || getCookie("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global 401 handling
authClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      console.warn("⚠️ Session expired. Redirecting to login.");

      localStorage.clear();
      document.cookie = "authToken=; Max-Age=0; path=/";

      setTimeout(() => {
        window.location.href = "/login";
        isRedirecting = false;
      }, 100);
    }
    return Promise.reject(err);
  }
);

export default authClient;
