import axios from 'axios';

// Get backend root from env, fallback to production root
const backendRoot = import.meta.env.VITE_API_URL || 'https://hert-backend.onrender.com';
// Remove trailing slash if present and append '/api'
const baseURL = backendRoot.replace(/\/$/, '') + '/api';

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