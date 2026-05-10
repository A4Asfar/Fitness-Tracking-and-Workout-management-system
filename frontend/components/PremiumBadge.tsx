import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Theme';
import { Crown } from 'lucide-react-native';

export default function PremiumBadge({ style }: { style?: any }) {
  return (
    <View style={[styles.badge, style]}>
      <Crown size={8} color="#000" fill="#000" />
      <Text style={styles.text}>PREMIUM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  text: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
