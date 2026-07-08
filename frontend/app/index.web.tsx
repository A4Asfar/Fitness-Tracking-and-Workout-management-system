import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

/** Web home — go straight to login or dashboard. No spinner, no splash. */
export default function WebRootIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.membershipType === 'admin') {
    return <Redirect href="/admin-dashboard" />;
  }

  return <Redirect href="/(tabs)/" />;
}
