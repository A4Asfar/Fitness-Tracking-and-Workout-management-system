import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Theme';

/**
 * Root Index Component
 * Acts as a redirector based on authentication state.
 * This ensures the root route '/' is explicitly handled.
 */
export default function RootIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/(auth)/login');
    } else {
      if (user.membershipType === 'admin') {
        router.replace('/admin-dashboard' as any);
      } else {
        router.replace('/(tabs)/' as any);
      }
    }
  }, [user, loading, router]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
