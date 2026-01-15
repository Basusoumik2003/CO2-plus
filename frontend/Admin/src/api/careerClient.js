import axios from 'axios';

// Prefer env URL, but fall back to local dev default
const baseURL =
  import.meta.env.VITE_CAREER_SERVICE_URL || 'http://localhost:5006';

const careerClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT
careerClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
careerClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default careerClient;
