import React, { useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false
}: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.9}
        style={styles.btn}
      >
        <LinearGradient
          colors={['#7C4DFF', '#BD00FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.text}>{title.toUpperCase()}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
    marginBottom: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
