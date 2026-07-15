import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

/**
 * Request Interceptor:
 * Automatically attaches the JWT token to every outgoing request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[API Request] No token found for ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Handles global API responses and 401 Unauthorized errors (invalid tokens).
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('[API Response] 401 Unauthorized! Token expired or invalid.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Force redirect to login if session expires
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      console.error(`[API Response Error] ${error.response?.status || 'Unknown'}:`, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
