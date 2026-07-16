import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressCardProps {
  completedCount: number;
  totalCount: number;
  activeColor?: string;
}

export default function ProgressCard({
  completedCount,
  totalCount,
  activeColor = '#10B981'
}: ProgressCardProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: totalCount > 0 ? completedCount / totalCount : 0,
      duration: 500,
      useNativeDriver: false // Width animation requires false
    }).start();
  }, [completedCount, totalCount]);

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Trophy size={18} color="#FFD700" fill="#FFD700" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Overall Fitness Progress</Text>
          <Text style={styles.counter}>{completedCount} of {totalCount} exercises completed</Text>
        </View>
        <Text style={[styles.percentage, { color: activeColor }]}>{percentage}%</Text>
      </View>

      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, { width: widthInterpolation, backgroundColor: activeColor }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFBE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  info: {
    flex: 1,
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  counter: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  percentage: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
