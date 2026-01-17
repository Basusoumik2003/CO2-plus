import axios from "axios";
import { ASSET_SERVICE } from "../config/services";

const assetClient = axios.create({
  baseURL: ASSET_SERVICE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

assetClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default assetClient;
