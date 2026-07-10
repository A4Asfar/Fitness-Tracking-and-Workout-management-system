import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Clock, Flame, Play, ChevronLeft, CheckCircle2, Circle, TrendingUp 
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
  const accent = (params.accent as string) || '#10B981';
  
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
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color="#0F172A" />
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* --- Header Image/Video Card --- */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[accent + '15', '#F8FAFC']}
            style={styles.heroGrad}
          />
          <View style={styles.heroContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.focusText}>{focus}</Text>
            </View>
            
            <View style={styles.videoCard}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.videoInner}
              >
                <View style={styles.playCenter}>
                  <View style={[styles.playRing, { borderColor: accent + '30' }]}>
                    <Play size={28} color={accent} fill={accent} />
                  </View>
                </View>
                
                <View style={styles.durationBadge}>
                  <Clock size={12} color="#0F172A" />
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
            {['30 min', '45 min', '60 min'].map((dur) => {
              const isSelected = selectedDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationBtn,
                    isSelected && { backgroundColor: accent + '10', borderColor: accent }
                  ]}
                  onPress={() => setSelectedDuration(dur)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.durationBtnText,
                    isSelected && { color: accent, fontWeight: '800' }
                  ]}>{dur}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* --- Exercises List --- */}
          <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.exerciseProgress}>{completedCount}/{exercises.length} completed</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
          </View>

          <View style={styles.exercisesList}>
            {exercises.map((ex, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.exerciseItem, ex.completed && styles.exerciseItemCompleted]}
                onPress={() => toggleExercise(idx)}
                activeOpacity={0.8}
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
                  <CheckCircle2 size={22} color={accent} />
                ) : (
                  <Circle size={22} color="#CBD5E1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* --- Sticky Start Workout Button --- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={styles.startBtnWrapper}
          onPress={() => router.push(`/create-workout?type=${params.type}` as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[accent, accent + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtn}
          >
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
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
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  heroSection: {
    height: 380,
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
    marginBottom: 20,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  focusText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  videoCard: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  videoInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  durationBadgeText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 8,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statChipText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  durationBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseProgress: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  exerciseItemCompleted: {
    backgroundColor: '#F8FAFC',
    opacity: 0.8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  exerciseNameDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  exerciseMeta: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  startBtnWrapper: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
