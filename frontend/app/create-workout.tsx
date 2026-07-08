import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  KeyboardAvoidingView, Platform, Alert, Dimensions, UIManager, LayoutAnimation
} from 'react-native';
import { Colors } from '@/constants/Theme';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Dumbbell, Clock, Flame, Zap, Trophy, Activity, Timer, Hash, HelpCircle, Check
} from 'lucide-react-native';
import { WorkoutService } from '@/services/workoutService';
import SuccessModal from '@/components/SuccessModal';
import { safeBack } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import { hapticSuccess, hapticError, hapticWarning } from '@/utils/haptics';

// Extracted Premium Components
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import WorkoutChip from '@/components/workout/WorkoutChip';
import FormSection from '@/components/workout/FormSection';
import ActionButton from '@/components/workout/ActionButton';

const { width } = Dimensions.get('window');

const TYPES = [
  { id: 'Strength', icon: Dumbbell, color: '#10B981' },
  { id: 'Cardio', icon: Flame, color: '#FF4B4B' },
  { id: 'HIIT', icon: Zap, color: '#00B0FF' },
  { id: 'Yoga', icon: Trophy, color: '#BD00FF' },
];

const fieldIcons: Record<string, any> = {
  exercise: Dumbbell,
  sets: Hash,
  reps: Activity,
  weight: Dumbbell,
  duration: Clock,
  distance: Activity,
  calories: Flame,
  speed: Zap,
  rounds: Hash,
  workTime: Clock,
  restTime: Timer,
  difficulty: Trophy
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FormFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'number';
  halfWidth?: boolean;
}

const workoutTypeConfig: Record<string, { fields: FormFieldConfig[] }> = {
  Strength: {
    fields: [
      { name: 'exercise', label: 'Exercise Name', placeholder: 'e.g. Bench Press', required: true, type: 'text' },
      { name: 'sets', label: 'Sets', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'reps', label: 'Reps', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'weight', label: 'Weight (kg)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: false, type: 'number', halfWidth: true },
    ]
  },
  Cardio: {
    fields: [
      { name: 'exercise', label: 'Exercise Name', placeholder: 'e.g. Running', required: true, type: 'text' },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'distance', label: 'Distance (km)', placeholder: '0.0', required: false, type: 'number', halfWidth: true },
      { name: 'calories', label: 'Calories Burned', placeholder: '0', required: false, type: 'number', halfWidth: true },
      { name: 'speed', label: 'Average Speed (km/h)', placeholder: '0.0', required: false, type: 'number', halfWidth: true },
    ]
  },
  HIIT: {
    fields: [
      { name: 'exercise', label: 'Exercise Name', placeholder: 'e.g. Tabata Circuit', required: true, type: 'text' },
      { name: 'rounds', label: 'Rounds', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'workTime', label: 'Work Time (sec)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'restTime', label: 'Rest Time (sec)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'duration', label: 'Total Duration (min)', placeholder: '0', required: false, type: 'number', halfWidth: true },
    ]
  },
  Yoga: {
    fields: [
      { name: 'exercise', label: 'Pose / Exercise Name', placeholder: 'e.g. Downward Dog', required: true, type: 'text' },
      { name: 'duration', label: 'Duration (min)', placeholder: '0', required: true, type: 'number', halfWidth: true },
      { name: 'difficulty', label: 'Difficulty', placeholder: 'e.g. Intermediate', required: false, type: 'text', halfWidth: true },
    ]
  }
};

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const rawType = params.type as string;
  const isValidType = TYPES.some(t => t.id.toLowerCase() === rawType?.toLowerCase());
  const type = isValidType 
    ? (TYPES.find(t => t.id.toLowerCase() === rawType.toLowerCase())?.id || 'Strength')
    : 'Strength';

  const [formValues, setFormValues] = useState<Record<string, string>>({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    distance: '',
    calories: '',
    speed: '',
    rounds: '',
    workTime: '',
    restTime: '',
    difficulty: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.exercise) {
      setFormValues((prev: Record<string, string>) => ({ ...prev, exercise: params.exercise as string }));
    }
  }, [params.exercise]);

  useEffect(() => {
    if (!rawType || !isValidType) {
      router.replace({
        pathname: '/create-workout',
        params: { ...params, type: 'Strength' }
      });
    }
  }, [rawType, isValidType]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setErrors({});
    
    setFormValues((prev: Record<string, string>) => ({
      exercise: prev.exercise,
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      distance: '',
      calories: '',
      speed: '',
      rounds: '',
      workTime: '',
      restTime: '',
      difficulty: '',
    }));
  }, [type]);

  const handleTypeChange = (newType: string) => {
    router.push({
      pathname: '/create-workout',
      params: { ...params, type: newType }
    });
  };

  const handleSave = async () => {
    const newErrors: any = {};
    const currentConfig = workoutTypeConfig[type];
    
    currentConfig.fields.forEach(field => {
      if (field.required) {
        const val = formValues[field.name];
        if (!val || !val.trim()) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      hapticWarning();
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const payload: any = {
        userId: user?._id || user?.id,
        type,
        exercise: formValues.exercise.trim(),
        date: new Date().toISOString(),
      };

      currentConfig.fields.forEach(field => {
        const val = formValues[field.name];
        if (val !== undefined && val !== null && val !== '') {
          if (field.type === 'number') {
            payload[field.name] = val.includes('.') ? parseFloat(val) : parseInt(val);
          } else {
            payload[field.name] = val;
          }
        }
      });

      await WorkoutService.logWorkout(payload);
      hapticSuccess();
      setShowSuccess(true);
    } catch (error) {
      hapticError();
      Alert.alert('Error', 'We couldn\'t complete your request right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeColor = TYPES.find(t => t.id === type)?.color || '#10B981';

  const renderFormWithSections = () => {
    const fields = workoutTypeConfig[type].fields;
    const exerciseField = fields.find(f => f.name === 'exercise');
    const metricFields = fields.filter(f => f.name !== 'exercise');

    const renderInput = (field: FormFieldConfig) => {
      const FieldIcon = fieldIcons[field.name] || HelpCircle;
      return (
        <View style={styles.inputGroup} key={field.name}>
          <Text style={styles.inputLabel}>{field.label}</Text>
          <View style={[styles.inputWrapper, errors[field.name] && styles.inputError]}>
            <FieldIcon size={18} color="#64748B" style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              placeholderTextColor="#94A3B8"
              value={formValues[field.name]}
              onChangeText={(val) => {
                setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
              }}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              selectionColor={activeColor}
            />
          </View>
          {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
        </View>
      );
    };

    const metricRows: React.ReactNode[] = [];
    let i = 0;
    while (i < metricFields.length) {
      const field = metricFields[i];
      if (field.halfWidth && i + 1 < metricFields.length && metricFields[i + 1].halfWidth) {
        const nextField = metricFields[i + 1];
        const FieldIcon = fieldIcons[field.name] || HelpCircle;
        const NextFieldIcon = fieldIcons[nextField.name] || HelpCircle;

        metricRows.push(
          <View key={`row-${field.name}-${nextField.name}`} style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <View style={[styles.inputWrapper, errors[field.name] && styles.inputError]}>
                <FieldIcon size={18} color="#64748B" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={formValues[field.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
                  }}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  selectionColor={activeColor}
                />
              </View>
              {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>{nextField.label}</Text>
              <View style={[styles.inputWrapper, errors[nextField.name] && styles.inputError]}>
                <NextFieldIcon size={18} color="#64748B" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={nextField.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={formValues[nextField.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [nextField.name]: val }));
                    if (errors[nextField.name]) setErrors((prev: any) => ({ ...prev, [nextField.name]: null }));
                  }}
                  keyboardType={nextField.type === 'number' ? 'numeric' : 'default'}
                  selectionColor={activeColor}
                />
              </View>
              {errors[nextField.name] && <Text style={styles.errorText}>{errors[nextField.name]}</Text>}
            </View>
          </View>
        );
        i += 2;
      } else {
        const FieldIcon = fieldIcons[field.name] || HelpCircle;
        metricRows.push(
          <View key={field.name} style={field.halfWidth ? styles.row : styles.inputGroup}>
            <View style={field.halfWidth ? styles.halfInput : { flex: 1, gap: 8 }}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <View style={[styles.inputWrapper, errors[field.name] && styles.inputError]}>
                <FieldIcon size={18} color="#64748B" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={formValues[field.name]}
                  onChangeText={(val) => {
                    setFormValues((prev: Record<string, string>) => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors((prev: any) => ({ ...prev, [field.name]: null }));
                  }}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  selectionColor={activeColor}
                />
              </View>
              {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
            </View>
            {field.halfWidth && <View style={styles.halfInput} />}
          </View>
        );
        i += 1;
      }
    }

    return (
      <View style={styles.formContainer}>
        {exerciseField && (
          <FormSection title="Exercise Information" subtitle="Which exercise did you perform today?">
            {renderInput(exerciseField)}
          </FormSection>
        )}

        <FormSection title="Performance Metrics" subtitle={`Key parameters for your ${type} training`}>
          <View style={styles.formSection}>{metricRows}</View>
        </FormSection>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <WorkoutHeader 
          title="Log Workout" 
          subtitle="Record your training progress"
          userName={user?.name}
          onBackPress={() => safeBack()}
        />

        <View style={styles.content}>
          {/* Segmented type selector */}
          <FormSection title="Training Type" subtitle="Select category of training activity">
            <View style={styles.typeGrid}>
              {TYPES.map((t) => (
                <WorkoutChip 
                  key={t.id}
                  label={t.id}
                  icon={t.icon}
                  selected={type === t.id}
                  activeColor={t.color}
                  onPress={() => handleTypeChange(t.id)}
                />
              ))}
            </View>
          </FormSection>

          {/* Grouped section form inputs */}
          {renderFormWithSections()}
        </View>
      </ScrollView>

      {/* Floating complete button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <ActionButton 
          label="Complete Session" 
          icon={Check}
          onPress={handleSave}
          loading={loading}
          accentColor={activeColor}
        />
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  formContainer: {
    gap: 8,
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF4D4D',
    backgroundColor: 'rgba(255, 77, 77, 0.03)',
  },
  errorText: {
    color: '#FF4D4D',
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
    paddingHorizontal: 20,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
