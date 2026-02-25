import axios from 'axios';

const api = axios.create({
  baseURL: 'https://unknownhifjur-hert-backend.vercel.app/api'
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