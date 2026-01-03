import axios from 'axios';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Include cookies in requests
});

let isRedirecting = false;

// ✅ Helper function to read cookies
function getCookie(name) {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

// ✅ Request interceptor - Add token to headers
authClient.interceptors.request.use((config) => {
  // Try localStorage first, then cookies
  const token = localStorage.getItem('authToken') || getCookie('authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔐 Token added to request headers");
  }
  return config;
});

// ✅ Response interceptor - Handle 401 errors
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect once on 401 to prevent multiple redirects
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      console.log("⚠️ 401 Unauthorized - Clearing tokens and redirecting to login");
      
      // Remove tokens from both storage and cookies
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      
      // Clear cookie
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Small delay to prevent UI flashing
      setTimeout(() => {
        console.log("🔄 Redirecting to User app login");
        window.location.href = 'http://localhost:5173/login';
        isRedirecting = false;
      }, 100);
    }
    return Promise.reject(error);
  }
);

export default authClient;
