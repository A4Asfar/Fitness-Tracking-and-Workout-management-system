import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, ImageBackground, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Clock, Flame, Play, ChevronLeft, CheckCircle2, Circle, TrendingUp, Activity, Info, Video
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeBack } from '@/utils/navigation';

const PROGRAM_EXERCISES: Record<string, any[]> = {
  strength: [
    { name: 'Dynamic Warm-up', meta: '5 min', muscle: 'Full Body', instructions: 'Arm circles, leg swings, and light jogging.', completed: false },
    { name: 'Barbell Squat', meta: '4 sets x 8 reps', muscle: 'Quads/Glutes', instructions: 'Keep chest up, drive through heels. Brace core.', completed: false },
    { name: 'Bench Press', meta: '4 sets x 10 reps', muscle: 'Chest', instructions: 'Retract scapula, lower bar to sternum.', completed: false },
    { name: 'Deadlift', meta: '3 sets x 8 reps', muscle: 'Back/Hamstrings', instructions: 'Hinge at hips, keep back straight.', completed: false },
    { name: 'Overhead Press', meta: '3 sets x 10 reps', muscle: 'Shoulders', instructions: 'Press bar overhead, do not arch lower back excessively.', completed: false },
    { name: 'Cool Down Stretch', meta: '5 min', muscle: 'Full Body', instructions: 'Static holds for 30s each.', completed: false },
  ],
  hiit: [
    { name: 'Light Jog', meta: '3 min', muscle: 'Full Body', instructions: 'Warm up the aerobic system.', completed: false },
    { name: 'Burpees', meta: '45 sec on / 15 sec off', muscle: 'Full Body', instructions: 'Explode up, chest to floor on the way down.', completed: false },
    { name: 'Mountain Climbers', meta: '45 sec on / 15 sec off', muscle: 'Core', instructions: 'Keep hips low, drive knees to chest.', completed: false },
    { name: 'Jump Squats', meta: '45 sec on / 15 sec off', muscle: 'Legs', instructions: 'Land softly, explode upwards.', completed: false },
    { name: 'High Knees', meta: '45 sec on / 15 sec off', muscle: 'Cardio', instructions: 'Pump arms, drive knees past waist height.', completed: false },
    { name: 'Recovery Walk', meta: '3 min', muscle: 'Cardio', instructions: 'Bring heart rate down slowly.', completed: false },
  ],
  core: [
    { name: 'Cat-Cow Stretch', meta: '2 min', muscle: 'Spine', instructions: 'Mobilize the thoracic spine.', completed: false },
    { name: 'Forearm Plank', meta: '3 sets x 60 sec', muscle: 'Abs', instructions: 'Squeeze glutes, pull belly button to spine.', completed: false },
    { name: 'Russian Twists', meta: '3 sets x 20 reps', muscle: 'Obliques', instructions: 'Rotate torso, tap floor on each side.', completed: false },
    { name: 'Hanging Leg Raises', meta: '3 sets x 12 reps', muscle: 'Lower Abs', instructions: 'Do not swing, use strict core control.', completed: false },
    { name: 'Bicycle Crunches', meta: '3 sets x 20 reps', muscle: 'Abs', instructions: 'Elbow to opposite knee, fully extend other leg.', completed: false },
  ],
  yoga: [
    { name: 'Childs Pose', meta: '2 min', muscle: 'Back', instructions: 'Focus on deep diaphragmatic breathing.', completed: false },
    { name: 'Sun Salutations', meta: '5 rounds', muscle: 'Full Body', instructions: 'Flow breath to movement.', completed: false },
    { name: 'Downward Dog', meta: '2 min', muscle: 'Hamstrings/Shoulders', instructions: 'Press heels down, lift hips high.', completed: false },
    { name: 'Warrior II', meta: '1 min per side', muscle: 'Legs/Hips', instructions: 'Gaze over front middle finger, sink into front knee.', completed: false },
    { name: 'Savasana', meta: '5 min', muscle: 'Mind', instructions: 'Total relaxation.', completed: false },
  ],
  cardio: [
    { name: 'Brisk Walk', meta: '5 min', muscle: 'Legs', instructions: 'Warm up at 3.5 mph.', completed: false },
    { name: 'Steady State Run', meta: '45 min', muscle: 'Cardio', instructions: 'Maintain Zone 2 heart rate (130-140 bpm).', completed: false },
    { name: 'Cool Down Walk', meta: '10 min', muscle: 'Legs', instructions: 'Gradually reduce speed to 2.5 mph.', completed: false },
  ]
};

const ExerciseRow = ({ item, index, accent, onToggle }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
    onToggle(index);
  };

  return (
    <View style={[s.exCard, item.completed && s.exCardCompleted]}>
      <TouchableOpacity style={s.exHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={s.exInfo}>
          <Text style={[s.exName, item.completed && s.exNameDone]}>{item.name}</Text>
          <View style={s.exMetaRow}>
            <Text style={s.exMetaText}>{item.meta}</Text>
            <Text style={s.exMetaDot}>•</Text>
            <Activity size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={s.exMetaText}>{item.muscle}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.checkBtn} onPress={handleToggle}>
          <Animated.View style={{ transform: [{ scale }] }}>
            {item.completed ? (
              <CheckCircle2 size={26} color={accent} fill={`${accent}30`} />
            ) : (
              <Circle size={26} color="#475569" />
            )}
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={s.exDetails}>
          <View style={s.exDetailsBg}>
            <Info size={16} color={accent} style={{ marginTop: 2, marginRight: 8 }} />
            <Text style={s.exInstText}>{item.instructions}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default function WorkoutDetailsScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const id = (params.id as string) || 'strength';
  const title = (params.title as string) || 'Training Program';
  const focus = (params.focus as string) || 'Full Body Focus';
  const level = (params.level as string) || 'Intermediate';
  const durationStr = (params.duration as string) || '45 min';
  const caloriesStr = (params.calories as string) || '400 cal';
  const accent = (params.accent as string) || '#38BDF8';
  
  const [exercises, setExercises] = useState(PROGRAM_EXERCISES[id] || PROGRAM_EXERCISES['strength']);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const completedCount = exercises.filter(ex => ex.completed).length;
  const progressPercent = exercises.length > 0 ? (completedCount / exercises.length) : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [progressPercent]);

  const toggleExercise = (index: number) => {
    const newEx = [...exercises];
    newEx[index].completed = !newEx[index].completed;
    setExercises(newEx);
  };

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <TouchableOpacity onPress={() => safeBack()} style={[s.backBtn, { top: insets.top + 16 }]}>
        <ChevronLeft size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 , maxWidth: 1000, width: '100%', alignSelf: 'center' }}>
        
        {/* VIDEO PLACEHOLDER */}
        <View style={s.videoWrapper}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' }} 
            style={s.videoBg}
          >
            <LinearGradient colors={['rgba(15,23,42,0.4)', '#0F172A']} style={s.videoGrad}>
              <TouchableOpacity style={[s.playCircle, { borderColor: `${accent}50` }]}>
                <View style={[s.playInner, { backgroundColor: accent }]}>
                  <Play size={24} color="#0F172A" fill="#0F172A" style={{ marginLeft: 3 }} />
                </View>
              </TouchableOpacity>
              <Text style={s.videoHint}>Play Masterclass Video</Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={s.content}>
          {/* META SECTION */}
          <View style={s.headerRow}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.focus}>{focus}</Text>
          </View>

          <View style={s.badgesRow}>
            <View style={s.badge}>
              <Clock size={16} color={accent} />
              <Text style={s.badgeText}>{durationStr}</Text>
            </View>
            <View style={s.badge}>
              <Flame size={16} color={accent} />
              <Text style={s.badgeText}>{caloriesStr}</Text>
            </View>
            <View style={s.badge}>
              <TrendingUp size={16} color={accent} />
              <Text style={s.badgeText}>{level}</Text>
            </View>
          </View>

          {/* PROGRESS TRACKER */}
          <View style={s.progressSection}>
            <View style={s.progressHeader}>
              <Text style={s.progressTitle}>Workout Progress</Text>
              <Text style={s.progressText}>{completedCount} / {exercises.length} Exercises</Text>
            </View>
            <View style={s.progressBarBg}>
              <Animated.View style={[s.progressBarFill, { width: barWidth, backgroundColor: accent }]} />
            </View>
            {completedCount === exercises.length && (
              <Text style={[s.congratsText, { color: accent }]}>Workout Complete! Great job!</Text>
            )}
          </View>

          {/* EXERCISES LIST */}
          <Text style={s.sectionTitle}>Exercises</Text>
          <View style={s.exList}>
            {exercises.map((ex, idx) => (
              <ExerciseRow 
                key={idx} 
                item={ex} 
                index={idx} 
                accent={accent} 
                onToggle={toggleExercise} 
              />
            ))}
          </View>

        </View>
      </ScrollView>

      {/* STICKY BOTTOM BAR (Finish Workout) */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[s.finishBtn, completedCount === exercises.length ? { backgroundColor: accent } : { backgroundColor: '#1E293B' }]} 
          onPress={() => safeBack()}
        >
          <Text style={[s.finishBtnText, completedCount === exercises.length ? { color: '#0F172A' } : { color: '#64748B' }]}>
            {completedCount === exercises.length ? 'Finish & Save Log' : 'Save Progress & Exit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  backBtn: { position: 'absolute', left: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  videoWrapper: { width: '100%', height: 350 },
  videoBg: { width: '100%', height: '100%' },
  videoGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.4)' },
  playInner: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  videoHint: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', marginTop: 16, letterSpacing: 0.5 },

  content: { padding: 24, marginTop: -32, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#0F172A' },
  headerRow: { marginBottom: 24 },
  title: { fontSize: 32, color: '#F8FAFC', fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  focus: { fontSize: 15, color: '#94A3B8', fontWeight: '600' },
  
  badgesRow: { flexDirection: 'row', gap: 12, marginBottom: 32, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badgeText: { color: '#F8FAFC', fontSize: 13, fontWeight: '800', marginLeft: 8 },

  progressSection: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  progressText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: '#0F172A', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  congratsText: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 16 },

  sectionTitle: { fontSize: 20, color: '#F8FAFC', fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 },
  
  exList: { gap: 12 },
  exCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  exCardCompleted: { backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'transparent' },
  exHeader: { flexDirection: 'row', alignItems: 'center' },
  exInfo: { flex: 1 },
  exName: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  exNameDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  exMetaRow: { flexDirection: 'row', alignItems: 'center' },
  exMetaText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  exMetaDot: { color: '#64748B', fontSize: 14, marginHorizontal: 8 },
  checkBtn: { padding: 8 },
  
  exDetails: { marginTop: 16 },
  exDetailsBg: { backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start' },
  exInstText: { color: '#CBD5E1', fontSize: 14, lineHeight: 20, flex: 1 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.95)', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  finishBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  finishBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
