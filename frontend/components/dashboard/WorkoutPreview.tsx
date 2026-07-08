import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dumbbell, Clock, Flame, ChevronRight, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutPreviewProps {
  workoutName: string;
  duration: string;
  calories: number;
  difficulty: string;
  targetMuscles: string;
  onPress: () => void;
}

export default function WorkoutPreview({
  workoutName,
  duration,
  calories,
  difficulty,
  targetMuscles,
  onPress
}: WorkoutPreviewProps) {
  const getDiffColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'advanced': return '#EF4444';
      default: return '#F59E0B'; // Intermediate
    }
  };

  const diffColor = getDiffColor(difficulty);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#10B98108', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Dumbbell size={16} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.headerLabel}>Today's Routine</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: diffColor + '10', borderColor: diffColor + '20' }]}>
          <Text style={[styles.badgeText, { color: diffColor }]}>{difficulty.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.name}>{workoutName}</Text>
      <Text style={styles.target}>{targetMuscles}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.statText}>{duration}</Text>
        </View>
        <View style={styles.stat}>
          <Flame size={14} color="#64748B" />
          <Text style={styles.statText}>{calories} kcal</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.btnWrapper}>
        <LinearGradient
          colors={['#10B981', '#6A3DE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.btnText}>Start Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  name: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  target: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  btnWrapper: {
    width: '100%',
  },
  btn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
