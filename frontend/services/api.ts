import axios from 'axios';
import { Platform } from 'react-native';
import Storage from '@/utils/storage';

/**
 * Base API configuration
 * Optimized for Same-Laptop Presentation Mode:
 * - Web/iOS: uses localhost
 * - Android Emulator: uses 10.0.2.2 (host bridge)
 */
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  // Detection for laptop-based presentation
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:5000/api`;
};

export const API_URL = getBaseUrl();
console.log('🚀 Presentation Mode API URL:', API_URL);

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
