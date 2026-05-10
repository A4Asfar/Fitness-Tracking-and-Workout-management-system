import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { 
  Dumbbell, Flame, ChevronRight, Plus, Trophy, 
  Zap, TrendingUp, Sparkles, Target, Info
} from 'lucide-react-native';
import api from '@/services/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

import { WorkoutSuggestion, getIconComponent } from '@/services/recommendations';
import { ContentService } from '@/services/contentService';

const { width } = Dimensions.get('window');

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
  const [recommendations, setRecommendations] = useState<WorkoutSuggestion[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  const level = user?.trainingLevel || 'Beginner';
  const focus = user?.preferredWorkoutFocus || 'Strength';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await ContentService.getWorkoutSuggestions({ level, focus });
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch suggestions');
      }
    };
    fetchSuggestions();
  }, [level, focus]);

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
        Your training history is empty. Choose a recommendation above to start your first session!
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
        {/* ── Smart Recommendation Header ── */}
        <View style={styles.aiHeader}>
          <View style={styles.aiTag}>
            <Sparkles size={14} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.aiTagText}>SMART ASSISTANT</Text>
          </View>
          <Text style={styles.aiTitle}>Recommended Workouts For You</Text>
          <Text style={styles.aiSub}>Based on your {level} level and {focus} focus</Text>
        </View>

        {/* ── Recommendations Scroll ── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.aiScroll}
        >
          {recommendations.map((rec, idx) => {
            const SuggestionIcon = getIconComponent(rec.icon);
            return (
              <TouchableOpacity 
                key={idx} 
                style={styles.aiCard}
                onPress={() => router.push(`/create-workout?type=${rec.type}&exercise=${rec.exercise}` as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#1A1A1A', '#111111']}
                  style={styles.aiCardGrad}
                >
                  <View style={styles.aiCardHeader}>
                    <View style={styles.aiIconBox}>
                      <SuggestionIcon size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.aiTypeTag}>
                      <Text style={styles.aiTypeText}>{rec.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.aiCardName}>{rec.exercise}</Text>
                  <View style={styles.aiReasonRow}>
                    <Info size={12} color={Colors.textSecondary} />
                    <Text style={styles.aiReasonText}>{rec.reason}</Text>
                  </View>
                  <View style={styles.aiActionBtn}>
                    <Plus size={16} color="#000" />
                    <Text style={styles.aiActionText}>START NOW</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCard}
              onPress={() => {
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
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  aiHeader: {
    marginBottom: 20,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aiTagText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  aiTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  aiSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  aiScroll: {
    paddingBottom: 32,
    gap: 16,
  },
  aiCard: {
    width: width * 0.7,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  aiCardGrad: {
    padding: 20,
    flex: 1,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTypeTag: {
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiTypeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  aiCardName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  aiReasonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  aiReasonText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  aiActionText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1.5,
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
    fontSize: 15,
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1.5,
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
    lineHeight: 22,
    fontWeight: '500',
  },
  workoutCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
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
    fontSize: 9,
    fontWeight: '900',
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
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  workoutStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statChip: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#252525',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
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

