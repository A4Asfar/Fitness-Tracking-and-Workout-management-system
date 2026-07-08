import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert, TextInput 
} from 'react-native';
import { Colors } from '@/constants/Theme';
import { 
  Dumbbell, Flame, Zap, Heart, Search, Filter, Plus, Calendar, Clock
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/services/api';
import SkeletonCard from '@/components/SkeletonCard';

// Extracted Premium Components
import WorkoutCard from '@/components/workout/WorkoutCard';
import EmptyState from '@/components/workout/EmptyState';

const TYPE_ICONS: Record<string, any> = {
  Strength: Dumbbell,
  Cardio: Flame,
  HIIT: Zap,
  Yoga: Heart,
};

const TYPE_COLORS: Record<string, string> = {
  Strength: '#10B981',
  Cardio: '#FF4B4B',
  HIIT: '#00B0FF',
  Yoga: '#BD00FF',
};

export default function WorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const fetchWorkouts = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (err: any) {
      if (__DEV__) console.error('Failed to fetch workouts', err);
      setError(err.message || 'Failed to fetch workouts');
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

  const handleDeleteWorkout = async (id: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/workouts/${id}`);
              fetchWorkouts();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete workout.');
            }
          }
        }
      ]
    );
  };

  // Filter & Search Logic
  const filteredWorkouts = workouts.filter(w => {
    const matchesSearch = w.exercise.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || w.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Group Workouts dynamically
  const groupWorkouts = (list: any[]) => {
    const groups: Record<string, any[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Last Week': [],
      'Earlier': [],
    };

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    list.forEach(w => {
      const wDate = new Date(w.date);
      const wDateStr = wDate.toDateString();

      if (wDateStr === todayStr) {
        groups['Today'].push(w);
      } else if (wDateStr === yesterdayStr) {
        groups['Yesterday'].push(w);
      } else if (wDate >= startOfWeek) {
        groups['This Week'].push(w);
      } else if (wDate >= startOfLastWeek) {
        groups['Last Week'].push(w);
      } else {
        groups['Earlier'].push(w);
      }
    });

    return groups;
  };

  const grouped = groupWorkouts(filteredWorkouts);

  return (
    <View style={styles.container}>
      {/* Custom Header Area */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerSubtitle}>History Log</Text>
          <Text style={styles.headerTitle}>Workouts</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/create-workout' as any)}
          style={styles.logBtn}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <Text style={styles.logBtnText}>Log New</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Filter bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises, types..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {['All', 'Strength', 'Cardio', 'HIIT', 'Yoga'].map(type => {
            const isSelected = selectedType === type;
            const Icon = TYPE_ICONS[type];
            const color = TYPE_COLORS[type] || '#10B981';
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: color + '15', borderColor: color }
                ]}
                activeOpacity={0.8}
              >
                {Icon && <Icon size={14} color={isSelected ? color : '#64748B'} style={{ marginRight: 6 }} />}
                <Text style={[styles.chipText, isSelected && { color: color, fontWeight: '800' }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main workout history list */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {loading ? (
          <View style={{ marginTop: 10 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : filteredWorkouts.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No Matches Found" : "No Workout Sessions"}
            description={searchQuery ? "Try altering search terms or category filters." : "Log your fitness routines to track progress milestones."}
            buttonLabel="Log a Workout"
            onButtonPress={() => router.push('/create-workout' as any)}
            accentColor="#10B981"
          />
        ) : (
          Object.keys(grouped).map(groupKey => {
            const list = grouped[groupKey];
            if (list.length === 0) return null;

            return (
              <View key={groupKey} style={styles.groupSection}>
                <Text style={styles.groupHeader}>{groupKey.toUpperCase()}</Text>
                <View style={styles.groupList}>
                  {list.map(workout => (
                    <WorkoutCard
                      key={workout._id}
                      workout={workout}
                      onEditPress={() => router.push(`/workout/${workout._id}` as any)}
                      onDeletePress={() => handleDeleteWorkout(workout._id)}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  searchBarRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  chipsRow: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  groupSection: {
    marginBottom: 24,
  },
  groupHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  groupList: {
    gap: 12,
  },
});
