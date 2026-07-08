import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Theme';

/** Root index — routes to login or dashboard without blocking on splash. */
export default function RootIndex() {
  const { user, loading } = useAuth();

  if (!loading) {
    if (!user) {
      return <Redirect href="/(auth)/login" />;
    }
    if (user.membershipType === 'admin') {
      return <Redirect href="/admin-dashboard" />;
    }
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
