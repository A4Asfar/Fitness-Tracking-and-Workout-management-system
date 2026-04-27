import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles } from '@/constants/Theme';
import api from '@/services/api';
import { 
  History as HistoryIcon, 
  Trash2, 
  Calendar,
  Dumbbell
} from 'lucide-react-native';

interface WorkoutLog {
  _id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  date: string;
}

const EXERCISE_FILTERS = ['All', 'Push-up', 'Squat', 'Deadlift', 'Bench Press', 'Pull-up'];

export default function HistoryScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!refreshing) setLoading(true);
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to remove this workout from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/workouts/${id}`);
              setWorkouts(workouts.filter(w => w._id !== id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const filteredWorkouts = useMemo(() => {
    if (activeFilter === 'All') return workouts;
    return workouts.filter(w => w.exercise === activeFilter);
  }, [workouts, activeFilter]);

  const groupedWorkouts = useMemo(() => {
    const groups: { [key: string]: WorkoutLog[] } = {};
    filteredWorkouts.forEach(workout => {
      const dateKey = new Date(workout.date).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(workout);
    });
    return Object.entries(groups);
  }, [filteredWorkouts]);

  const renderWorkoutItem = ({ item }: { item: WorkoutLog }) => (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => router.push(`/workout/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.exerciseInfo}>
          <View style={styles.iconBox}>
            <Dumbbell size={18} color={Colors.primary} />
          </View>
          <Text style={styles.exerciseName}>{item.exercise}</Text>
        </View>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item._id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color={Colors.error} opacity={0.7} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>SETS</Text>
          <Text style={styles.detailValue}>{item.sets}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>REPS</Text>
          <Text style={styles.detailValue}>{item.reps}</Text>
        </View>
        {(item.weight !== undefined && item.weight !== null) && (
          <>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>WEIGHT</Text>
              <Text style={styles.detailValue}>{item.weight} kg</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[SharedStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen 
        options={{ 
          title: 'Workout History',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
        }} 
      />

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {EXERCISE_FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[
                styles.filterChip, 
                activeFilter === filter && styles.activeFilterChip
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText, 
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <HistoryIcon size={64} color={Colors.textSecondary} opacity={0.3} />
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySubtitle}>Start your fitness journey today!</Text>
          <TouchableOpacity 
            style={[SharedStyles.button, { width: '60%', marginTop: 30 }]}
            onPress={() => router.push('/log-workout' as any)}
          >
            <Text style={SharedStyles.buttonText}>Log Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedWorkouts}
          keyExtractor={(item) => item[0]}
          renderItem={({ item: [date, logs] }) => (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Calendar size={14} color={Colors.textSecondary} />
                <Text style={styles.sectionTitle}>{date}</Text>
              </View>
              {logs.map(log => (
                <View key={log._id}>
                  {renderWorkoutItem({ item: log })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    paddingVertical: 15,
    backgroundColor: Colors.background,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#000',
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  workoutCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 15,
    padding: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});
