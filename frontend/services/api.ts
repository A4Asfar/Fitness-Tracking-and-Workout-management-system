import axios from 'axios';
import Storage from '@/utils/storage';

/**
 * Base API configuration
 * Optimized for Production Deployment
 */
/**
 * Base API configuration
 * Simplified for Local Development
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log('🚀 Local API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

/**
 * Global memory cache for the token to avoid repeated storage reads
 */
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

/**
 * Request Interceptor
 * Injects the Bearer token into every outgoing request
 */
api.interceptors.request.use(
  async (config) => {
    // Check memory first
    let token = authToken;
    
    // Fallback to storage if memory is empty (app boot scenario)
    if (!token) {
      token = await Storage.getItem('authToken');
      if (token) authToken = token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles errors globally, including automatic session cleanup on 401 Unauthorized
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors & Timeouts
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Connection timed out. The server might be waking up or your network is unstable.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Unable to connect to the server. Please check your network connection.'));
    }

    // Handle 401 Unauthorized (Expired or Invalid token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔒 Unauthorized - clearing session');
      authToken = null;
      await Storage.removeItem('authToken');
      // Force reload or redirect could be triggered here if needed
    }

    // Extract user-friendly error message
    const message = error.response?.data?.message || error.message || 'Network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
