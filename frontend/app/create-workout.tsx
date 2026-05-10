import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Colors, SharedStyles, SPACING } from '@/constants/Theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dumbbell, Clock, Flame, Save, ArrowLeft, Zap, Trophy, Activity } from 'lucide-react-native';
import { WorkoutService } from '@/services/workoutService';
import SuccessModal from '@/components/SuccessModal';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';

const EXERCISES = [
  'Bench Press', 'Squats', 'Deadlift', 'Shoulder Press', 'Bicep Curls',
  'Tricep Pushdown', 'Leg Press', 'Pull Ups', 'Push Ups', 'Plank',
  'Running', 'Cycling', 'Swimming', 'Yoga Flow'
];

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

  // Sync type and exercise if params change
  React.useEffect(() => {
    if (params.type) {
      setType(params.type as string);
    }
    if (params.exercise) {
      setExercise(params.exercise as string);
    }
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[SharedStyles.container, { paddingTop: insets.top + SPACING.sm }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => safeBack('/(tabs)/')} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Workout Type</Text>
        <View style={styles.typeGrid}>
          {TYPES.map((t) => (
            <TouchableOpacity 
              key={t.id} 
              style={[
                styles.typeCard, 
                type === t.id && { borderColor: t.color, backgroundColor: `${t.color}15` }
              ]}
              onPress={() => setType(t.id)}
            >
              <t.icon size={20} color={type === t.id ? t.color : Colors.textSecondary} />
              <Text style={[
                styles.typeText, 
                type === t.id && { color: t.color, fontWeight: 'bold' }
              ]}>{t.id}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Exercise Name</Text>
          <Text style={styles.asterisk}>*</Text>
        </View>
        <TextInput
          style={[SharedStyles.input, errors.exercise && styles.inputError]}
          placeholder="e.g. Bench Press"
          placeholderTextColor={Colors.textSecondary}
          value={exercise}
          onChangeText={(t) => { setExercise(t); if (errors.exercise) setErrors({...errors, exercise: null}); }}
        />
        {errors.exercise && <Text style={styles.errorText}>{errors.exercise}</Text>}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Sets</Text>
              <Text style={styles.asterisk}>*</Text>
            </View>
            <TextInput
              style={[SharedStyles.input, errors.sets && styles.inputError]}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={sets}
              onChangeText={(t) => { setSets(t); if (errors.sets) setErrors({...errors, sets: null}); }}
              keyboardType="numeric"
            />
            {errors.sets && <Text style={styles.errorText}>{errors.sets}</Text>}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Reps</Text>
              <Text style={styles.asterisk}>*</Text>
            </View>
            <TextInput
              style={[SharedStyles.input, errors.reps && styles.inputError]}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={reps}
              onChangeText={(t) => { setReps(t); if (errors.reps) setErrors({...errors, reps: null}); }}
              keyboardType="numeric"
            />
            {errors.reps && <Text style={styles.errorText}>{errors.reps}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={SharedStyles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              style={SharedStyles.input}
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[SharedStyles.button, { marginTop: 30 }, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Save size={20} color="#000" style={{ marginRight: 10 }} />
            <Text style={SharedStyles.buttonText}>{loading ? 'Saving...' : 'Log Workout'}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <SuccessModal 
        visible={showSuccess} 
        message="Your workout has been logged successfully."
        onComplete={() => {
          setShowSuccess(false);
          safeBack('/(tabs)/');
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.lg,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    marginTop: 15,
  },
  asterisk: {
    color: '#FF4B4B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  inputError: {
    borderColor: '#FF4B4B',
    backgroundColor: '#FF4B4B08',
  },
  typeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeCard: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
