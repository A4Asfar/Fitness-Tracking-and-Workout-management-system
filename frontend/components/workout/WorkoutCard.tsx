import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dumbbell, Flame, Zap, Heart, Trash2, Pencil } from 'lucide-react-native';
import MetricBadge from './MetricBadge';

interface WorkoutCardProps {
  workout: any;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  accentColor?: string;
}

export default function WorkoutCard({
  workout,
  onEditPress,
  onDeletePress,
  accentColor = '#10B981'
}: WorkoutCardProps) {
  const getIcon = (typeStr: string) => {
    switch (typeStr) {
      case 'Strength': return Dumbbell;
      case 'Cardio': return Flame;
      case 'HIIT': return Zap;
      case 'Yoga': return Heart;
      default: return Dumbbell;
    }
  };

  const getAccent = (typeStr: string) => {
    switch (typeStr) {
      case 'Strength': return '#10B981';
      case 'Cardio': return '#FF4B4B';
      case 'HIIT': return '#00B0FF';
      case 'Yoga': return '#BD00FF';
      default: return '#10B981';
    }
  };

  const activeAccent = getAccent(workout.type);
  const IconComponent = getIcon(workout.type);

  const formattedDate = new Date(workout.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: activeAccent + '12', borderColor: activeAccent + '25' }]}>
          <IconComponent size={20} color={activeAccent} strokeWidth={2} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{workout.exercise}</Text>
          <Text style={styles.date}>{workout.type} • {formattedDate}</Text>
        </View>
        <View style={styles.actions}>
          {onEditPress && (
            <TouchableOpacity onPress={onEditPress} style={styles.actionBtn} activeOpacity={0.7}>
              <Pencil size={15} color="#64748B" />
            </TouchableOpacity>
          )}
          {onDeletePress && (
            <TouchableOpacity onPress={onDeletePress} style={styles.actionBtn} activeOpacity={0.7}>
              <Trash2 size={15} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.metricsRow}>
        {workout.type === 'Strength' && (
          <>
            <MetricBadge label="Sets" value={workout.sets} />
            <MetricBadge label="Reps" value={workout.reps} />
            <MetricBadge label="Weight" value={workout.weight} suffix="kg" />
            {workout.duration > 0 && <MetricBadge label="Duration" value={workout.duration} suffix="m" />}
          </>
        )}
        {workout.type === 'Cardio' && (
          <>
            <MetricBadge label="Duration" value={workout.duration} suffix="m" />
            {workout.distance > 0 && <MetricBadge label="Distance" value={workout.distance} suffix="km" />}
            {workout.calories > 0 && <MetricBadge label="Calories" value={workout.calories} suffix="kcal" />}
            {workout.speed > 0 && <MetricBadge label="Speed" value={workout.speed} suffix="km/h" />}
          </>
        )}
        {workout.type === 'HIIT' && (
          <>
            <MetricBadge label="Rounds" value={workout.rounds} />
            <MetricBadge label="Work" value={workout.workTime} suffix="s" />
            <MetricBadge label="Rest" value={workout.restTime} suffix="s" />
            {workout.duration > 0 && <MetricBadge label="Total" value={workout.duration} suffix="m" />}
          </>
        )}
        {workout.type === 'Yoga' && (
          <>
            <MetricBadge label="Duration" value={workout.duration} suffix="m" />
            {workout.difficulty && <MetricBadge label="Diff" value={workout.difficulty} />}
          </>
        )}
      </View>
    </View>
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
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: { flexShrink: 1, 
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  date: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
});
