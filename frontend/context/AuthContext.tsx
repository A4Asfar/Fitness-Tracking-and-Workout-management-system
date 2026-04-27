import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import Storage from '@/utils/storage';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  weight: number;
  height: number;
  fitnessGoal: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await Storage.getItem('authToken');
        if (savedToken) {
          setToken(savedToken);
          // Verify token and get user data
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.log('Session expired or no token found');
        await Storage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    restoreToken();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    setIsNewUser(false);
    await Storage.setItem('authToken', token);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    setIsNewUser(true);
    await Storage.setItem('authToken', token);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setIsNewUser(false);
    await Storage.removeItem('authToken');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isNewUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
