import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { isAdminUser } from '@/utils/isAdmin';
import SplashScreen from '@/components/SplashScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SPLASH_DURATION_MS = 2200;

function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || showSplash) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      const isAdmin = isAdminUser(user);
      if (isAdmin) {
        router.replace('/admin-dashboard' as any);
      } else {
        router.replace('/(tabs)/' as any);
      }
    } else if (user) {
      const isAdmin = isAdminUser(user);
      const isAdminScreen = segments[0] === 'admin-dashboard' || segments[0] === 'admin';

      if (!isAdmin && isAdminScreen) {
        router.replace('/(tabs)/' as any);
      }
    }
  }, [user, loading, showSplash, segments, router]);

  const splashVisible = loading || showSplash;

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="create-workout" options={{ presentation: 'modal', title: 'Log Workout' }} />
        <Stack.Screen name="help" options={{ presentation: 'card' }} />
        <Stack.Screen name="body-health" options={{ presentation: 'card' }} />
        <Stack.Screen name="trainer" options={{ presentation: 'card' }} />
        <Stack.Screen name="trainer-details" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="book-session" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="booking-success" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="my-bookings" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {splashVisible && (
        <View style={styles.splashOverlay} pointerEvents="auto">
          <SplashScreen />
        </View>
      )}
    </View>
  );
}

const initialSafeAreaMetrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider initialMetrics={initialSafeAreaMetrics}>
        <ToastProvider>
          <AuthProvider>
            <NavigationHandler />
            <StatusBar style="light" />
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});
