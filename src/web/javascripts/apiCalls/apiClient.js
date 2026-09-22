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
    
    // Handle unauthorized response
    if (response?.status === HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
