import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export const transactionAPI:any = {
  create: (data: any) => api.post('/transactions', data),
  getAll: (params: any) => api.get('/transactions', { params }),
  getById: (id: any) => api.get(`/transactions/${id}`),
};

export const hashingAPI = {
  test: (data: any) => api.post('/hashing/test', data),
  performanceTest: (data: any) => api.post('/hashing/performance', data),
  getTests: () => api.get('/hashing/tests'),
};

export const securityAPI = {
  test: (data: any) => api.post('/security/test', data),
  getTests: () => api.get('/security/tests'),
};

export const performanceAPI = {
  getAnalytics: () => api.get('/performance/analytics'),
};

export const walletAPI:any = {
  getWallet: () => api.get('/wallet'),
};

export default api;