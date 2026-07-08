import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonItem({ width = '100%', height = 20, borderRadius = 6, style }: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export default function SkeletonCard({ style }: { style?: any }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <SkeletonItem width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <SkeletonItem width="50%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonItem width="30%" height={12} />
        </View>
      </View>
      <SkeletonItem width="100%" height={12} style={{ marginTop: 16, marginBottom: 8 }} />
      <SkeletonItem width="80%" height={12} style={{ marginBottom: 16 }} />
      <View style={styles.footerRow}>
        <SkeletonItem width="25%" height={14} />
        <SkeletonItem width="20%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0', // slate-200
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
