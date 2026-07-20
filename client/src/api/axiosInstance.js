import axios from 'axios';

/**
 * Normalizes the backend base URL to ensure it always includes the `/api` prefix,
 * supporting both local development and production (e.g. Render, Vercel).
 */
const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;

  // Fallback defaults if VITE_API_URL is not set
  if (!envUrl || !envUrl.trim()) {
    return import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://study-os-jqmf.onrender.com/api';
  }

  // Remove trailing slashes
  envUrl = envUrl.trim().replace(/\/+$/, '');

  // Guarantee `/api` prefix at the end of the base URL
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }

  return envUrl;
};

export const API_BASE_URL = getBaseURL();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request Interceptor — attach JWT authorization token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studyos_token');
      localStorage.removeItem('studyos_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
