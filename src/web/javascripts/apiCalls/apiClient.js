import axios from 'axios';
import { BASE_URL, TIMEOUT, HTTP_STATUS } from './constant';

// Get auth token from localStorage
const getAuthToken = () => {
  try {
    return localStorage.getItem('authToken') || '';
  } catch {
    return '';
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle unauthorized response (401)
    if (response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('token');
      
      // Redirect to login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/forgot-password') {
        window.location.href = '/login';
      }
    }
    
    // Handle forbidden response (403)
    if (response?.status === HTTP_STATUS.FORBIDDEN) {
      console.error('Access forbidden');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
