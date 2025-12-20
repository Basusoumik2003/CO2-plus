import axios from 'axios';

// 🔥 Always force /api/v1
const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1';

console.log('=================================');
console.log('🔗 Environment Variables:');
console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   MODE:', import.meta.env.MODE);
console.log('=================================');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('📤 API Request:', config.method?.toUpperCase(), fullUrl);
    console.log('   Payload:', config.data);

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 404) {
      console.error('🔍 Not Found - Check API endpoint:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
