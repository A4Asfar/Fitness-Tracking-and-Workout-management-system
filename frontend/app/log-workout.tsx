import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Colors, SharedStyles } from '@/constants/Theme';
import { 
  Dumbbell, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Save,
  X
} from 'lucide-react-native';
import api from '@/services/api';

const EXERCISES = [
  'Push-up',
  'Squat',
  'Deadlift',
  'Bench Press',
  'Pull-up'
];

export default function LogWorkoutScreen() {
  const router = useRouter();
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!exercise) newErrors.exercise = 'Please select an exercise';
    if (!sets) newErrors.sets = 'Sets is required';
    if (!reps) newErrors.reps = 'Reps is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    
    try {
      const workoutData = {
        exercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
      };

      await api.post('/workouts', workoutData);

      Alert.alert(
        'Success!',
        'Workout Saved Successfully',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/' as any) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Log Workout',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
        }} 
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={SharedStyles.card}>
          <View style={{ alignItems: 'center', marginBottom: 25 }}>
            <View style={styles.iconCircle}>
              <Dumbbell size={32} color={Colors.primary} />
            </View>
            <Text style={[SharedStyles.title, { marginBottom: 5 }]}>Record Set</Text>
            <Text style={SharedStyles.subtitle}>Enter your performance details</Text>
          </View>

          {/* Exercise Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exercise</Text>
            <TouchableOpacity 
              style={[styles.pickerTrigger, errors.exercise && styles.inputError]}
              onPress={() => setIsPickerVisible(true)}
            >
              <Text style={{ color: exercise ? Colors.text : Colors.textSecondary }}>
                {exercise || 'Select Exercise'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {errors.exercise && (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color={Colors.error} />
                <Text style={styles.errorText}>{errors.exercise}</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Sets Input */}
            <View style={[styles.inputGroup, { width: '48%' }]}>
              <Text style={styles.label}>Sets</Text>
              <TextInput
                style={[styles.input, errors.sets && styles.inputError]}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
              />
              {errors.sets && (
                <Text style={styles.errorText}>{errors.sets}</Text>
              )}
            </View>

            {/* Reps Input */}
            <View style={[styles.inputGroup, { width: '48%' }]}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                style={[styles.input, errors.reps && styles.inputError]}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
              />
              {errors.reps && (
                <Text style={styles.errorText}>{errors.reps}</Text>
              )}
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg) <Text style={{ color: Colors.textSecondary, fontWeight: 'normal' }}>(Optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor={Colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity 
            style={[SharedStyles.button, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={SharedStyles.buttonText}>{loading ? 'Saving...' : 'Save Workout'}</Text>
              {!loading && <Save size={20} color="#000" style={{ marginLeft: 10 }} />}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Exercise</Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={EXERCISES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.exerciseItem,
                    exercise === item && { backgroundColor: Colors.primary + '20' }
                  ]}
                  onPress={() => {
                    setExercise(item);
                    setIsPickerVisible(false);
                    if (errors.exercise) setErrors({ ...errors, exercise: '' });
                  }}
                >
                  <Text style={[
                    styles.exerciseText,
                    exercise === item && { color: Colors.primary, fontWeight: 'bold' }
                  ]}>
                    {item}
                  </Text>
                  {exercise === item && <CheckCircle2 size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 15,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerTrigger: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseItem: {
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseText: {
    color: Colors.text,
    fontSize: 16,
  }
});
