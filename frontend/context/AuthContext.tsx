import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import Storage from '@/utils/storage';
import api, { setAuthToken, setOnUnauthorized } from '@/services/api';
import axios from 'axios';
import { useToast } from '@/components/Toast';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

/**
 * User Type definition matching backend schema
 */
export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  membershipType: 'free' | 'premium' | 'admin';
  membershipExpiresAt?: string;
  weight: number;
  height: number;
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'Maintain Fitness' | 'Endurance' | 'General Fitness' | 'None';
  trainingLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  workoutFocus?: 'Strength' | 'Cardio' | 'HIIT' | 'Yoga';
  avatar: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, membershipType: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { showToast } = useToast();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (request) {
      console.log('=== GOOGLE OAUTH FORENSIC AUDIT ===');
      console.log('1. ENV Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
      console.log('2. Request Config:', JSON.stringify(request, null, 2));
      console.log('3. Redirect URI:', request.redirectUri);
      console.log('4. Client ID sent to Google:', request.clientId);
      console.log('===================================');
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    } else if (response?.type === 'error') {
      showToast('Google Sign-In Failed or Canceled', 'error');
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google', { idToken });
      const { token: newToken, user: userData } = res.data;
      
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
      
      await Storage.setItem('authToken', newToken);
      await Storage.setItem('authUser', JSON.stringify(userData));
      setIsNewUser(false);
      if (__DEV__) console.log('🔑 Google Login successful for:', userData.email);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Google Authentication Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  useEffect(() => {
    setOnUnauthorized((silent = false) => {
      setUser(null);
      setToken(null);
      if (!silent) {
        showToast('Your session has expired. Please sign in again.', 'error');
      }
    });
  }, [showToast]);

  /**
   * Session Restoration
   * Runs on app boot to check for persisted tokens and user data
   */
  useEffect(() => {
    let active = true;

    const finishBoot = () => {
      if (active) {
        setIsNewUser(false);
        setLoading(false);
      }
    };

    const bootTimeout = setTimeout(finishBoot, 2500);

    const restoreSession = async () => {
      try {
        const savedToken = await Storage.getItem('authToken');
        if (!savedToken) {
          finishBoot();
          return;
        }

        const savedUser = await Storage.getItem('authUser');

        setAuthToken(savedToken);
        setToken(savedToken);

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            if (__DEV__) console.error('Failed to parse saved user');
          }
        }

        // Refresh session in background — do not block first screen
        finishBoot();

        const response = await Promise.race([
          api.get('/auth/me', { skipRetry: true, timeout: 15000, skipSessionAlert: true } as any),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Session check timed out')), 15000)
          ),
        ]);

        if (!active) return;

        setUser(response.data);
        await Storage.setItem('authUser', JSON.stringify(response.data));
        if (__DEV__) console.log('✅ Session synchronized for:', response.data.email);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        if (
          status === 401 ||
          message.includes('session has expired') ||
          message.includes('Authentication')
        ) {
          await Storage.removeItem('authToken');
          await Storage.removeItem('authUser');
          setAuthToken(null);
          setUser(null);
        } else if (__DEV__) {
          console.log('Session refresh skipped (offline or server unavailable)');
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
      clearTimeout(bootTimeout);
    };
  }, []);

  /**
   * Login Action
   */
  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    
    setAuthToken(newToken);
    setToken(newToken);
    setUser(userData);
    
    await Storage.setItem('authToken', newToken);
    await Storage.setItem('authUser', JSON.stringify(userData));
    setIsNewUser(false);
    if (__DEV__) console.log('🔑 Login successful for:', userData.email);
  }, []);

  /**
   * Signup Action
   */
  const signup = useCallback(async (name: string, email: string, password: string, membershipType: string) => {
    const response = await api.post('/auth/register', { name, email, password, membershipType });
    const { token: newToken, user: userData } = response.data;
    
    setAuthToken(newToken);
    setToken(newToken);
    setUser(userData);
    
    await Storage.setItem('authToken', newToken);
    await Storage.setItem('authUser', JSON.stringify(userData));
    setIsNewUser(true);
    if (__DEV__) console.log('✨ Account created for:', userData.email);
  }, []);

  /**
   * Logout Action
   */
  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await Storage.removeItem('authToken');
    await Storage.removeItem('authUser');
    if (__DEV__) console.log('🔒 Session cleared - user logged out');
  }, []);
  
  /**
   * Optimistic User Update + Persistence
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      const newUser = prev ? { ...prev, ...userData } : null;
      if (newUser) {
        Storage.setItem('authUser', JSON.stringify(newUser)).catch(e => console.error('Storage update failed', e));
      }
      return newUser;
    });
  }, []);

  /**
   * Hard Refresh User Data
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      await Storage.setItem('authUser', JSON.stringify(response.data));
    } catch (error) {
      console.log('Failed to refresh user data');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isNewUser,
      login, 
      signup, 
      logout, 
      updateUser,
      refreshUser,
      loginWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
