import axios from 'axios';
import { Platform } from 'react-native';
import Storage from '@/utils/storage';

/**
 * Base API configuration
 * Local Expo dev
 */
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return LOCAL_API_URL;
}

export const API_URL = resolveApiUrl();

if (__DEV__) {
  console.log('📡 API Connection Point:', API_URL, Platform.OS);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

/**
 * Global memory cache for the token to avoid repeated storage reads
 */
let authToken: string | null = null;
let onUnauthorized: ((silent?: boolean) => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setOnUnauthorized = (callback: (silent?: boolean) => void) => {
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
      const status = error.response?.status;
      const code = error.code;
      const message = error.message || '';

      const skipRetry = Boolean((config as { skipRetry?: boolean }).skipRetry);

      // Determine if error is transient/retryable (network drops, timeouts, 502/503/504)
      const isRetryableError =
        !error.response || 
        code === 'ECONNABORTED' ||
        code === 'ECONNRESET' ||
        code === 'ETIMEDOUT' ||
        message.includes('timeout') ||
        [502, 503, 504].includes(Number(status));

      // Explicitly prevent retrying 400, 401, 403, 404, 422, 503
      const isExplicitNonRetryable = status && [400, 401, 403, 404, 422, 503].includes(Number(status));

      // FIX: Use headers to track retry count since Axios mergeConfig strips custom properties like __retryCount
      const currentRetryCount = Number(config.headers?.['X-Retry-Count'] || 0);

      if (!skipRetry && isRetryableError && !isExplicitNonRetryable && currentRetryCount < maxRetries) {
        const nextRetryCount = currentRetryCount + 1;
        if (!config.headers) config.headers = {} as any;
        config.headers['X-Retry-Count'] = nextRetryCount.toString();
        
        console.log(`🔄 Retrying request (${nextRetryCount}/${maxRetries}): ${config.url}`);
        
        // Exponential backoff delay (1s, 2s, 4s)
        const delay = Math.pow(2, currentRetryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Process errors and map to friendly error messages
    if (error.response) {
      const status = error.response.status;

      // 401 Unauthorized (Expired or Invalid Token)
      if (status === 401) {
        // If it's a login request, do not wipe session and do not override the error message
        if (config?.url?.includes('/auth/login')) {
          const backendMessage = error.response.data?.message;
          return Promise.reject(new Error(backendMessage || 'Invalid email or password.'));
        }

        console.log('🔒 Unauthorized (401) - clearing session');
        authToken = null;
        await Storage.removeItem('authToken');
        await Storage.removeItem('authUser');
        const skipSessionAlert = Boolean((config as any).skipSessionAlert);
        if (onUnauthorized) {
          onUnauthorized(skipSessionAlert);
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
      console.log(`⏳ Timeout Error [${error.code}]: ${error.message} on ${config?.url}`);
      return Promise.reject(new Error('Server is starting or temporarily unavailable. Please try again in a few moments.'));
    }

    // Network failures / offline drops
    const cause = error.code ? `[Code: ${error.code}]` : (error.message || 'Unknown Network Error');
    console.error(`🔌 Connection Failed to ${config?.baseURL || ''}${config?.url || ''}`);
    console.error(`   -> Details: ${cause}`);
    console.error(`   -> IsAxiosError: ${axios.isAxiosError(error)} | Response Status: ${error.response?.status || 'None'}`);
    
    // Check if it's likely a CORS or DNS issue
    if (!error.response && !error.code) {
      console.error(`   -> Suspected CORS preflight failure, DNS block, or invalid SSL certificate on this network.`);
    }

    return Promise.reject(new Error(`Connection failed: ${cause}. Please check your connection.`));
  }
);

export default api;
