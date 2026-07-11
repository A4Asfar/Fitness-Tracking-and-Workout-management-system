import React, { useEffect, useRef, useCallback } from 'react';
import { View, PanResponder } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { useRouter } from 'expo-router';

// 15 minutes of inactivity triggers auto-logout
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const InactivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const timerId = useRef<any>(null);

  const resetTimer = useCallback(() => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    if (user) {
      timerId.current = setTimeout(async () => {
        showToast('Session expired due to inactivity. Please log in again.', 'info');
        await logout();
        router.replace('/(auth)/login');
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, logout, showToast, router]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, [resetTimer]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};
