import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { isAdminUser } from '@/utils/isAdmin';
import SplashScreen from '@/components/SplashScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as NativeSplashScreen from 'expo-splash-screen';

// Prevent auto-hiding of the native splash screen
NativeSplashScreen.preventAutoHideAsync().catch(() => {});

const IS_WEB = Platform.OS === 'web';
const SPLASH_DURATION_MS = IS_WEB ? 0 : 2200;

function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [showSplash, setShowSplash] = useState(!IS_WEB);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (rootNavigationState?.key) {
      // Delay slightly to ensure Expo Router's internal navigation container is fully mounted
      const timer = setTimeout(() => setIsNavigationReady(true), 50);
      return () => clearTimeout(timer);
    }
  }, [rootNavigationState?.key]);

  useEffect(() => {
    // Hide the native splash screen immediately to show our custom animated one
    NativeSplashScreen.hideAsync().catch(() => {});

    if (IS_WEB) return;

    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    const forceHide = setTimeout(() => setShowSplash(false), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(forceHide);
    };
  }, []);

  useEffect(() => {
    // Wait until Expo Router's navigation state is mounted before routing.
    // If we route too early, it silently fails and leaves the user stuck on the loading screen.
    if (loading || showSplash || !isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments[0] || segments[0] === 'index';

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
      } else if (isRoot) {
        router.replace(isAdmin ? '/admin-dashboard' as any : '/(tabs)/' as any);
      }
    }
  }, [user, loading, showSplash, segments, router, isNavigationReady]);

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

      {showSplash && (
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
