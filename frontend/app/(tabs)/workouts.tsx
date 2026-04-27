import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, SharedStyles } from '@/constants/Theme';
import { Dumbbell, Flame, ChevronRight, Plus, Trophy, Zap, TrendingUp } from 'lucide-react-native';
import api from '@/services/api';
import { useRouter } from 'expo-router';

interface Workout {
  _id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  type: string;
  date: string;
}

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (error) {
      console.error('Failed to fetch workouts', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [fetchWorkouts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const categories = [
    { id: 'strength', name: 'Strength', icon: Dumbbell, color: '#CCFF00' },
    { id: 'cardio', name: 'Cardio', icon: Flame, color: '#FF4B4B' },
    { id: 'hiit', name: 'HIIT', icon: Zap, color: '#00D1FF' },
    { id: 'flexibility', name: 'Yoga', icon: Trophy, color: '#BD00FF' },
  ];

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Dumbbell size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Ready to break a sweat?</Text>
      <Text style={styles.emptySubtitle}>
        Your training history is empty. Choose a category below to start your first session!
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
            style={styles.categoryCard}
            onPress={() => {
              // Using a template string for more reliable navigation in some Expo environments
              router.push(`/create-workout?type=${cat.name}` as any);
            }}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                <cat.icon size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {workouts.length === 0 ? (
          <EmptyState />
        ) : (
          workouts.map((workout) => {
            const typeColors: Record<string, string> = {
              Strength: Colors.primary, Cardio: '#FF4B4B', HIIT: '#00D1FF', Yoga: '#BD00FF',
            };
            const accent = typeColors[workout.type] ?? Colors.primary;
            const volume = (workout.sets ?? 0) * (workout.reps ?? 0) * (workout.weight ?? 0);
            const dateStr = new Date(workout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return (
              <TouchableOpacity
                key={workout._id}
                style={styles.workoutCard}
                onPress={() => router.push(`/workout/${workout._id}` as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.cardAccentBar, { backgroundColor: accent }]} />
                <View style={styles.workoutInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={[styles.workoutTypeTag, { backgroundColor: accent + '18', borderColor: accent + '35' }]}>
                      <Text style={[styles.workoutTypeText, { color: accent }]}>{workout.type}</Text>
                    </View>
                    <Text style={styles.cardDate}>{dateStr}</Text>
                  </View>
                  <Text style={styles.workoutName}>{workout.exercise}</Text>
                  <View style={styles.workoutStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statChip}>{workout.sets} sets</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statChip}>{workout.reps} reps</Text>
                    </View>
                    {workout.weight > 0 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statChip}>{workout.weight} kg</Text>
                      </View>
                    )}
                    {volume > 0 && (
                      <View style={styles.statItem}>
                        <TrendingUp size={12} color={Colors.textSecondary} />
                        <Text style={styles.statText}>{volume.toLocaleString()} kg</Text>
                      </View>
                    )}
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/create-workout' as any)}
      >
        <Plus size={30} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  workoutCard: {
    backgroundColor: '#181818',
    borderRadius: 22,
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252525',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    borderRadius: 4,
  },
  workoutInfo: { flex: 1 },
  workoutTypeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  workoutTypeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  workoutName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  workoutStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statChip: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: '#252525',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
