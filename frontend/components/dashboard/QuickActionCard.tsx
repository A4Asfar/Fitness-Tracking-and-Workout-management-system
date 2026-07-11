import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickActionCardProps {
  title: string;
  desc: string;
  icon: any;
  onPress: () => void;
  accentColor: string;
}

export default function QuickActionCard({
  title,
  desc,
  icon: IconComponent,
  onPress,
  accentColor
}: QuickActionCardProps) {
  const scaleVal = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleVal, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleVal, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleVal }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.card}
      >
        <LinearGradient
          colors={[accentColor + '08', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.iconBox, { backgroundColor: accentColor + '12' }]}>
          <IconComponent size={20} color={accentColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  desc: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});
