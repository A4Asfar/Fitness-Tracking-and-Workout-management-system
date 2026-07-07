import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface WorkoutChipProps {
  label: string;
  icon: any;
  selected: boolean;
  activeColor: string;
  onPress: () => void;
}

export default function WorkoutChip({
  label,
  icon: IconComponent,
  selected,
  activeColor,
  onPress
}: WorkoutChipProps) {
  const scaleVal = useRef(new Animated.Value(1)).current;
  const opacityVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityVal, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [selected]);

  const handlePressIn = () => {
    Animated.spring(scaleVal, {
      toValue: 0.94,
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
        style={[
          styles.chip,
          selected && { borderColor: activeColor, backgroundColor: activeColor + '0E' }
        ]}
      >
        <IconComponent
          size={18}
          color={selected ? activeColor : '#64748B'}
          strokeWidth={selected ? 2.5 : 2}
        />
        <Text style={[
          styles.label,
          selected && { color: activeColor, fontWeight: '800' }
        ]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
