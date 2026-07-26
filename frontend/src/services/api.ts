import axios from 'axios';

const getBaseURL = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv?.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }
  // In Docker / Production Nginx deployment, use relative path '/api'
  if (metaEnv?.PROD) {
    return '/api';
  }
  // Fallback for local development
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
