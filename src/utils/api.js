import axios from 'axios';

// baseURL can be overridden via VITE_API_URL (e.g. http://localhost:5000/api in dev)
const defaultBase = 'https://hert-backend.onrender.com/api';
const baseURL = import.meta.env.VITE_API_URL || defaultBase;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;