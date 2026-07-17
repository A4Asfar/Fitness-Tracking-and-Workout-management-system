import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, Flame, Zap, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeroCardProps {
  steps: number;
  calories: number;
  activeMinutes: number;
  streak: number;
}

export default function HeroCard({
  steps,
  calories,
  activeMinutes,
  streak
}: HeroCardProps) {
  const stepTarget = 10000;
  const calTarget = 2500;
  const activeTarget = 60;

  const stepProgress = Math.min(100, Math.round((steps / stepTarget) * 100));
  const calProgress = Math.min(100, Math.round((calories / calTarget) * 100));
  const activeProgress = Math.min(100, Math.round((activeMinutes / activeTarget) * 100));

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#10B98110', '#BD00FF04']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.badge}>
          <Trophy size={14} color="#FFD700" fill="#FFD700" />
          <Text style={styles.badgeText}>Today's Progress</Text>
        </View>
        <Text style={styles.streakText}>🔥 {streak} Day Streak</Text>
      </View>

      <Text style={styles.title}>Keep the momentum!</Text>
      <Text style={styles.subtitle}>You're closing in on your daily fitness targets.</Text>

      <View style={styles.metricsContainer}>
        {/* Metric 1 */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
            <Target size={18} color="#0EA5E9" />
          </View>
          <Text style={styles.metricVal}>{steps.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Steps</Text>
          <Text style={styles.metricPct}>{stepProgress}% of goal</Text>
        </View>

        <View style={styles.divider} />

        {/* Metric 2 */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <Flame size={18} color="#EF4444" />
          </View>
          <Text style={styles.metricVal}>{calories}</Text>
          <Text style={styles.metricLabel}>Kcal Burned</Text>
          <Text style={styles.metricPct}>{calProgress}% of goal</Text>
        </View>

        <View style={styles.divider} />

        {/* Metric 3 */}
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: '#FAF5FF' }]}>
            <Zap size={18} color="#A855F7" />
          </View>
          <Text style={styles.metricVal}>{activeMinutes}</Text>
          <Text style={styles.metricLabel}>Active Min</Text>
          <Text style={styles.metricPct}>{activeProgress}% of goal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '800',
  },
  streakText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '800',
  },
  title: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: { flexShrink: 1, 
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricVal: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  metricPct: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#F1F5F9',
  },
});
