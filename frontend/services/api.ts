import axios from 'axios';
import Storage from '@/utils/storage';

/**
 * Base API configuration
 * Centralized for both Local Development and Railway Production
 */
const FALLBACK_URL = 'https://fitness-tracking-and-workout-management-system-production.up.railway.app/api';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || FALLBACK_URL;

if (__DEV__) console.log('📡 API Connection Point:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s timeout
});

/**
 * Global memory cache for the token to avoid repeated storage reads
 */
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

/**
 * Request Interceptor
 * Injects the Bearer token into every outgoing request
 */
api.interceptors.request.use(
  async (config) => {
    let token = authToken;
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
 * Handles automatic retry policies for transient failures,
 * session cleanup for 401s, and maps friendly user-facing messages.
 */
const maxRetries = 3;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Check if the request configuration allows retries
    if (config) {
      config.__retryCount = config.__retryCount || 0;
      
      const status = error.response?.status;
      const code = error.code;
      const message = error.message || '';

      // Determine if error is transient/retryable (network drops, timeouts, 502/503/504)
      const isRetryableError =
        !error.response || 
        code === 'ECONNABORTED' ||
        code === 'ECONNRESET' ||
        code === 'ETIMEDOUT' ||
        message.includes('timeout') ||
        [502, 503, 504].includes(Number(status));

      // Explicitly prevent retrying 400, 401, 403, 404, 422
      const isExplicitNonRetryable = status && [400, 401, 403, 404, 422].includes(Number(status));

      if (isRetryableError && !isExplicitNonRetryable && config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        console.log(`🔄 Retrying request (${config.__retryCount}/${maxRetries}): ${config.url}`);
        
        // Exponential backoff delay (1s, 2s, 4s)
        const delay = Math.pow(2, config.__retryCount - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Process errors and map to friendly error messages
    if (error.response) {
      const status = error.response.status;

      // 401 Unauthorized (Expired or Invalid Token)
      if (status === 401) {
        console.log('🔒 Unauthorized (401) - clearing session');
        authToken = null;
        await Storage.removeItem('authToken');
        await Storage.removeItem('authUser');
        if (onUnauthorized) {
          onUnauthorized();
        }
        return Promise.reject(new Error('Your session has expired. Please sign in again.'));
      }

      // 503 Service Unavailable (Common during cold starts or Gemini issues)
      if (status === 503) {
        return Promise.reject(new Error('AI service is temporarily busy. Please try again shortly.'));
      }

      // Reject with custom backend messages if present
      const backendMessage = error.response.data?.message;
      if (backendMessage) {
        return Promise.reject(new Error(backendMessage));
      }
    }

    // Request Timeouts
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return Promise.reject(new Error('Server is starting or temporarily unavailable. Please try again in a few moments.'));
    }

    // Network failures / offline drops
    return Promise.reject(new Error('Unable to reach the server. Please check your connection.'));
  }
);

export default api;
