import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, SPACING } from '@/constants/Theme';
import { 
  ArrowLeft, Clock, Flame, Play, ChevronLeft, 
  CheckCircle2, Circle, TrendingUp, Sparkles, Target
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeBack } from '@/utils/navigation';

const { width } = Dimensions.get('window');

const PROGRAM_EXERCISES: Record<string, any[]> = {
  strength: [
    { name: 'Warm-up Stretches', time: '5 min', completed: true },
    { name: 'Bench Press', sets: '4 sets', reps: '10 reps', completed: true },
    { name: 'Squats', sets: '4 sets', reps: '12 reps', completed: false },
    { name: 'Deadlift', sets: '3 sets', reps: '8 reps', completed: false },
    { name: 'Shoulder Press', sets: '3 sets', reps: '10 reps', completed: false },
    { name: 'Bicep Curls', sets: '3 sets', reps: '12 reps', completed: false },
    { name: 'Tricep Dips', sets: '3 sets', reps: '12 reps', completed: false },
  ],
  hiit: [
    { name: 'Warm-up Jog', time: '5 min', completed: true },
    { name: 'Burpees', sets: '3 sets', reps: '15 reps', completed: false },
    { name: 'Mountain Climbers', time: '45 sec', completed: false },
    { name: 'Jumping Jacks', time: '60 sec', completed: false },
    { name: 'High Knees', time: '45 sec', completed: false },
    { name: 'Plank Jacks', time: '45 sec', completed: false },
  ],
  yoga: [
    { name: 'Neck & Shoulder Flow', time: '5 min', completed: true },
    { name: 'Sun Salutation', sets: '5 rounds', completed: false },
    { name: 'Downward Dog', time: '2 min', completed: false },
    { name: 'Warrior Flow', time: '10 min', completed: false },
    { name: 'Balancing Poses', time: '8 min', completed: false },
    { name: 'Cool Down', time: '5 min', completed: false },
  ],
  core: [
    { name: 'Cat-Cow Stretch', time: '3 min', completed: true },
    { name: 'Plank', time: '60 sec', completed: false },
    { name: 'Russian Twists', sets: '3 sets', reps: '20 reps', completed: false },
    { name: 'Leg Raises', sets: '3 sets', reps: '15 reps', completed: false },
    { name: 'Bicycle Crunches', sets: '3 sets', reps: '20 reps', completed: false },
    { name: 'Mountain Climbers', time: '45 sec', completed: false },
  ],
};

export default function WorkoutDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const id = (params.id as string) || 'strength';
  const title = (params.title as string) || 'Training Program';
  const focus = (params.focus as string) || 'Full Body Focus';
  const level = (params.level as string) || 'Intermediate';
  const durationStr = (params.duration as string) || '45 min';
  const caloriesStr = (params.calories as string) || '400 cal';
  const accent = (params.accent as string) || Colors.primary;
  
  const [selectedDuration, setSelectedDuration] = useState('45 min');
  const [exercises, setExercises] = useState(PROGRAM_EXERCISES[id] || []);
  
  const completedCount = exercises.filter(ex => ex.completed).length;
  const progress = completedCount / exercises.length;

  const toggleExercise = (index: number) => {
    const newEx = [...exercises];
    newEx[index].completed = !newEx[index].completed;
    setExercises(newEx);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* --- Floating Back Button --- */}
      <TouchableOpacity 
        onPress={() => safeBack()} 
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <ChevronLeft size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* --- Header Image/Video Card --- */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[accent + '40', '#000']}
            style={styles.heroGrad}
          />
          <View style={styles.heroContent}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.focusText}>{focus}</Text>
              </View>
            </View>
            
            <View style={styles.videoCard}>
              <LinearGradient
                colors={['#1A1A1A', '#0A0A0A']}
                style={styles.videoInner}
              >
                <View style={styles.playCenter}>
                  <View style={[styles.playRing, { borderColor: accent + '40' }]}>
                    <Play size={32} color={accent} fill={accent} />
                  </View>
                </View>
                
                <View style={styles.durationBadge}>
                  <Clock size={12} color="#FFF" />
                  <Text style={styles.durationBadgeText}>{selectedDuration}</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* --- Stats Row --- */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Clock size={16} color={accent} />
              <Text style={styles.statChipText}>{durationStr}</Text>
            </View>
            <View style={styles.statChip}>
              <Flame size={16} color={accent} />
              <Text style={styles.statChipText}>{caloriesStr}</Text>
            </View>
            <View style={styles.statChip}>
              <TrendingUp size={16} color={accent} />
              <Text style={styles.statChipText}>{level}</Text>
            </View>
          </View>

          {/* --- Select Duration --- */}
          <Text style={styles.sectionTitle}>Select Duration</Text>
          <View style={styles.durationRow}>
            {['30 min', '45 min', '60 min'].map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.durationBtn,
                  selectedDuration === dur && { backgroundColor: accent }
                ]}
                onPress={() => setSelectedDuration(dur)}
              >
                <Text style={[
                  styles.durationBtnText,
                  selectedDuration === dur && { color: '#000', fontWeight: '900' }
                ]}>{dur}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Exercises List --- */}
          <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.exerciseProgress}>{completedCount}/{exercises.length} completed</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: Colors.primary }]} />
          </View>

          <View style={styles.exercisesList}>
            {exercises.map((ex, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.exerciseItem, ex.completed && styles.exerciseItemCompleted]}
                onPress={() => toggleExercise(idx)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, ex.completed && styles.exerciseNameDone]}>
                    {ex.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.sets ? `${ex.sets} • ${ex.reps}` : ex.time}
                  </Text>
                </View>
                {ex.completed ? (
                  <CheckCircle2 size={24} color={accent} />
                ) : (
                  <Circle size={24} color="#333" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* --- Sticky Start Workout Button --- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.startBtnWrapper}
          onPress={() => router.push(`/create-workout?type=${params.type}` as any)}
        >
          <LinearGradient
            colors={[accent, accent + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtn}
          >
            <Play size={20} color="#000" fill="#000" />
            <Text style={styles.startBtnText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    height: 400,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    paddingHorizontal: 20,
  },
  titleRow: {
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  focusText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  videoCard: {
    width: '100%',
    height: 200,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  durationBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  statChipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  durationBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#222',
  },
  durationBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseProgress: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  exerciseItemCompleted: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseNameDone: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  exerciseMeta: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  startBtnWrapper: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
  },
  startBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
