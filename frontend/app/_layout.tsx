import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { isAdminUser } from '@/utils/isAdmin';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as NativeSplashScreen from 'expo-splash-screen';
import { InactivityProvider } from '@/components/InactivityProvider';

// Prevent auto-hiding of the native splash screen
NativeSplashScreen.preventAutoHideAsync().catch(() => {});

function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Hide the native splash screen once auth state is resolved
    if (!loading) {
      NativeSplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  useEffect(() => {
    // Wait until Expo Router's navigation state is mounted before routing
    if (loading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments[0] || (segments[0] as string) === 'index';

    // Defer routing to ensure NavigationContainer is completely mounted
    const timer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (user && isRoot) {
        const isAdmin = isAdminUser(user);
        router.replace(isAdmin ? '/admin-dashboard' as any : '/(tabs)/' as any);
      } else if (user) {
        const isAdmin = isAdminUser(user);
        const isAdminScreen = segments[0] === 'admin-dashboard' || segments[0] === 'admin';

        if (!isAdmin && isAdminScreen) {
          router.replace('/(tabs)/' as any);
        }
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [user, loading, segments, router, rootNavigationState?.key]);

  return (
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
            <InactivityProvider>
              <NavigationHandler />
              <StatusBar style="light" />
            </InactivityProvider>
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
});
