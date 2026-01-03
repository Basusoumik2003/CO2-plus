import axios from 'axios';

export const API_CONFIG = {
  ASSET_API:
    (import.meta.env.VITE_ASSET_SERVICE_URL || 'http://localhost:5000') + '/api/v1', // ✅ /api/v1 added
  AUTH_API:
    import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5002',
  NOTIFICATION_API:
    import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:5001',
};

const createApiClient = (baseURL, serviceName = 'API') => {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (import.meta.env.DEV) {
        console.log(`📤 [${serviceName}] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        localStorage.removeItem('authToken');
        if (!window.location.pathname.includes('/login')) window.location.replace('/login');
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      if (status === 403) return Promise.reject(new Error('Access forbidden.'));
      if (status === 404) return Promise.reject(new Error(`API not found: ${error.config?.url}`));
      if (status >= 500) return Promise.reject(new Error('Server error. Try again later.'));
      if (!error.response) return Promise.reject(new Error('Network error.'));
      if (error.code === 'ECONNABORTED') return Promise.reject(new Error('Request timeout.'));

      return Promise.reject(error);
    }
  );

  return client;
};

export const assetApiClient = createApiClient(API_CONFIG.ASSET_API, 'Asset Service');
export const authApiClient = createApiClient(API_CONFIG.AUTH_API, 'Auth Service');
export const notificationApiClient = createApiClient(API_CONFIG.NOTIFICATION_API, 'Notification Service');
