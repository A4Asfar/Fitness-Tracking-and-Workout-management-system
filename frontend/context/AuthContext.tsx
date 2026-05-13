import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import Storage from '@/utils/storage';
import api, { setAuthToken } from '@/services/api';

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
  preferredWorkoutFocus?: 'Strength' | 'Cardio' | 'HIIT' | 'Yoga';
  avatar: string;
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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  /**
   * Session Restoration
   * Runs on app boot to check for persisted tokens and user data
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await Storage.getItem('authToken');
        const savedUser = await Storage.getItem('authUser');
        
        if (savedToken) {
          setAuthToken(savedToken);
          setToken(savedToken);
          
          // Optimistically set user from storage to avoid blank screens
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              console.error('Failed to parse saved user');
            }
          }
          
          // Verify/Refresh from server in background
          const response = await api.get('/auth/me');
          setUser(response.data);
          await Storage.setItem('authUser', JSON.stringify(response.data));
          console.log('✅ Session synchronized for:', response.data.email);
        }
      } catch (error) {
        console.log('Session expired or no token found');
        await Storage.removeItem('authToken');
        await Storage.removeItem('authUser');
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsNewUser(false);
        setLoading(false);
      }
    };

    restoreSession();
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
    console.log('🔑 Login successful for:', userData.email);
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
    console.log('✨ Account created for:', userData.email);
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
    console.log('🔒 Session cleared - user logged out');
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
      refreshUser
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
