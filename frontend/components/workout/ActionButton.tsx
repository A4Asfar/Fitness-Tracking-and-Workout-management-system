import React, { useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionButtonProps {
  label: string;
  icon?: any;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accentColor?: string;
  secondary?: boolean;
}

export default function ActionButton({
  label,
  icon: IconComponent,
  onPress,
  loading = false,
  disabled = false,
  accentColor = '#10B981',
  secondary = false
}: ActionButtonProps) {
  const scaleVal = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleVal, {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleVal, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  if (secondary) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleVal }], width: '100%' }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[
            styles.secondaryBtn,
            { borderColor: accentColor },
            (disabled || loading) && { opacity: 0.5 }
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : (
            <>
              {IconComponent && <IconComponent size={18} color={accentColor} />}
              <Text style={[styles.secondaryText, { color: accentColor }]}>{label}</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleVal }], width: '100%' }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[styles.primaryWrapper, (disabled || loading) && { opacity: 0.6 }]}
      >
        <LinearGradient
          colors={[accentColor, accentColor + 'D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryBtn}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {IconComponent && <IconComponent size={18} color="#FFFFFF" strokeWidth={2.5} />}
              <Text style={styles.primaryText}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryWrapper: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
