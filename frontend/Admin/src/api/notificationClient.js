import axios from 'axios';

// Prefer env URL, but fall back to local dev default
const baseURL =
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:5001';

const notificationClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT
notificationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
notificationClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do NOT clear tokens or redirect on notification errors; surface the error
    // so pages can handle gracefully without logging the user out.
    return Promise.reject(error);
  }
);

export default notificationClient;
