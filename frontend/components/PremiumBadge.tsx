import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export default function PremiumBadge({ size = 'sm', style }: PremiumBadgeProps) {
  const sizeStyles = {
    sm: { px: 6, py: 2, icon: 8, font: 8, gap: 3, radius: 6 },
    md: { px: 8, py: 3, icon: 10, font: 9, gap: 4, radius: 8 },
    lg: { px: 10, py: 4, icon: 12, font: 10, gap: 5, radius: 10 },
  };

  const s = sizeStyles[size];

  return (
    <View style={[
      styles.badge,
      { paddingHorizontal: s.px, paddingVertical: s.py, borderRadius: s.radius, gap: s.gap },
      style
    ]}>
      <Crown size={s.icon} color="#78350F" fill="#D4AF37" />
      <Text style={[styles.text, { fontSize: s.font }]}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  text: {
    color: '#78350F',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
