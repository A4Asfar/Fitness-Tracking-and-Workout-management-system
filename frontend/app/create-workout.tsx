import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, Alert, Dimensions,
  ActivityIndicator
} from 'react-native';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Dumbbell, Clock, Flame, Save, ArrowLeft, Zap, 
  Trophy, Activity, Timer, ChevronRight, Check
} from 'lucide-react-native';
import { WorkoutService } from '@/services/workoutService';
import SuccessModal from '@/components/SuccessModal';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const TYPES = [
  { id: 'Strength', icon: Dumbbell, color: '#CCFF00' },
  { id: 'Cardio', icon: Flame, color: '#FF4B4B' },
  { id: 'HIIT', icon: Zap, color: '#00D1FF' },
  { id: 'Yoga', icon: Trophy, color: '#BD00FF' },
];

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState((params.type as string) || 'Strength');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.type) setType(params.type as string);
    if (params.exercise) setExercise(params.exercise as string);
  }, [params.type, params.exercise]);

  const handleSave = async () => {
    const newErrors: any = {};
    if (!exercise.trim()) newErrors.exercise = 'Exercise name is required';
    if (!sets.trim()) newErrors.sets = 'Sets are required';
    if (!reps.trim()) newErrors.reps = 'Reps are required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await WorkoutService.logWorkout({
        userId: user?._id || user?.id,
        exercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        type,
        duration: duration ? parseInt(duration) : 0,
        date: new Date().toISOString(),
      });
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeColor = TYPES.find(t => t.id === type)?.color || Colors.primary;

  return (
    <View style={[SharedStyles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Immersive Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <LinearGradient
            colors={[activeColor + '40', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => safeBack()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerBadge}>
              <View style={[styles.dot, { backgroundColor: activeColor }]} />
              <Text style={styles.headerBadgeText}>ACTIVE SESSION</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <Text style={styles.headerTitle}>Log Workout</Text>
          <Text style={styles.headerSub}>Record your training progress</Text>
        </View>

        <View style={styles.content}>
          {/* ── Type Selection ── */}
          <Text style={styles.sectionTitle}>Workout Type</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                style={[
                  styles.typeCard, 
                  type === t.id && { backgroundColor: t.color + '20', borderColor: t.color }
                ]}
                onPress={() => setType(t.id)}
              >
                <t.icon size={20} color={type === t.id ? t.color : 'rgba(255,255,255,0.4)'} />
                <Text style={[
                  styles.typeText, 
                  type === t.id && { color: t.color, fontWeight: '800' }
                ]}>{t.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Exercise Details ── */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Name</Text>
              <View style={[styles.inputWrapper, errors.exercise && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bench Press"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={exercise}
                  onChangeText={(t) => { setExercise(t); if (errors.exercise) setErrors({...errors, exercise: null}); }}
                />
              </View>
              {errors.exercise && <Text style={styles.errorText}>{errors.exercise}</Text>}
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Sets</Text>
                <View style={[styles.inputWrapper, errors.sets && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={sets}
                    onChangeText={(t) => { setSets(t); if (errors.sets) setErrors({...errors, sets: null}); }}
                    keyboardType="numeric"
                  />
                </View>
                {errors.sets && <Text style={styles.errorText}>{errors.sets}</Text>}
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Reps</Text>
                <View style={[styles.inputWrapper, errors.reps && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={reps}
                    onChangeText={(t) => { setReps(t); if (errors.reps) setErrors({...errors, reps: null}); }}
                    keyboardType="numeric"
                  />
                </View>
                {errors.reps && <Text style={styles.errorText}>{errors.reps}</Text>}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Weight (kg)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Duration (min)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={[activeColor, activeColor + 'CC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.saveGrad}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Check size={20} color="#000" strokeWidth={3} />
                <Text style={styles.saveBtnText}>Complete Session</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <SuccessModal 
        visible={showSuccess} 
        message="Your workout has been logged successfully."
        onComplete={() => {
          setShowSuccess(false);
          safeBack('/(tabs)/');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#222',
  },
  typeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#111',
    borderRadius: 20,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#222',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF4B4B',
    backgroundColor: 'rgba(255, 75, 75, 0.05)',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 16,
  },
  saveBtn: {
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
