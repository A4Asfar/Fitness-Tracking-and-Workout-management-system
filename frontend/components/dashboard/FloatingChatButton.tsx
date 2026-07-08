import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AI_COACH_NAME } from '@/constants/Brand';
import { hapticLight } from '@/utils/haptics';

const TAB_BAR_OFFSET = 64;

export default function FloatingChatButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    hapticLight();
    router.push('/ai-chat');
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + TAB_BAR_OFFSET }]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${AI_COACH_NAME}`}
      >
        <LinearGradient
          colors={['#10B981', '#059669', '#BD00FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Bot size={26} color="#FFFFFF" strokeWidth={2.2} />
        </LinearGradient>
        <View style={styles.badge} />
      </TouchableOpacity>
      <Text style={styles.label} numberOfLines={1}>
        {AI_COACH_NAME}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    zIndex: 100,
    elevation: 12,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)' },
      default: {},
    }),
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    maxWidth: 72,
    textAlign: 'center',
  },
});
