import axios from 'axios';
import { getAuthToken } from '../utils/auth';

// In a real environment, this would point to your actual backend
const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// For demo purposes, we'll intercept responses and simulate errors sometimes
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors would be handled here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;