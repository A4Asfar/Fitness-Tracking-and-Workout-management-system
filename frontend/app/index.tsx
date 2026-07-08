import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Theme';

/** Root index — just a loading screen until _layout redirects. */
export default function RootIndex() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
