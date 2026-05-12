import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { Colors, SPACING } from '@/constants/Theme';
import { 
  Dumbbell, Flame, Zap, Heart, Target, TrendingUp, Clock, Play, ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/services/api';

const { width } = Dimensions.get('window');

const PROGRAMS = [
  {
    id: 'strength',
    title: 'Strength Training',
    type: 'Strength',
    focus: 'Upper Body Focus',
    exercises: 12,
    duration: '45-60 min',
    calories: '400-500 cal',
    level: 'Intermediate',
    icon: Dumbbell,
    colors: [Colors.primary, '#9FE800'],
    accent: Colors.primary,
  },
  {
    id: 'hiit',
    title: 'HIIT Cardio',
    type: 'HIIT',
    focus: 'Full Body HIIT',
    exercises: 8,
    duration: '20-30 min',
    calories: '350-450 cal',
    level: 'Intermediate',
    icon: Zap,
    colors: ['#39FF14', '#28CC00'],
    accent: '#39FF14',
  },
  {
    id: 'yoga',
    title: 'Yoga & Mobility',
    type: 'Yoga',
    focus: 'Flexibility & Flow',
    exercises: 15,
    duration: '30-45 min',
    calories: '150-200 cal',
    level: 'Beginner',
    icon: Heart,
    colors: ['#00FF85', '#00B35D'],
    accent: '#00FF85',
  },
  {
    id: 'core',
    title: 'Core Blast',
    type: 'Strength',
    focus: 'Abs & Core Strength',
    exercises: 10,
    duration: '25-35 min',
    calories: '250-300 cal',
    level: 'Intermediate',
    icon: Target,
    colors: ['#CCFF00', '#2E2E2E'],
    accent: '#CCFF00',
  },
];

/* --- Animated Play Button Component --- */
function AnimatedPlayButton({ accent, onPress }: { accent: string, onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.playButtonWrapper} activeOpacity={0.8}>
      <Animated.View style={[styles.playGlow, { backgroundColor: accent, opacity: 0.3, transform: [{ scale: pulse }] }]} />
      <LinearGradient
        colors={[accent, accent + 'CC']}
        style={styles.playButton}
      >
        <Play size={22} color="#FFF" fill="#FFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D1FF" />
        }
      >
        {/* --- Header --- */}
        <View style={styles.header}>
          <TrendingUp size={24} color={Colors.primary} strokeWidth={3} />
          <Text style={styles.headerTitle}>Training Programs</Text>
        </View>

        {/* --- Programs List --- */}
        <View style={styles.list}>
          {PROGRAMS.map((program) => (
            <TouchableOpacity 
              key={program.id} 
              style={styles.cardWrapper}
              activeOpacity={0.9}
              onPress={() => router.push({
                pathname: '/workout-details',
                params: { 
                  id: program.id,
                  title: program.title,
                  focus: program.focus,
                  level: program.level,
                  duration: program.duration,
                  calories: program.calories,
                  accent: program.accent,
                  type: program.type
                }
              } as any)}
            >
              <LinearGradient
                colors={program.colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardTop}>
                  <View style={styles.iconBox}>
                    <program.icon size={24} color="#FFF" />
                  </View>
                  <View style={styles.levelBadge}>
                    <Text style={[styles.levelText, { color: program.accent }]}>{program.level}</Text>
                  </View>
                </View>

                <View style={styles.cardMiddle}>
                  <Text style={styles.cardTitle}>{program.title}</Text>
                  <Text style={styles.cardExercises}>{program.exercises} exercises</Text>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.statItem}>
                    <Clock size={16} color="#FFF" opacity={0.8} />
                    <Text style={styles.statText}>{program.duration}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Flame size={16} color="#FFF" opacity={0.8} />
                    <Text style={styles.statText}>{program.calories}</Text>
                  </View>
                </View>

                {/* Animated Play Button */}
                <AnimatedPlayButton 
                  accent={program.accent} 
                  onPress={() => router.push({
                    pathname: '/workout-details',
                    params: { 
                      id: program.id,
                      title: program.title,
                      focus: program.focus,
                      level: program.level,
                      duration: program.duration,
                      calories: program.calories,
                      accent: program.accent,
                      type: program.type
                    }
                  } as any)} 
                />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- Recent Sessions --- */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#00D1FF" style={{ marginTop: 20 }} />
        ) : workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent workouts. Time to start one!</Text>
          </View>
        ) : (
          workouts.slice(0, 5).map((workout) => (
            <TouchableOpacity
              key={workout._id}
              style={styles.historyCard}
              onPress={() => router.push(`/workout/${workout._id}` as any)}
            >
              <View style={[styles.historyAccent, { backgroundColor: getAccentColor(workout.type) }]} />
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{workout.exercise}</Text>
                <Text style={styles.historyMeta}>
                  {workout.type} • {workout.sets} sets • {formatDate(workout.date)}
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getAccentColor = (type: string) => {
  switch (type) {
    case 'Strength': return '#00D1FF';
    case 'HIIT': return '#FF4B4B';
    case 'Yoga': return '#BD00FF';
    default: return '#CCFF00';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  list: {
    gap: 16,
    marginBottom: 32,
  },
  cardWrapper: {
    width: '100%',
    borderRadius: 32,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardMiddle: {
    marginTop: 12,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardExercises: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  playButtonWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  historyAccent: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
