import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Theme';
import SplashScreen from '@/components/SplashScreen';

function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      const isAdmin = user.membershipType === 'admin' || user.email === 'admin@peakpulse.ai';
      if (isAdmin) {
        router.replace('/admin-dashboard' as any);
      } else {
        router.replace('/(tabs)/' as any);
      }
    } else if (user) {
      const isAdmin = user.membershipType === 'admin' || user.email === 'admin@peakpulse.ai';
      const isPremiumScreen = segments[0] === 'insights' || segments[0] === 'reminders';
      const isAdminScreen = segments[0] === 'admin-dashboard';
      const isProgressTab = segments[1] === 'progress';

      if (user.membershipType === 'free' && (isPremiumScreen || isProgressTab)) {
        router.replace('/upgrade');
      } else if (!isAdmin && isAdminScreen) {
        router.replace('/(tabs)/' as any);
      }
    }
  }, [user, loading, segments]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-workout" options={{ presentation: 'modal', title: 'Log Workout' }} />
      <Stack.Screen name="help" options={{ presentation: 'card' }} />
      <Stack.Screen name="body-health" options={{ presentation: 'card' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {

  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationHandler />
        <StatusBar style="light" />
      </ToastProvider>
    </AuthProvider>
  );
}
