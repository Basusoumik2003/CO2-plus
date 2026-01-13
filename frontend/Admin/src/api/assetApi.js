import axios from "axios";

const API_BASE = "http://localhost:5000";

export const fetchMetrics = () =>
  axios.get(`${API_BASE}/api/assets/metrics`);

export const fetchWorkflowAssets = () =>
  axios.get(`${API_BASE}/api/assets/workflow`);

export const fetchApprovedAssets = (type) =>
  axios.get(`${API_BASE}/api/assets/approved`, {
    params: { type },
  });

export const updateAssetStatus = (type, id, status) =>
  axios.patch(`${API_BASE}/api/assets/${type}/${id}/status`, {
    status,
  });
