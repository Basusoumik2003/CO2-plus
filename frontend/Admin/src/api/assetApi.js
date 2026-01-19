import axios from "axios";
import { ASSET_SERVICE } from "../config/services";

if (!ASSET_SERVICE) {
  console.error("❌ ASSET_SERVICE is not defined");
}

const assetClient = axios.create({
  baseURL: ASSET_SERVICE,
  timeout: 15000,
  withCredentials: true, // ✅ IMPORTANT
  headers: {
    "Content-Type": "application/json",
  },
});

assetClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default assetClient;
