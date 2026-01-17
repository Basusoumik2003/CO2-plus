import axios from "axios";
import { NOTIFICATION_SERVICE } from "../config/services";

const notificationClient = axios.create({
  baseURL: NOTIFICATION_SERVICE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

notificationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

notificationClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      console.error("❌ Notification service unreachable");
    }
    return Promise.reject(err);
  }
);

export default notificationClient;
